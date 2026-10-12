import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Calculator, 
  Layers, 
  CheckCircle2, 
  Check,
  Wrench
} from 'lucide-react';
import { formatINR } from '../../lib/pricing/formatINR';
import { calculateConstructionEstimate, CITIES } from '../../lib/pricing/pricingEngine';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [heroCityId, setHeroCityId] = useState('mumbai');
  const [heroArea, setHeroArea] = useState(1800);
  const [heroTier, setHeroTier] = useState<'Standard' | 'Premium'>('Standard');

  // Interactive live estimate preview right in hero
  const previewEstimate = calculateConstructionEstimate(heroArea, heroTier, heroCityId);

  return (
    <section className="relative pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#F5F9FF] via-[#F8FBFF] to-white border-b border-[#E3EAF4]/60">
      {/* Soft atmospheric background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-40 left-10 w-72 h-72 bg-brand-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Integrated Narrative & Core CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Integrated badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold w-fit mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Integrated Home Construction, Renovation & Services</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-extrabold text-navy-900 tracking-tight leading-[1.14] mb-4 sm:mb-5">
              Everything Your Home Project Needs.{' '}
              <span className="text-gradient drop-shadow-xs block sm:inline">In One Place.</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mb-7">
              Plan construction, renovation, or repairs. Estimate costs, compare professionals, source materials, and manage the work from one connected workspace.
            </p>

            {/* Primary & Secondary Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              <button
                type="button"
                onClick={() => navigate('/plan-project')}
                className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-all shadow-soft hover:shadow-soft-lg hover:shadow-brand-500/25 flex items-center justify-center gap-2.5 group"
              >
                <Building2 className="w-5 h-5" />
                <span>Plan a Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/services')}
                className="bg-white hover:bg-slate-50 text-slate-700 hover:text-navy-900 font-bold text-base px-6 py-3.5 rounded-xl border border-[#D5E1F0] hover:border-brand-300 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Wrench className="w-4.5 h-4.5 text-brand-500" />
                <span>Explore Home Services</span>
              </button>
            </div>

            {/* 6 Connected Steps Quick Indicator */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-[#E3EAF4] shadow-xs max-w-2xl mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Integrated Project Journey</span>
                <span className="text-brand-600 font-semibold normal-case text-xs">Shared context throughout</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                {[
                  { label: '1. Plan', detail: 'Scope' },
                  { label: '2. Estimate', detail: 'Budget' },
                  { label: '3. Compare', detail: 'Quotes' },
                  { label: '4. Source', detail: 'Materials' },
                  { label: '5. Book', detail: 'Contractor' },
                  { label: '6. Manage', detail: 'Milestones' },
                ].map((item, idx) => (
                  <div key={idx} className="p-1.5 rounded-lg bg-[#F5F9FF] border border-[#E8F0FA]">
                    <span className="font-bold text-navy-900 block text-[11px]">{item.label}</span>
                    <span className="text-[10px] text-slate-500">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Factual, Verified Trust Indicators */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Standardized INR Rate Benchmarks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Itemized Scope & Exclusions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Milestone Verification Framework</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Product Preview & Living Estimate Card */}
          <div className="lg:col-span-5 relative max-w-full">
            
            {/* Pale-Blue Container with Genuine UI Preview */}
            <div className="relative bg-gradient-to-br from-[#EAF4FF] via-[#F4F9FF] to-[#E5F1FF] border border-[#D5E6FA] rounded-3xl p-5 sm:p-6 shadow-soft-lg">
              
              {/* Product Preview Header */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block animate-pulse" />
                  <span className="text-xs font-bold text-navy-900">Buildzy Project Workspace Preview</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Demo Showcase
                </span>
              </div>

              {/* Realistic Indian Residential Architecture Image with Live Overlay */}
              <div className="relative rounded-2xl overflow-hidden shadow-xs border border-white/80 aspect-[16/9] mb-4 group">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80"
                  alt="Contemporary Indian Residential Villa Architecture"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-white/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy-900">Residential Villa &middot; {previewEstimate.city.name}</p>
                    <p className="text-[10px] text-slate-500">{heroArea} sq. ft &middot; {heroTier} Specification</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                      {formatINR(previewEstimate.totalEstimatedCostINR)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Interactive Controls in Hero: City + Area Quick Toggles */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E3EAF4] shadow-xs mb-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-brand-500" />
                    Indicative Budget Calibration:
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHeroTier('Standard')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        heroTier === 'Standard'
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroTier('Premium')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        heroTier === 'Premium'
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Premium
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">City Benchmark</label>
                    <select
                      value={heroCityId}
                      onChange={(e) => setHeroCityId(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-navy-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {CITIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Built-Up Area</label>
                    <select
                      value={heroArea}
                      onChange={(e) => setHeroArea(Number(e.target.value))}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-navy-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={1200}>1,200 sq. ft (2BHK)</option>
                      <option value={1800}>1,800 sq. ft (3BHK)</option>
                      <option value={2400}>2,400 sq. ft (Villa)</option>
                      <option value={3200}>3,200 sq. ft (Luxury)</option>
                    </select>
                  </div>
                </div>

                {/* Transparent Breakdown Mini Row */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="bg-[#F8FAFD] p-1.5 rounded">
                    <span className="text-slate-400 block">Base Civil</span>
                    <span className="font-bold text-navy-900">{formatINR(previewEstimate.baseConstructionCost)}</span>
                  </div>
                  <div className="bg-[#F8FAFD] p-1.5 rounded">
                    <span className="text-slate-400 block">GST (18%)</span>
                    <span className="font-bold text-navy-900">{formatINR(previewEstimate.statutoryGst)}</span>
                  </div>
                  <div className="bg-[#F8FAFD] p-1.5 rounded">
                    <span className="text-slate-400 block">Contingency</span>
                    <span className="font-bold text-navy-900">{formatINR(previewEstimate.contingencyReserve)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div 
                  onClick={() => navigate('/compare')}
                  className="bg-white hover:bg-brand-50/50 p-2.5 rounded-xl border border-[#E3EAF4] hover:border-brand-200 cursor-pointer transition-all flex items-center gap-2 group"
                >
                  <Layers className="w-4 h-4 text-brand-500 shrink-0" />
                  <div>
                    <p className="font-bold text-navy-900 group-hover:text-brand-600 text-[11px] leading-tight">Contractor Bids</p>
                    <p className="text-[10px] text-slate-500">Compare 3+ quotes</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/dashboard')}
                  className="bg-white hover:bg-brand-50/50 p-2.5 rounded-xl border border-[#E3EAF4] hover:border-brand-200 cursor-pointer transition-all flex items-center gap-2 group"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-navy-900 group-hover:text-brand-600 text-[11px] leading-tight">Live Workspace</p>
                    <p className="text-[10px] text-slate-500">Milestone tracking</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
