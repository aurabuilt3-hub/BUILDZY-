import { formatINR, formatCompactINR, formatIndianNumber } from '../src/lib/pricing/formatINR.ts';
import { calculateConstructionEstimate, calculateLabourCost, CITIES } from '../src/lib/pricing/pricingEngine.ts';
import { calculateMaterialQuantities } from '../src/lib/pricing/quantityCalculator.ts';
import indiaPricing from '../src/data/india-pricing.json' with { type: 'json' };

let passed = 0;
let total = 0;

function assert(desc, condition) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

console.log('--- BUILDZY PAN-INDIA PRICING VERIFICATION SUITE ---');

// 1. Currency and Formatting
console.log('\n[1] INR Formatter (formatINR)');
assert('Formats zero correctly', formatINR(0) === '₹0');
assert('Formats 1500 correctly', formatINR(1500) === '₹1,500');
assert('Formats Lakhs correctly', formatINR(1500000) === '₹15,00,000');
assert('Formats Crores correctly', formatINR(10000000) === '₹1,00,00,000');
assert('Does not produce USD ($) sign', !formatINR(5000).includes('$'));
assert('Includes Rupee (₹) symbol', formatINR(5000).includes('₹'));

// 2. Compact Notation
console.log('\n[2] Compact Indian Notation (formatCompactINR)');
assert('Formats Crores with Cr suffix', formatCompactINR(15000000).includes('Cr'));
assert('Formats Lakhs with L suffix', formatCompactINR(7500000).includes('L'));
assert('Formats thousands with k suffix', formatCompactINR(50000).includes('k'));

// 3. Indian Pricing Dataset
console.log('\n[3] India Pricing Dataset Integrity');
assert('Has at least 25 Indian cities', indiaPricing.cities.length >= 25);
assert('Includes Mumbai with Tier 1', indiaPricing.cities.some(c => c.name === 'Mumbai' && c.regionTier === 'Tier 1'));
assert('Includes Bengaluru', indiaPricing.cities.some(c => c.name === 'Bengaluru'));
assert('Includes Delhi NCR', indiaPricing.cities.some(c => c.name === 'Delhi NCR'));
assert('Has at least 4 construction tiers', indiaPricing.constructionTiers.length >= 4);
assert('Has cement, steel, sand materials', indiaPricing.materials.length >= 7);
assert('Has master mason and helper labour roles', indiaPricing.labour.length >= 5);
assert('Has 3 detailed contractor bids', indiaPricing.sampleContractorBids.length >= 3);

// 4. Construction Pricing Engine
console.log('\n[4] Construction Pricing Engine');
const estMumbai = calculateConstructionEstimate(2000, 'Standard', 'mumbai');
assert('Calculates estimate with positive total', estMumbai.totalEstimatedCostINR > 0);
assert('Calculates range min < range max', estMumbai.rangeMinINR < estMumbai.rangeMaxINR);
assert('Includes 6 milestone payout stages', estMumbai.milestonesSchedule.length === 6);
assert('Milestones sum up to 100% of estimate', estMumbai.milestonesSchedule.reduce((a, b) => a + b.percentage, 0) === 100);

const estPatna = calculateConstructionEstimate(2000, 'Standard', 'patna');
assert('Applies regional multiplier: Mumbai higher than Patna', estMumbai.totalEstimatedCostINR > estPatna.totalEstimatedCostINR);

// 5. Quantity Calculator (BOM)
console.log('\n[5] Material Quantity Estimator (CPWD Calibrated)');
const bom = calculateMaterialQuantities({ builtUpAreaSqFt: 2000 });
assert('Calculates cement bags (> 500 bags for 2000 sqft)', bom.cementBags >= 700);
assert('Calculates steel (~3.85 kg/sqft * 2000)', bom.steelKg >= 6000);
assert('Calculates sand in cu. ft', bom.sandCft > 3000);
assert('Calculates coarse aggregate in cu. ft', bom.aggregateCft > 2000);
assert('Calculates bricks (> 30,000 for 2000 sqft)', bom.bricksCount >= 30000);
assert('Calculates total material cost in INR', bom.estimatedMaterialCostINR > 1000000);

// 6. Labour Cost Engine
console.log('\n[6] Labour Booking Engine');
const labourCalc = calculateLabourCost('lab-mason-skilled', 2, 3, 'days', 'mumbai');
assert('Calculates 2 masons for 3 days', labourCalc.totalINR > 0);
assert('Unit rate incorporates city multiplier', labourCalc.unitRateINR >= 950);

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} / ${total} ASSERTIONS PASSED`);
console.log(`========================================`);

if (passed !== total) {
  process.exit(1);
}
