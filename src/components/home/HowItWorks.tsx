import React from 'react';
import { FileText, Cpu, Layers, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Describe Requirement',
      desc: 'Enter your repair need or input home construction details (sq. ft, room count, specifications).',
      icon: <FileText className="w-6 h-6 text-brand-500" />,
      tag: 'Step 1',
    },
    {
      step: '02',
      title: 'AI-Assisted Planning',
      desc: 'Get an instant structural scope breakdown, material estimates, and 3 realistic budget tier ranges.',
      icon: <Cpu className="w-6 h-6 text-brand-500" />,
      tag: 'Step 2',
    },
    {
      step: '03',
      title: 'Compare Quotations',
      desc: 'Review side-by-side contractor offers: price, exclusions, crew size, timelines, and verified ratings.',
      icon: <Layers className="w-6 h-6 text-brand-500" />,
      tag: 'Step 3',
    },
    {
      step: '04',
      title: 'Book, Track & Manage',
      desc: 'Monitor live status, approve verified milestones, inspect photo updates, and release funds with confidence.',
      icon: <CheckCircle className="w-6 h-6 text-brand-500" />,
      tag: 'Step 4',
    },
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-16 lg:py-20 bg-white border-b border-[#E3EAF4] scroll-mt-28 sm:scroll-mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Process Overview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
            How Buildzy Works
          </h2>
          <p className="text-base text-slate-500 mt-2">
            A transparent, frictionless 4-step workflow engineered to eliminate construction chaos.
          </p>
        </div>

        {/* 4-Step Horizontal Pipeline */}
        <div className="relative">
          
          {/* Desktop Connecting Dotted Line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-1/2 left-16 right-16 h-0.5 border-t-2 border-dashed border-brand-200 -translate-y-8 z-0 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="bg-white rounded-3xl p-6 border border-[#E3EAF4] hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col items-center text-center group"
              >
                {/* Step Circle with Icon */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand-100 group-hover:border-brand-400 text-brand-600 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
                    {index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-navy-900 text-lg mb-2 group-hover:text-brand-600 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom CTA trigger */}
        <div className="mt-12 text-center">
          <Link
            to="/plan-project"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/70 border border-brand-200 px-5 py-2.5 rounded-full transition-colors"
          >
            <span>Ready to plan your next home project?</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
