import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Building, CheckCircle2 } from 'lucide-react';

export const PlanningPromo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wide Soft-Blue Gradient Card */}
        <div className="relative overflow-hidden rounded-3xl lg:rounded-4xl bg-gradient-to-r from-[#EAF4FF] via-[#F1F7FF] to-[#E3F0FF] border-2 border-brand-200/80 p-6 sm:p-10 lg:p-14 shadow-soft-lg">
          
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-400/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-brand-500/10 blur-xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-brand-200 text-brand-700 text-xs font-bold mb-4 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>AI Project Assistant</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 tracking-tight leading-tight mb-4">
                Planning a new home <br className="hidden sm:inline" />
                or renovation?
              </h2>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mb-6">
                Get a structured project plan, an estimated budget range and a clearer view of the professionals and materials you may need.
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-semibold text-navy-900 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  <span>3 Detailed Budget Tiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  <span>Instant Material Estimations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  <span>Milestone Escrow Framework</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate('/plan-project')}
                className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-soft-lg hover:shadow-brand-500/30 transition-all flex items-center gap-3 group"
              >
                <span>Plan My Project</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right graphic preview */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white shadow-soft-xl rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold text-navy-900">Sample Estimate</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Ready in 60s
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Scope Area:</span>
                    <span className="font-semibold text-navy-900">2,400 sq. ft</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Duration:</span>
                    <span className="font-semibold text-navy-900">7 - 9 Months</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Structural Milestones:</span>
                    <span className="font-semibold text-navy-900">5 Stages</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Budget Range:</span>
                    <span className="font-extrabold text-brand-600 text-sm">₹48.5 L - ₹75.6 L</span>
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
