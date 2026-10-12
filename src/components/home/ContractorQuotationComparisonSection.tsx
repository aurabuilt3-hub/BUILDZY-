import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  ArrowRight, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  Info,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../lib/pricing/formatINR';
import { SAMPLE_CONTRACTOR_BIDS } from '../../lib/pricing/pricingEngine';

export const ContractorQuotationComparisonSection: React.FC = () => {
  const navigate = useNavigate();
  const { toggleCompare, isInCompare, compareIds } = useApp();

  // Use the 3 realistic bids from shared india-pricing dataset
  const bids = SAMPLE_CONTRACTOR_BIDS.slice(0, 3);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#F5F9FF] border-b border-[#E3EAF4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Contractor Quotation Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
              Compare Real-World Bids Side-by-Side
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              The lowest quote is not always the best value. Compare total price, material specifications, statutory GST, labour crews, and explicit exclusions before signing.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={() => navigate('/compare')}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-soft flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Full Comparison Matrix ({compareIds.length} active)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Caveat Banner for Demo Bids */}
        <div className="p-3.5 rounded-2xl bg-white border border-brand-200/80 mb-8 flex items-start gap-3 shadow-xs">
          <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-navy-900">Synthetic Comparison Benchmark:</strong> Shown below are representative bids for a 2,400 sq. ft residential villa in Mumbai MMR. Every quotation includes itemized milestone stages and binding exclusions to eliminate cost disputes.
          </p>
        </div>

        {/* 3 Quotation Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bids.map((bid, idx) => {
            const isSelected = isInCompare(bid.contractorId);

            return (
              <div
                key={bid.id}
                className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between p-6 shadow-soft hover:shadow-soft-lg relative ${
                  idx === 1 
                    ? 'border-brand-500 ring-2 ring-brand-100' 
                    : 'border-[#E3EAF4] hover:border-brand-300'
                }`}
              >
                {/* Popular / Best Balance badge */}
                {idx === 1 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-200" />
                    <span>Most Balanced Value</span>
                  </div>
                )}

                <div>
                  {/* Top Contractor Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {bid.tier} Specification
                      </span>
                      <h3 className="text-lg font-extrabold text-navy-900 mt-1.5 leading-snug">
                        {bid.contractorName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {bid.builtUpAreaSqFt.toLocaleString('en-IN')} sq. ft residential scope
                      </p>
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F9FF] to-[#EDF4FD] border border-brand-100 mb-5">
                    <div className="text-[11px] text-slate-500 font-medium">Total Contractor Bid</div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight my-0.5">
                      {formatINR(bid.totalEstimateINR)}
                    </div>
                    <div className="text-[11px] font-semibold text-brand-700">
                      ₹{bid.baseRatePerSqFt.toLocaleString('en-IN')} / sq. ft built-up area
                    </div>
                  </div>

                  {/* Key Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Estimated Duration</span>
                      <span className="font-bold text-navy-900 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        {bid.durationMonths} Months
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Structural Warranty</span>
                      <span className="font-bold text-navy-900 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {bid.warrantyYears} Years
                      </span>
                    </div>
                  </div>

                  {/* Material Brands Included */}
                  <div className="mb-4">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Material Specification Brands:
                    </p>
                    <div className="space-y-1.5 text-xs">
                      {bid.materialBrands.slice(0, 3).map((item, bIdx) => (
                        <div key={bIdx} className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">{item.category}</span>
                          <span className="font-bold text-navy-900">{item.brand} ({item.grade})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scope Inclusions */}
                  <div className="mb-4">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Confirmed Inclusions:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {bid.scopeItems.slice(0, 3).map((item, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Explicit Exclusions */}
                  <div className="mb-6">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 text-rose-700">
                      Explicit Exclusions:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-500">
                      {bid.exclusionItems.slice(0, 2).map((item, eIdx) => (
                        <li key={eIdx} className="flex items-start gap-1.5">
                          <X className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleCompare(bid.contractorId)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                        : 'bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-500 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isSelected ? 'Remove from Comparison' : 'Add to Side-by-Side Compare'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/compare')}
                    className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Inspect Full Bid Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
