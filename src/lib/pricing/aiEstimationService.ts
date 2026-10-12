/**
 * AI Estimation & Scope Clarification Workflow Service
 * Interprets natural language requirement prompts, formulates targeted questions,
 * structures project scopes, and provides transparent explanations.
 * Operates in two modes:
 * 1. Supabase Edge Function / LLM endpoint (when server-side AI credentials exist)
 * 2. Deterministic Rule-Based Assistant (offline / demo showcase mode)
 */

import { calculateConstructionEstimate, type ProjectEstimateBreakdown } from './pricingEngine';
import { calculateMaterialQuantities, type QuantityEstimationOutput } from './quantityCalculator';
import { calculateCriticalPathSchedule, type ProjectScheduleForecast } from './schedulingEngine';

export interface NaturalLanguageRequirementInput {
  userPrompt: string;
  projectCity?: string;
  estimatedAreaSqFt?: number;
  qualityTier?: 'Basic' | 'Standard' | 'Premium';
}

export interface ScopeClarificationQuestion {
  id: string;
  question: string;
  context: string;
  options: string[];
  defaultChoice: string;
}

export interface StructuredScopeProposal {
  detectedCategory: 'New Construction' | 'Home Renovation' | 'Room Improvement' | 'Civil Maintenance';
  projectTitle: string;
  recommendedAreaSqFt: number;
  recommendedTier: 'Basic' | 'Standard' | 'Premium';
  inclusions: string[];
  exclusions: string[];
  unresolvedDecisions: string[];
  targetedQuestions: ScopeClarificationQuestion[];
  isDeterministicFallback: boolean;
  modelIdentifier: string;
}

export interface CompleteAiEstimationResult {
  scope: StructuredScopeProposal;
  financialEstimate: ProjectEstimateBreakdown;
  materialQuantities: QuantityEstimationOutput;
  scheduleForecast: ProjectScheduleForecast;
  aiExplanation: string;
  timestamp: string;
}

export const aiEstimationService = {
  /**
   * Async interpretation that calls the backend Gemini API server with transparent deterministic fallback.
   */
  async interpretRequirementAsync(input: NaturalLanguageRequirementInput): Promise<StructuredScopeProposal> {
    try {
      const response = await fetch('/api/ai/interpret-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.scope) {
          return data.scope as StructuredScopeProposal;
        }
      }
    } catch {
      // Backend server unavailable or offline, proceed to deterministic fallback
    }

    return this.interpretRequirement(input);
  },

  /**
   * Interprets user requirements and generates a structured scope proposal with targeted questions.
   */
  interpretRequirement(input: NaturalLanguageRequirementInput): StructuredScopeProposal {

    const prompt = (input.userPrompt || '').toLowerCase();

    let detectedCategory: StructuredScopeProposal['detectedCategory'] = 'New Construction';
    let defaultArea = input.estimatedAreaSqFt || 2000;
    let defaultTier = input.qualityTier || 'Standard';

    // Heuristic natural language parsing
    if (prompt.includes('renovat') || prompt.includes('remodel') || prompt.includes('overhaul')) {
      detectedCategory = 'Home Renovation';
      defaultArea = input.estimatedAreaSqFt || 1400;
    } else if (prompt.includes('kitchen') || prompt.includes('bathroom') || prompt.includes('terrace')) {
      detectedCategory = 'Room Improvement';
      defaultArea = input.estimatedAreaSqFt || 600;
    } else if (prompt.includes('repair') || prompt.includes('leak') || prompt.includes('maintenance') || prompt.includes('crack')) {
      detectedCategory = 'Civil Maintenance';
      defaultArea = input.estimatedAreaSqFt || 300;
    }

    if (prompt.includes('luxury') || prompt.includes('premium') || prompt.includes('high end')) {
      defaultTier = 'Premium';
    } else if (prompt.includes('budget') || prompt.includes('economy') || prompt.includes('low cost')) {
      defaultTier = 'Basic';
    }

    // Extract numerical square footage if stated in prompt e.g., "1500 sq ft" or "2400 sqft"
    const areaMatch = prompt.match(/(\d{3,5})\s*(?:sq|sqft|sq\s*ft|square\s*feet)/);
    if (areaMatch && areaMatch[1]) {
      const parsed = parseInt(areaMatch[1], 10);
      if (parsed >= 100 && parsed <= 20000) {
        defaultArea = parsed;
      }
    }

    const targetedQuestions: ScopeClarificationQuestion[] = [
      {
        id: 'q-soil',
        question: 'Has a soil-bearing capacity or structural foundation test been conducted on the site?',
        context: 'Affects foundation depth, RCC pile requirements, and initial civil contingency.',
        options: ['Yes, geotechnical report available', 'No, standard shallow footing assumed', 'Site is rocky / hard strata'],
        defaultChoice: 'No, standard shallow footing assumed',
      },
      {
        id: 'q-materials-handling',
        question: 'Is heavy cement/steel transit truck access permitted directly up to the plot boundary?',
        context: 'Manual double-handling by beldars increases labour expenditure if roads are narrow.',
        options: ['Direct road access (Transit mixer allowed)', 'Narrow road (Manual trolley carry required)', 'Restricted municipal entry hours'],
        defaultChoice: 'Direct road access (Transit mixer allowed)',
      },
      {
        id: 'q-sanctions',
        question: 'Are municipal sanction scrutiny fees and temporary power connections accounted for separately?',
        context: 'Statutory approvals vary widely across municipalities and are excluded from contractor base civil rates.',
        options: ['Excluded from contract (Handled by owner)', 'Include turnkey architect sanction liaison', 'Already approved'],
        defaultChoice: 'Excluded from contract (Handled by owner)',
      },
    ];

    const inclusions = [
      'Site topographic survey and soil compaction check',
      'Structural RCC superstructure with Grade-500 TMT rebar',
      'Class-A brickwork / AAC partition walls with sand-faced plastering',
      'Concealed electrical and plumbing rough-in conduits',
      '14-day mandatory concrete slab water curing protocol',
    ];

    const exclusions = [
      'Municipal sanction scrutiny fees and electricity board grid connection charges',
      'Interior modular kitchen wood carpentry and movable loose furniture',
      'External landscaping and borewell drilling beyond the building plinth',
    ];

    const unresolvedDecisions = [
      'Selection between Kiln Red Clay Bricks vs. Autoclaved Aerated Concrete (AAC) blocks',
      'Epoxy grouting brand selection for bathroom tile waterproofing',
      'Roof rainwater harvesting pit sizing',
    ];

    return {
      detectedCategory,
      projectTitle: `${defaultTier} ${detectedCategory} (${defaultArea} sq. ft)`,
      recommendedAreaSqFt: defaultArea,
      recommendedTier: defaultTier,
      inclusions,
      exclusions,
      unresolvedDecisions,
      targetedQuestions,
      isDeterministicFallback: true,
      modelIdentifier: 'rule_based_assistant_v1',
    };
  },

  /**
   * Generates complete calculation package: deterministic financials + materials + schedule + plain-language explanation.
   */
  generateCompleteEstimate(input: NaturalLanguageRequirementInput): CompleteAiEstimationResult {
    const scope = this.interpretRequirement(input);
    const cityId = input.projectCity || 'mumbai';

    const financialEstimate = calculateConstructionEstimate(
      scope.recommendedAreaSqFt,
      scope.recommendedTier,
      cityId
    );

    const materialQuantities = calculateMaterialQuantities(
      { builtUpAreaSqFt: scope.recommendedAreaSqFt },
      cityId
    );

    const scheduleForecast = calculateCriticalPathSchedule(scope.recommendedAreaSqFt);

    const aiExplanation = `Based on your ${scope.recommendedAreaSqFt} sq. ft ${scope.detectedCategory.toLowerCase()} project in ${financialEstimate.city.name}, the indicative budget benchmark is ${financialEstimate.totalEstimatedCostINR.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} under the ${scope.recommendedTier} specification. This incorporates CPWD standard ratios including ~${materialQuantities.cementBags} cement bags, ${materialQuantities.steelKg.toLocaleString('en-IN')} kg of Fe-500D steel, and an estimated ${scheduleForecast.totalMonthsEstimate} month construction window driven by a ${scheduleForecast.totalCalendarDays}-day critical path schedule with ${scheduleForecast.curingBufferDaysTotal} mandatory concrete curing days.`;

    return {
      scope,
      financialEstimate,
      materialQuantities,
      scheduleForecast,
      aiExplanation,
      timestamp: new Date().toISOString(),
    };
  },
};
