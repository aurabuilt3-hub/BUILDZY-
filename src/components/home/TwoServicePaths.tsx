import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Building2, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const TwoServicePaths: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-[#F5F9FF] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Tailored Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
            Two Simple Ways to Work With Buildzy
          </h2>
          <p className="text-base text-slate-500 mt-2">
            Whether you need a quick repair today or are orchestrating a full ground-up build tomorrow.
          </p>
        </div>

        {/* Two distinct primary path cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* PATH 1: Book a Service */}
          <div className="bg-white rounded-3xl p-8 border border-[#E3EAF4] hover:border-brand-300 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <Wrench className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50/80 px-2.5 py-0.5 rounded-full border border-brand-100">
                Individual & Crew Hire
              </span>

              <h3 className="text-2xl font-extrabold text-navy-900 mt-2.5 mb-3 group-hover:text-brand-600 transition-colors">
                Book a Service
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                For urgent repairs, skilled solo workers, daily helpers, or specialist trade teams. Select duration, worker counts, and schedule on-demand.
              </p>

              {/* Feature bullet checklist */}
              <ul className="space-y-2.5 mb-8 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Plumbers, Electricians, Carpenters & Painters</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Skilled civil labour & helper teams (1 to 10+ workers)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Hourly or daily transparent rates with zero hidden markups</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Live tracking & arrival status notifications</span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate('/book-service')}
                className="w-full bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 group-hover:shadow-soft"
              >
                <span>Book Service or Labour</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* PATH 2: Plan a Complete Project */}
          <div className="bg-gradient-to-br from-white via-[#F8FBFF] to-[#EBF4FF] rounded-3xl p-8 border-2 border-brand-200/80 hover:border-brand-400 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-400/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center mb-6 shadow-soft group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white bg-brand-500 px-2.5 py-0.5 rounded-full shadow-xs">
                  AI-Powered
                </span>
                <span className="text-xs font-bold text-brand-700 bg-brand-100/80 px-2.5 py-0.5 rounded-full">
                  Turnkey & Renovations
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-navy-900 mt-2.5 mb-3 group-hover:text-brand-600 transition-colors">
                Plan a Complete Project
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                For 2BHK/3BHK construction, complete floor remodels, and commercial interiors. Receive AI-assisted budget estimates and compare 3 competitive contractor quotations.
              </p>

              {/* Feature bullet checklist */}
              <ul className="space-y-2.5 mb-8 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>Guided wizard for requirements, sq. ft, and tier levels</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>Side-by-side contractor quote comparison (Budget, Balanced, Premium)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>Interactive milestone-based escrow release schedules</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>Digital materials ledger & daily photo timeline tracking</span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 pt-4 border-t border-brand-100">
              <button
                onClick={() => navigate('/plan-project')}
                className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 group-hover:shadow-brand-500/25"
              >
                <Sparkles className="w-4 h-4 text-brand-200" />
                <span>Start Project Planning</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
