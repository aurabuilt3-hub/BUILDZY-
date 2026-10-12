import type { 
  ConstructionTier, 
  CityPricingConfig, 
  ConstructionTierConfig, 
  LabourRateItem, 
  MaterialRateItem, 
  ContractorBidComparison 
} from '../../types/pricing';
import indiaPricing from '../../data/india-pricing.json';

export const CITIES: CityPricingConfig[] = indiaPricing.cities as CityPricingConfig[];
export const CONSTRUCTION_TIERS: ConstructionTierConfig[] = indiaPricing.constructionTiers as ConstructionTierConfig[];
export const LABOUR_RATES: LabourRateItem[] = indiaPricing.labour as LabourRateItem[];
export const MATERIAL_RATES: MaterialRateItem[] = indiaPricing.materials as MaterialRateItem[];
export const SAMPLE_CONTRACTOR_BIDS: ContractorBidComparison[] = indiaPricing.sampleContractorBids as ContractorBidComparison[];

export const DEFAULT_CITY = CITIES.find((c) => c.id === 'mumbai') || CITIES[0];

export function getCityById(cityId?: string): CityPricingConfig {
  if (!cityId) return DEFAULT_CITY;
  return CITIES.find((c) => c.id.toLowerCase() === cityId.toLowerCase()) || DEFAULT_CITY;
}

export function getTierConfig(tier: ConstructionTier): ConstructionTierConfig {
  return CONSTRUCTION_TIERS.find((t) => t.tier === tier) || CONSTRUCTION_TIERS[1]; // default Standard
}

export interface ProjectEstimateBreakdown {
  builtUpAreaSqFt: number;
  tier: ConstructionTier;
  city: CityPricingConfig;
  baseRatePerSqFt: number;
  adjustedRatePerSqFt: number;
  baseConstructionCost: number;
  architecturalFee: number; // typically 3-5%
  statutoryGst: number; // 18% on construction service
  contingencyReserve: number; // 5%
  totalEstimatedCostINR: number;
  rangeMinINR: number;
  rangeMaxINR: number;
  milestonesSchedule: {
    stage: string;
    percentage: number;
    amountINR: number;
  }[];
}

/**
 * Calculates a complete construction budget estimate for a given area, tier, and city.
 */
export function calculateConstructionEstimate(
  areaSqFt: number,
  tier: ConstructionTier = 'Standard',
  cityId: string = 'mumbai'
): ProjectEstimateBreakdown {
  const city = getCityById(cityId);
  const tierConfig = getTierConfig(tier);
  const safeArea = Math.max(100, areaSqFt);

  // Regional adjustment
  const adjustedRatePerSqFt = Math.round(tierConfig.baseRatePerSqFt * city.overallMultiplier);
  const baseConstructionCost = safeArea * adjustedRatePerSqFt;

  // Architectural / Engineering fee (~3.5%)
  const architecturalFee = Math.round(baseConstructionCost * 0.035);

  // Contingency reserve (5%)
  const contingencyReserve = Math.round(baseConstructionCost * 0.05);

  // Statutory GST (18% on construction contracts)
  const statutoryGst = Math.round(baseConstructionCost * 0.18);

  const totalEstimatedCostINR = baseConstructionCost + architecturalFee + contingencyReserve + statutoryGst;

  // Variance range (-6% to +8%)
  const rangeMinINR = Math.round(totalEstimatedCostINR * 0.94);
  const rangeMaxINR = Math.round(totalEstimatedCostINR * 1.08);

  const milestonesSchedule = [
    { stage: 'Mobilization & Foundation', percentage: 15, amountINR: Math.round(totalEstimatedCostINR * 0.15) },
    { stage: 'Ground Floor Plinth & Slab', percentage: 20, amountINR: Math.round(totalEstimatedCostINR * 0.20) },
    { stage: 'Upper Floor Slab Casting', percentage: 15, amountINR: Math.round(totalEstimatedCostINR * 0.15) },
    { stage: 'Brickwork & MEP Conduiting', percentage: 20, amountINR: Math.round(totalEstimatedCostINR * 0.20) },
    { stage: 'Plastering & Flooring Tiles', percentage: 15, amountINR: Math.round(totalEstimatedCostINR * 0.15) },
    { stage: 'Finishing, Painting & Handover', percentage: 15, amountINR: Math.round(totalEstimatedCostINR * 0.15) },
  ];

  return {
    builtUpAreaSqFt: safeArea,
    tier,
    city,
    baseRatePerSqFt: tierConfig.baseRatePerSqFt,
    adjustedRatePerSqFt,
    baseConstructionCost,
    architecturalFee,
    statutoryGst,
    contingencyReserve,
    totalEstimatedCostINR,
    rangeMinINR,
    rangeMaxINR,
    milestonesSchedule,
  };
}

/**
 * Calculates labour booking cost for individual trades or crew
 */
export function calculateLabourCost(
  roleId: string,
  workerCount: number = 1,
  durationValue: number = 1,
  durationUnit: 'hours' | 'days' = 'days',
  cityId?: string
): { totalINR: number; unitRateINR: number; roleName: string } {
  const city = getCityById(cityId);
  const labourItem = LABOUR_RATES.find((l) => l.id === roleId) || LABOUR_RATES[0];

  const baseUnitRate = durationUnit === 'days' ? labourItem.dailyRateINR : labourItem.hourlyRateINR;
  const unitRateINR = Math.round(baseUnitRate * city.labourMultiplier);
  const totalINR = unitRateINR * Math.max(1, workerCount) * Math.max(1, durationValue);

  return {
    totalINR,
    unitRateINR,
    roleName: labourItem.role,
  };
}
