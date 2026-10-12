import type { QuantityEstimationInput, QuantityEstimationOutput } from '../../types/pricing';
import indiaPricing from '../../data/india-pricing.json';

export type { QuantityEstimationOutput };

/**
 * Standard Indian residential construction quantity estimator based on CPWD norms:
 * - Cement: ~0.4 bags per sq. ft built-up area (Foundation, slab, brickwork, plastering)
 * - Steel (TMT Rebar Fe-500D): ~3.8 kg to 4.2 kg per sq. ft built-up area
 * - Sand (M-Sand / River): ~1.8 cu. ft per sq. ft built-up area
 * - Coarse Aggregate (20mm/10mm): ~1.35 cu. ft per sq. ft built-up area
 * - Bricks (Red kiln clay / AAC equivalent): ~18 to 20 bricks per sq. ft built-up area
 * - Paint: ~0.18 liters per sq. ft of built-up area (accounting for wall & ceiling surface 3x floor area)
 * - Vitrified Flooring Tiles: Carpet area (~75-80% built-up area) + 8% cutting wastage + 10% skirting & bathroom dado
 */
export function calculateMaterialQuantities(
  input: QuantityEstimationInput,
  cityId?: string
): QuantityEstimationOutput {
  const area = Math.max(100, input.builtUpAreaSqFt || 1000);
  const wasteMultiplier = 1 + (input.wasteMarginPercent ? input.wasteMarginPercent / 100 : 0.07); // default 7% waste

  // Rule-of-thumb ratios
  const cementBags = Math.round(area * 0.40 * wasteMultiplier);
  const steelKg = Math.round(area * 3.85 * wasteMultiplier);
  const sandCft = Math.round(area * 1.80 * wasteMultiplier);
  const aggregateCft = Math.round(area * 1.35 * wasteMultiplier);
  const bricksCount = Math.round(area * 19.0 * wasteMultiplier);
  const paintLiters = Math.round(area * 0.18 * wasteMultiplier);
  const tilesSqFt = Math.round(area * 0.85 * wasteMultiplier);

  // Regional material multiplier
  const city = indiaPricing.cities.find((c) => c.id === cityId);
  const matMult = city ? city.materialMultiplier : 1.0;

  // Pricing from synthetic dataset
  const cementRate = (indiaPricing.materials.find((m) => m.id === 'mat-cement-ppc')?.baseRateINR || 360) * matMult;
  const steelRate = (indiaPricing.materials.find((m) => m.id === 'mat-steel-tmt')?.baseRateINR || 68) * matMult;
  const sandRate = (indiaPricing.materials.find((m) => m.id === 'mat-m-sand')?.baseRateINR || 55) * matMult;
  const aggRate = (indiaPricing.materials.find((m) => m.id === 'mat-aggregate-20mm')?.baseRateINR || 48) * matMult;
  const bricksRate = (indiaPricing.materials.find((m) => m.id === 'mat-red-bricks')?.baseRateINR || 9.5) * matMult;
  const paintRate = (indiaPricing.materials.find((m) => m.id === 'mat-interior-paint')?.baseRateINR || 320) * matMult;
  const tileRate = (indiaPricing.materials.find((m) => m.id === 'mat-vitrified-tiles')?.baseRateINR || 75) * matMult;

  const totalCost = Math.round(
    cementBags * cementRate +
    steelKg * steelRate +
    sandCft * sandRate +
    aggregateCft * aggRate +
    bricksCount * bricksRate +
    paintLiters * paintRate +
    tilesSqFt * tileRate
  );

  return {
    builtUpAreaSqFt: area,
    cementBags,
    steelKg,
    sandCft,
    aggregateCft,
    bricksCount,
    paintLiters,
    tilesSqFt,
    estimatedMaterialCostINR: totalCost,
    assumptions: [
      `Calibrated for ${area.toLocaleString('en-IN')} sq. ft residential RCC structure`,
      `Includes ${(wasteMultiplier - 1) * 100}% contingency allowance for transit & on-site cutting waste`,
      `Cement estimated at ~0.40 bags/sq.ft for structural RCC, masonry mortar & dual-coat plastering`,
      `Primary TMT steel estimated at ~3.85 kg/sq.ft (Fe-500D grade)`,
      `Rates reflect ${city ? city.name : 'National Baseline'} material price indices with statutory taxes`
    ],
  };
}
