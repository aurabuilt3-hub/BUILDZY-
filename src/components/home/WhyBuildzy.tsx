import React from 'react';
import { 
  Layers, 
  FileCheck2, 
  Cpu, 
  Calculator, 
  Activity, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';

export const WhyBuildzy: React.FC = () => {
  const features = [
    {
      icon: <Layers className="w-6 h-6 text-brand-500" />,
      title: 'Multiple Provider Options',
      desc: 'Browse individual trade specialists, helper teams, and complete general contracting firms all in one directory.',
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-brand-500" />,
      title: 'Transparent Quotation Comparison',
      desc: 'Inspect detailed scopes, exclusions, material grades, and estimated durations side by side before deciding.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-brand-500" />,
      title: 'AI-Assisted Project Planning',
      desc: 'Transform simple ideas or floor areas into structured milestone roadmaps, material breakdowns, and task checklists.',
    },
    {
      icon: <Calculator className="w-6 h-6 text-brand-500" />,
      title: 'Realistic Budget Guidance',
      desc: 'Explore Budget-friendly, Balanced, and Premium planning tiers to calibrate expectations without unexpected surprise charges.',
    },
    {
      icon: <Activity className="w-6 h-6 text-brand-500" />,
      title: 'Centralized Project Tracking',
      desc: 'One dashboard to inspect daily site progress photos, pending tasks, material delivery logs, and milestone stages.',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-brand-500" />,
      title: 'Organized Booking & Payment Status',
      desc: 'Clear milestone payout logs and simulated escrow schedules so both homeowner and contractor stay in sync.',
    },
  ];

  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-[#F5F9FF] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Platform Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
            Why Homeowners & Builders Choose Buildzy
          </h2>
          <p className="text-base text-slate-500 mt-2">
            Built from the ground up to replace fragmented chats, hidden price sheets, and disorganized paper receipts.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-[#E3EAF4] hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-xs">
                {item.icon}
              </div>

              <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-brand-600 transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Reassurance strip */}
        <div className="mt-12 bg-white rounded-2xl border border-[#E3EAF4] p-5 shadow-soft flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Demonstration sample data labeled clearly</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500" />
            <span>Zero automated lock-in — customer retains complete choice</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500" />
            <span>Full milestone audit trail and photo records</span>
          </div>
        </div>

      </div>
    </section>
  );
};
