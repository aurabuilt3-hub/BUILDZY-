import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileCheck2, 
  Scale, 
  ArrowRight, 
  Building2, 
  CheckCircle2,
  Wrench
} from 'lucide-react';

export const TrustTransparencyFinalCTA: React.FC = () => {
  const navigate = useNavigate();

  const trustPillars = [
    {
      title: 'Inspectable Scope & Assumptions',
      desc: 'No vague lump sums. Every estimate details base civil works, CPWD-aligned material coefficients, and contingency margins so you know exactly what is included.',
      icon: <FileCheck2 className="w-5 h-5 text-brand-600" />,
    },
    {
      title: 'Objective Quotation Comparison',
      desc: 'Direct comparison of scope inclusions, material brands, labour allowances, and binding exclusions without algorithmic price manipulation.',
      icon: <Scale className="w-5 h-5 text-sky-600" />,
    },
    {
      title: 'Milestone-Gated Releases',
      desc: 'Simulated contract escrow release tied strictly to structural completion stages (Foundation, Plinth, Slab, Masonry, Finishing, and Handover).',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    },
    {
      title: 'Explicit Sourcing Disclosures',
      desc: 'Transparent differentiation between estimated bills of quantities and active vendor confirmations to prevent unrealistic timeline promises.',
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-600" />,
    },
  ];

  return (
    <section className="py-14 sm:py-18 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust & Transparency Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Factual Accountability
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
            Built on Transparency, Not Hidden Surprises
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Home construction in India traditionally suffers from opaque billing, informal contracts, and unaccountable variations. Buildzy is engineered to restore clarity.
          </p>
        </div>

        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-[#F8FBFF] rounded-3xl p-6 border border-[#E3EAF4] hover:border-brand-300 shadow-soft transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#E3EAF4] flex items-center justify-center mb-4 shadow-xs">
                {pillar.icon}
              </div>
              <h3 className="font-extrabold text-base text-navy-900 mb-2 leading-snug">
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Final Integrated Call to Action Banner */}
        <div className="relative overflow-hidden rounded-3xl lg:rounded-4xl bg-gradient-to-br from-[#EAF4FF] via-[#F4F9FF] to-[#E2EFFF] border-2 border-brand-200/90 p-8 sm:p-12 lg:p-16 shadow-soft-lg text-center">
          
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-brand-200 text-brand-700 text-xs font-bold mb-4 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-brand-500" />
              <span>One Connected Platform for Home Projects</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 tracking-tight leading-tight mb-4">
              Ready to Bring Structure to Your Home Project?
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Whether you are drafting blueprints for a new build or hiring trusted trade specialists for home repairs, start with Buildzy today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/plan-project')}
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-soft hover:shadow-soft-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <Building2 className="w-5 h-5" />
                <span>Plan a Complete Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/services')}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 hover:text-navy-900 font-bold text-base px-7 py-4 rounded-xl border border-[#D5E1F0] hover:border-brand-300 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Wrench className="w-5 h-5 text-brand-500" />
                <span>Explore Home Services</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
