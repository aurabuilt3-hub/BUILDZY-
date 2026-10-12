import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calculator, 
  Package, 
  Layers, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const IntegratedWorkflowSection: React.FC = () => {
  const navigate = useNavigate();

  const stages = [
    {
      num: '01',
      title: 'Plan & Scope',
      subtitle: 'Define Architecture',
      desc: 'Specify your project category (villa, apartment remodel, or addition), carpet/built-up area, floors, and location.',
      carriesForward: 'Scope specs & room dimensions carry forward into estimation',
      icon: <FileText className="w-5 h-5 text-brand-600" />,
      cta: 'Start Planning',
      route: '/plan-project',
    },
    {
      num: '02',
      title: 'Estimate Budget',
      subtitle: 'Transparent Breakdown',
      desc: 'Generate indicative estimates across Basic, Standard, and Premium tiers with itemized civil, GST, and contingency reserves.',
      carriesForward: 'Budget benchmarks set the target for contractor bids',
      icon: <Calculator className="w-5 h-5 text-sky-600" />,
      cta: 'Explore Tiers',
      route: '/plan-project',
    },
    {
      num: '03',
      title: 'Materials Planning',
      subtitle: 'CPWD Quantities',
      desc: 'Automatic rule-of-thumb computation for cement bags, Fe-500D rebar, M-sand, aggregate, bricks, and vitrified tiles with waste margins.',
      carriesForward: 'Calculated bills of quantities link to site milestone requisitions',
      icon: <Package className="w-5 h-5 text-indigo-600" />,
      cta: 'View Materials',
      route: '/plan-project',
    },
    {
      num: '04',
      title: 'Compare Quotes',
      subtitle: 'Side-by-Side Review',
      desc: 'Compare multiple contractor proposals across total bid, labour/material split, brands, exclusions, timelines, and warranties.',
      carriesForward: 'Selected contractor quotation locks the agreed project cost',
      icon: <Layers className="w-5 h-5 text-cyan-600" />,
      cta: 'Compare Quotes',
      route: '/compare',
    },
    {
      num: '05',
      title: 'Select & Book',
      subtitle: 'Confirmed Engagement',
      desc: 'Choose verified turnkey builders, specialist contractors, or daily labour crews with clear terms before breaking ground.',
      carriesForward: 'Creates structured milestone schedule and dedicated workspace',
      icon: <UserCheck className="w-5 h-5 text-teal-600" />,
      cta: 'Find Pros',
      route: '/professionals',
    },
    {
      num: '06',
      title: 'Manage Execution',
      subtitle: 'Milestone Tracking',
      desc: 'Track stage completion (plinth, slab, MEP, handover), sign off on inspections, review progress photos, and log verified expenses.',
      carriesForward: 'Living project history from first sketch to final handover',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      cta: 'View Workspace',
      route: '/dashboard',
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-white border-b border-[#E3EAF4] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Connected Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
            How Buildzy Unifies Your Entire Home Project
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            No isolated silos or duplicate data entry. Your project scope, calculated budget, material quantities, and contractor quotes flow naturally from one step to the next.
          </p>
        </div>

        {/* 6-Stage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative mb-12">
          {stages.map((stage) => (
            <div
              key={stage.num}
              className="bg-[#F8FBFF] rounded-3xl p-6 border border-[#E3EAF4] hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-[#D5E1F0] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {stage.icon}
                  </div>
                  <span className="text-xs font-extrabold text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                    Step {stage.num}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {stage.subtitle}
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-900 group-hover:text-brand-600 transition-colors">
                    {stage.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {stage.desc}
                </p>

                {/* Shared Data Carry-forward callout */}
                <div className="p-2.5 rounded-xl bg-white border border-brand-100 text-[11px] text-brand-900 mb-5 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1 shrink-0" />
                  <span className="leading-snug font-medium">
                    <strong className="text-navy-900">Connected:</strong> {stage.carriesForward}
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <button
                type="button"
                onClick={() => navigate(stage.route)}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-brand-500 text-slate-700 hover:text-white font-bold text-xs border border-slate-200 hover:border-brand-500 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>{stage.cta}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Informative Shared Data Summary Banner */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-brand-100 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-200" />
              <span>Zero Fragmentation Assurance</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ready to see the integrated journey with your own dimensions?
            </h3>
            <p className="text-xs sm:text-sm text-brand-100 mt-1 leading-relaxed">
              Launch the step-by-step planner to configure your home, see live materials calculations, and compare realistic contractor bids.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/plan-project')}
            className="bg-white hover:bg-brand-50 text-navy-900 hover:text-brand-600 font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Launch Project Planner</span>
            <ArrowRight className="w-4 h-4 text-brand-500" />
          </button>
        </div>

      </div>
    </section>
  );
};
