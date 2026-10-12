/**
 * Buildzy Backend Estimation & Price Snapshot Service
 * Manages immutable versioned estimates, snapshots, and database synchronization.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CompleteAiEstimationResult } from '../lib/pricing/aiEstimationService';

export interface SavedEstimateRecord {
  id: string;
  projectId?: string;
  customerId: string;
  title: string;
  projectType: string;
  cityId: string;
  builtUpAreaSqFt: number;
  tier: string;
  activeVersion: number;
  totalEstimatedCost: number;
  createdAt: string;
}

export const estimationService = {
  /**
   * Saves an immutable estimate version and its line items to Supabase,
   * falling back to local storage if offline or unconfigured.
   */
  async saveEstimateVersion(
    estimationResult: CompleteAiEstimationResult,
    customerId: string,
    projectId?: string
  ): Promise<{ estimateId: string; versionNumber: number; error: string | null }> {
    const { scope, financialEstimate, materialQuantities } = estimationResult;

    if (!isSupabaseConfigured) {
      // Local fallback save
      const fallbackId = 'est-local-' + Date.now();
      try {
        const existing = JSON.parse(localStorage.getItem('buildzy_saved_estimates_v1') || '[]');
        existing.unshift({
          id: fallbackId,
          projectId,
          customerId,
          title: scope.projectTitle,
          projectType: scope.detectedCategory,
          cityId: financialEstimate.city.id,
          builtUpAreaSqFt: financialEstimate.builtUpAreaSqFt,
          tier: scope.recommendedTier,
          activeVersion: 1,
          totalEstimatedCost: financialEstimate.totalEstimatedCostINR,
          createdAt: new Date().toISOString(),
          details: estimationResult,
        });
        localStorage.setItem('buildzy_saved_estimates_v1', JSON.stringify(existing.slice(0, 10)));
      } catch (e) {
        console.warn('Local storage save failed:', e);
      }
      return { estimateId: fallbackId, versionNumber: 1, error: null };
    }

    try {
      // 1. Create or fetch parent estimate
      const { data: estData, error: estError } = await supabase
        .from('estimates')
        .insert({
          project_id: projectId || null,
          customer_id: customerId,
          title: scope.projectTitle,
          project_type: scope.detectedCategory,
          city_id: financialEstimate.city.id,
          built_up_area_sq_ft: financialEstimate.builtUpAreaSqFt,
          tier: scope.recommendedTier,
          active_version: 1,
        })
        .select()
        .single();

      if (estError) throw estError;

      // 2. Insert immutable estimate version
      const { data: verData, error: verError } = await supabase
        .from('estimate_versions')
        .insert({
          estimate_id: estData.id,
          version_number: 1,
          base_civil_cost: financialEstimate.baseConstructionCost,
          architectural_fee: financialEstimate.architecturalFee,
          contingency_reserve: financialEstimate.contingencyReserve,
          statutory_gst: financialEstimate.statutoryGst,
          total_estimated_cost: financialEstimate.totalEstimatedCostINR,
          range_min: financialEstimate.rangeMinINR,
          range_max: financialEstimate.rangeMaxINR,
          input_assumptions: {
            scope,
            cementBags: materialQuantities.cementBags,
            steelKg: materialQuantities.steelKg,
            formulaVersion: 'cpwd_v1_deterministic',
          },
          created_by: customerId,
        })
        .select()
        .single();

      if (verError) throw verError;

      // 3. Insert line items
      const lineItems = [
        {
          estimate_version_id: verData.id,
          category: 'Labour & Civil',
          item_name: 'Core Structural RCC & Superstructure Works',
          quantity: financialEstimate.builtUpAreaSqFt,
          unit: 'sq. ft',
          unit_rate: financialEstimate.adjustedRatePerSqFt,
          amount: financialEstimate.baseConstructionCost,
          provenance: 'synthetic_demo',
          is_gst_applicable: true,
          gst_rate: 0.18,
          assumptions: 'CPWD standard schedule benchmark',
        },
        {
          estimate_version_id: verData.id,
          category: 'Architectural',
          item_name: 'Architectural & Engineering Drawings Vetting',
          quantity: 1,
          unit: 'Lump Sum',
          unit_rate: financialEstimate.architecturalFee,
          amount: financialEstimate.architecturalFee,
          provenance: 'market_reference',
          is_gst_applicable: true,
          gst_rate: 0.18,
          assumptions: 'Calculated at 3.5% of base structural expenditure',
        },
        {
          estimate_version_id: verData.id,
          category: 'Contingency',
          item_name: 'Unforeseen Civil & Transit Contingency Reserve',
          quantity: 1,
          unit: 'Lump Sum',
          unit_rate: financialEstimate.contingencyReserve,
          amount: financialEstimate.contingencyReserve,
          provenance: 'synthetic_demo',
          is_gst_applicable: false,
          gst_rate: 0.00,
          assumptions: 'Standard 5% buffer recommended before groundbreak',
        },
        {
          estimate_version_id: verData.id,
          category: 'Tax',
          item_name: 'Statutory GST on Construction Contracts',
          quantity: 1,
          unit: 'Tax Amount',
          unit_rate: financialEstimate.statutoryGst,
          amount: financialEstimate.statutoryGst,
          provenance: 'verified_live',
          is_gst_applicable: false,
          gst_rate: 0.00,
          assumptions: '18% GST pursuant to Indian tax classification',
        },
      ];

      const { error: lineError } = await supabase.from('estimate_line_items').insert(lineItems);
      if (lineError) console.warn('Non-fatal line item insert warning:', lineError);

      return { estimateId: estData.id, versionNumber: 1, error: null };
    } catch (err: any) {
      console.error('Error saving estimate to Supabase:', err);
      return { estimateId: '', versionNumber: 0, error: err.message || 'Failed to save estimate' };
    }
  },

  /**
   * Retrieves saved estimates for the current user
   */
  async fetchUserEstimates(customerId: string): Promise<SavedEstimateRecord[]> {
    if (!isSupabaseConfigured) {
      try {
        return JSON.parse(localStorage.getItem('buildzy_saved_estimates_v1') || '[]');
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          id, project_id, customer_id, title, project_type, city_id,
          built_up_area_sq_ft, tier, active_version, created_at,
          estimate_versions ( total_estimated_cost )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        projectId: row.project_id,
        customerId: row.customer_id,
        title: row.title,
        projectType: row.project_type,
        cityId: row.city_id,
        builtUpAreaSqFt: Number(row.built_up_area_sq_ft),
        tier: row.tier,
        activeVersion: row.active_version,
        totalEstimatedCost: row.estimate_versions?.[0]?.total_estimated_cost || 0,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('Failed to fetch estimates from Supabase:', err);
      return [];
    }
  },
};
