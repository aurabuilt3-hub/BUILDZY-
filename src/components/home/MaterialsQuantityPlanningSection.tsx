import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ArrowRight, 
  Info, 
  ShieldCheck
} from 'lucide-react';
import { formatINR } from '../../lib/pricing/formatINR';
import { calculateMaterialQuantities } from '../../lib/pricing/quantityCalculator';

export const MaterialsQuantityPlanningSection: React.FC = () => {
  const navigate = useNavigate();
  const [demoArea, setDemoArea] = useState<number>(2000);

  // Compute materials using official quantityCalculator
  const materialsData = calculateMaterialQuantities({ builtUpAreaSqFt: demoArea }, 'mumbai');

  const materialItems = [
    {
      name: 'Grade-53 Portland Pozzolana Cement (PPC)',
      category: 'Cement',
      qty: `${materialsData.cementBags.toLocaleString('en-IN')} Bags`,
      approxWeight: '~20.5 Metric Tons',
      spec: 'UltraTech Super / Ambuja Plus',
      norm: '0.40 bags / sq. ft',
      stage: 'Foundation, Slab & Plaster',
    },
    {
      name: 'Fe-500D Primary TMT Reinforcement Steel',
      category: 'Steel',
      qty: `${materialsData.steelKg.toLocaleString('en-IN')} kg`,
      approxWeight: `~${(materialsData.steelKg / 1000).toFixed(1)} Metric Tons`,
      spec: 'Tata Tiscon / JSW Neosteel',
      norm: '3.85 kg / sq. ft',
      stage: 'Column, Beam & Slab Cage',
    },
    {
      name: 'Manufactured Concrete Sand (M-Sand)',
      category: 'Sand',
      qty: `${materialsData.sandCft.toLocaleString('en-IN')} cu. ft`,
      approxWeight: 'Washed zone-II grit',
      spec: 'River Sand Equivalent (CPWD Compliant)',
      norm: '1.80 cft / sq. ft',
      stage: 'Masonry Mortar & RCC',
    },
    {
      name: 'Crushed Coarse Blue Aggregate (20mm & 10mm)',
      category: 'Aggregate',
      qty: `${materialsData.aggregateCft.toLocaleString('en-IN')} cu. ft`,
      approxWeight: 'Graded granite metal',
      spec: 'Machine-crushed basalt metal',
      norm: '1.35 cft / sq. ft',
      stage: 'Structural Concrete Casting',
    },
    {
      name: 'Kiln-Fired Red Clay Bricks / AAC Blocks',
      category: 'Bricks',
      qty: `${materialsData.bricksCount.toLocaleString('en-IN')} Units`,
      approxWeight: 'Standard modular size',
      spec: 'Class-A kiln bricks / 8-inch AAC blocks',
      norm: '19 units / sq. ft',
      stage: 'External & Internal Partition Walls',
    },
    {
      name: 'Double-Charged Glazed Vitrified Tiles (GVT)',
      category: 'Flooring',
      qty: `${materialsData.tilesSqFt.toLocaleString('en-IN')} sq. ft`,
      approxWeight: 'Including 8% cutting margin',
      spec: 'Kajaria / Somany 800x1600mm slabs',
      norm: '0.85x carpet area factor',
      stage: 'Flooring & Skirting Laying',
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-[#E3EAF4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="max-w-3xl">
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Materials & Quantity Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
              CPWD-Compliant Bill of Quantities (BOQ)
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Avoid site shortages and arbitrary markups. Buildzy automatically derives required material quantities from your floor area and links them directly to contractor requisition milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/plan-project')}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-soft flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Generate My Bill of Quantities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Area Selector for Preview */}
        <div className="bg-[#F5F9FF] rounded-3xl p-6 border border-[#E3EAF4] shadow-soft mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E3EAF4]">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live BOQ Sample for:</span>
              <h3 className="text-xl font-extrabold text-navy-900 mt-0.5">
                Residential RCC Superstructure ({demoArea.toLocaleString('en-IN')} sq. ft)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Preview Area:</span>
              {[1200, 2000, 3200].map((sqft) => (
                <button
                  key={sqft}
                  type="button"
                  onClick={() => setDemoArea(sqft)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    demoArea === sqft
                      ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {sqft.toLocaleString('en-IN')} sq. ft
                </button>
              ))}
            </div>
          </div>

          {/* Indicative Materials Cost Summary */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Includes 7% standard transit &amp; cutting contingency allowance</span>
            </div>
            <div className="text-slate-700">
              Estimated Raw Materials Value:&nbsp;
              <strong className="text-sm font-extrabold text-navy-900">
                {formatINR(materialsData.estimatedMaterialCostINR)}
              </strong>
            </div>
          </div>
        </div>

        {/* 6 Material Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {materialItems.map((mat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-[#E3EAF4] hover:border-brand-300 shadow-xs hover:shadow-soft transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                  {mat.category}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">{mat.norm}</span>
              </div>

              <h4 className="font-bold text-sm text-navy-900 leading-tight mb-3">
                {mat.name}
              </h4>

              {/* Quantity Stat Banner */}
              <div className="p-3 rounded-xl bg-[#F8FAFD] border border-slate-100 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Estimated Requirement</span>
                  <span className="text-base font-extrabold text-brand-700">{mat.qty}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Net Measure</span>
                  <span className="text-xs font-bold text-slate-700">{mat.approxWeight}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Specification:</span>
                  <span className="font-medium text-navy-900 text-right">{mat.spec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Milestone Stage:</span>
                  <span className="font-medium text-slate-700 text-right">{mat.stage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explicit Sourcing Caveat */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-navy-900">Sourcing Transparency Policy:</strong>
            <p className="mt-0.5 leading-relaxed">
              Material requirements shown are engineering benchmarks. Buildzy does not represent real-time supplier warehouse stock or guaranteed delivery slots until verified in your active project workspace with your chosen general contractor.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
