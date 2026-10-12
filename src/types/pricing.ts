export type ConstructionTier = 'Basic' | 'Standard' | 'Premium' | 'Luxury';

export type IndianRegionTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export interface CityPricingConfig {
  id: string;
  name: string;
  state: string;
  regionTier: IndianRegionTier;
  labourMultiplier: number;
  materialMultiplier: number;
  overallMultiplier: number;
  popular?: boolean;
}

export interface ConstructionTierConfig {
  tier: ConstructionTier;
  name: string;
  tagline: string;
  baseRatePerSqFt: number; // in INR
  idealFor: string;
  specifications: {
    structure: string;
    flooring: string;
    doorsWindows: string;
    electrical: string;
    plumbingSanitary: string;
    painting: string;
    kitchen: string;
  };
  sampleBrands: string[];
  warrantyYears: number;
}

export interface MaterialRateItem {
  id: string;
  name: string;
  category: 'Cement' | 'Steel' | 'Sand' | 'Aggregate' | 'Bricks' | 'Paint' | 'Tiles' | 'Electrical' | 'Plumbing';
  standardUnit: string;
  baseRateINR: number;
  hsnCode?: string;
  gstRate: number; // e.g. 0.18 or 0.28
  commonBrands?: string[];
  notes?: string;
}

export interface LabourRateItem {
  id: string;
  role: string;
  category: 'Civil' | 'Finishing' | 'MEP' | 'General';
  skillLevel: 'Skilled' | 'Semi-Skilled' | 'Unskilled';
  dailyRateINR: number; // 8-hour shift in INR
  hourlyRateINR: number;
  crewRecommendation?: string;
}

export interface ContractorBidComparison {
  id: string;
  contractorId: string;
  contractorName: string;
  tier: ConstructionTier;
  builtUpAreaSqFt: number;
  baseRatePerSqFt: number;
  totalEstimateINR: number;
  scopeItems: string[];
  exclusionItems: string[];
  paymentMilestones: {
    stage: string;
    percentage: number;
    amountINR: number;
    description: string;
  }[];
  materialBrands: {
    category: string;
    brand: string;
    grade: string;
  }[];
  contingencyPercent: number;
  statutoryGstPercent: number;
  durationMonths: number;
  warrantyYears: number;
}

export interface QuantityEstimationInput {
  builtUpAreaSqFt: number;
  carpetAreaSqFt?: number;
  floors?: number;
  wallAreaSqFt?: number;
  ceilingAreaSqFt?: number;
  tileAreaSqFt?: number;
  wasteMarginPercent?: number; // e.g., 5-10%
}

export interface QuantityEstimationOutput {
  builtUpAreaSqFt: number;
  cementBags: number; // 50kg bags (~0.4 bags/sqft)
  steelKg: number; // TMT steel (~3.5-4 kg/sqft)
  sandCft: number; // River / M-sand (~1.8 cft/sqft)
  aggregateCft: number; // 20mm/10mm gravel (~1.35 cft/sqft)
  bricksCount: number; // Red clay / AAC blocks (~18-20 per sqft)
  paintLiters: number; // Primer + 2 coats emulsified
  tilesSqFt: number; // Flooring + skirting + bathroom dado with waste
  estimatedMaterialCostINR: number;
  assumptions: string[];
}
