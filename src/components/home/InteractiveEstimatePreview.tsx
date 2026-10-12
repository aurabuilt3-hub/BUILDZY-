import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  ArrowRight, 
  Info
} from 'lucide-react';
import { formatINR } from '../../lib/pricing/formatINR';
import { 
  CITIES, 
  calculateConstructionEstimate, 
  CONSTRUCTION_TIERS 
} from '../../lib/pricing/pricingEngine';
import type { ConstructionTier } from '../../types/pricing';

export const InteractiveEstimatePreview: React.FC = () => {
  const navigate = useNavigate();

  const [selectedCityId, setSelectedCityId] = useState<string>('mumbai');
  const [projectCategory, setProjectCategory] = useState<string>('villa');
  const [areaSqFt, setAreaSqFt] = useState<number>(2000);
  const [selectedTier, setSelectedTier] = useState<ConstructionTier>('Standard');

  // Compute estimate using the official shared pricingEngine
  const estimate = calculateConstructionEstimate(areaSqFt, selectedTier, selectedCityId);

  // Quick area presets based on project category
  const handleCategoryChange = (cat: string) => {
    setProjectCategory(cat);
    if (cat === 'apartment') setAreaSqFt(1200);
    else if (cat === 'villa') setAreaSqFt(2200);
    else if (cat === 'floor') setAreaSqFt(900);
    else if (cat === 'remodel') setAreaSqFt(1400);
  };

  const handleContinueWithEstimate = () => {
    // Navigate to /plan-project with configured values passed
    navigate(`/plan-project?area=${areaSqFt}&city=${selectedCityId}&tier=${selectedTier}`);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#F5F9FF] border-b border-[#E3EAF4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Transparent Pricing Engine
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
            Interactive Project Cost Calculator
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Calculate realistic budget benchmarks for Indian residential construction using CPWD-calibrated city multipliers and transparent material tiers.
          </p>
        </div>

        {/* 2-Column Calculator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft">
            <h3 className="text-lg font-bold text-navy-900 mb-5 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-500" />
              <span>Configure Project Parameters</span>
            </h3>

            {/* Parameter 1: City Selection */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target City / Region
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Regional index: {estimate.city.overallMultiplier}x
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CITIES.slice(0, 8).map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setSelectedCityId(city.id)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                      selectedCityId === city.id
                        ? 'border-brand-500 bg-brand-50/80 text-brand-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="block truncate">{city.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{city.regionTier}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter 2: Project Type Archetype */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Project Archetype
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'villa', label: 'Independent Villa', hint: 'G+1 / G+2 home' },
                  { id: 'apartment', label: '2BHK / 3BHK Apartment', hint: 'Turnkey interior & civil' },
                  { id: 'floor', label: 'Floor Extension', hint: 'Additional floor / terrace' },
                  { id: 'remodel', label: 'Civil Remodel', hint: 'Comprehensive retrofit' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategoryChange(item.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      projectCategory === item.id
                        ? 'border-brand-500 bg-brand-50/70 text-navy-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="text-[10px] text-slate-500">{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter 3: Built-Up Area Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Built-Up Area (sq. ft)
                </label>
                <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 px-3 py-1 rounded-xl">
                  <span className="text-sm font-extrabold text-brand-700">{areaSqFt.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-brand-600 font-medium">sq. ft</span>
                </div>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={100}
                value={areaSqFt}
                onChange={(e) => setAreaSqFt(Number(e.target.value))}
                className="w-full accent-brand-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>500 sq. ft (Compact)</span>
                <span>2,000 sq. ft (Standard Villa)</span>
                <span>5,000 sq. ft (Large Estate)</span>
              </div>
            </div>

            {/* Parameter 4: Specification Tier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Specification & Quality Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CONSTRUCTION_TIERS.map((tierConfig) => (
                  <button
                    key={tierConfig.tier}
                    type="button"
                    onClick={() => setSelectedTier(tierConfig.tier)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedTier === tierConfig.tier
                        ? 'border-brand-500 bg-brand-50/80 ring-2 ring-brand-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold text-navy-900">{tierConfig.name}</span>
                    <span className="text-[10px] text-brand-600 font-semibold block">₹{tierConfig.baseRatePerSqFt}/sq.ft</span>
                    <span className="text-[9px] text-slate-400 block truncate">{tierConfig.idealFor}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Breakdown & Result Output Column */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                    Live Shared Engine Output
                  </span>
                  <h4 className="text-lg font-extrabold text-navy-900 mt-1">
                    Indicative Budget Benchmark
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block">Effective Rate</span>
                  <span className="text-xs font-extrabold text-navy-900">
                    ₹{estimate.adjustedRatePerSqFt.toLocaleString('en-IN')} / sq. ft
                  </span>
                </div>
              </div>

              {/* Big Estimated Total with Range */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F5F9FF] to-[#EBF3FC] border border-brand-200/80 mb-5">
                <span className="text-xs text-slate-500 font-medium block">
                  Estimated Total Project Cost ({estimate.city.name})
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight my-1">
                  {formatINR(estimate.totalEstimatedCostINR)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-brand-200/50 mt-2">
                  <span>Indicative Range (-6% to +8%):</span>
                  <span className="font-bold text-navy-900">
                    {formatINR(estimate.rangeMinINR)} &ndash; {formatINR(estimate.rangeMaxINR)}
                  </span>
                </div>
              </div>

              {/* Transparent Cost Breakdown Table */}
              <div className="space-y-2 mb-6 text-xs">
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">Core Civil & Superstructure</span>
                  <span className="font-bold text-navy-900">{formatINR(estimate.baseConstructionCost)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">Architectural & Structural Vetting (~3.5%)</span>
                  <span className="font-bold text-navy-900">{formatINR(estimate.architecturalFee)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">Unforeseen Contingency Reserve (5%)</span>
                  <span className="font-bold text-navy-900">{formatINR(estimate.contingencyReserve)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">Statutory GST on Construction (18%)</span>
                  <span className="font-bold text-navy-900">{formatINR(estimate.statutoryGst)}</span>
                </div>
              </div>

              {/* Demo Estimate Caveat & Disclosures */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-6 flex items-start gap-2.5 text-[11px] text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-bold">Illustrative Demo Estimate:</span> Calculated using standard CPWD-aligned city multipliers. Excludes municipal sanction fees, external transformer deposits, and luxury interior furnishings.
                </p>
              </div>

              {/* Direct Connected Action to Plan Project */}
              <button
                type="button"
                onClick={handleContinueWithEstimate}
                className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm sm:text-base py-3.5 rounded-xl shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Step-by-Step Project Planner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
