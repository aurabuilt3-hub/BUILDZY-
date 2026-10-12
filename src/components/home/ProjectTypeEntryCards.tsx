import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Home, 
  Sparkles, 
  Wrench, 
  ArrowRight
} from 'lucide-react';

interface ProjectTypeCard {
  id: string;
  category: 'build' | 'renovate' | 'improve' | 'maintain';
  title: string;
  badge: string;
  description: string;
  typicalScope: string[];
  startingIndicative: string;
  targetRoute: string;
  icon: React.ReactNode;
}

export const ProjectTypeEntryCards: React.FC = () => {
  const navigate = useNavigate();

  const cards: ProjectTypeCard[] = [
    {
      id: 'card-build',
      category: 'build',
      title: 'Build a Home',
      badge: 'Ground-Up Construction',
      description: 'End-to-end turnkey residential construction. From architectural blueprints & soil testing to RCC superstructure and handover.',
      typicalScope: ['Architectural design & soil test', 'RCC structure, brickwork & plastering', 'Turnkey contractor bidding'],
      startingIndicative: 'From ₹1,750 / sq. ft',
      targetRoute: '/plan-project?type=Residential%20Villa%20Construction',
      icon: <Building2 className="w-6 h-6 text-brand-600" />,
    },
    {
      id: 'card-renovate',
      category: 'renovate',
      title: 'Renovate a Home',
      badge: 'Full Home Overhaul',
      description: 'Structural civil alterations, space reconfiguration, rewiring, plumbing replacement, and complete interior modernisation.',
      typicalScope: ['Wall demolition & layout replanning', 'Complete electrical & CPVC repiping', 'Flooring & ceiling transformation'],
      startingIndicative: 'From ₹950 / sq. ft',
      targetRoute: '/plan-project?type=Full%20Apartment%20Remodel',
      icon: <Home className="w-6 h-6 text-sky-600" />,
    },
    {
      id: 'card-improve',
      category: 'improve',
      title: 'Improve a Space',
      badge: 'Kitchen, Bath & Rooms',
      description: 'Targeted renovations for modular kitchens, waterproofed bathrooms, terrace waterproof additions, and living room enhancements.',
      typicalScope: ['Modular cabinetry & quartz counter', 'Anti-skid tiling & sanitary fittings', 'False ceiling with warm LED lighting'],
      startingIndicative: 'From ₹42,000 / room',
      targetRoute: '/plan-project?type=Kitchen%20%26%20Floor%20Extension',
      icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
    },
    {
      id: 'card-maintain',
      category: 'maintain',
      title: 'Fix or Maintain',
      badge: 'Repairs & Daily Labour',
      description: 'On-demand trade specialists and daily helper crews. Hire skilled plumbers, electricians, masons, painters, or civil labour.',
      typicalScope: ['Same-day emergency repairs', 'Skilled masons & daily helpers', 'Waterproofing touch-ups & painting'],
      startingIndicative: 'From ₹450 / visit or ₹550 / day',
      targetRoute: '/services',
      icon: <Wrench className="w-6 h-6 text-amber-600" />,
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-[#E3EAF4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Start Your Journey
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
            Select Your Project Category
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Every path connects directly into structured estimation, scope planning, and verified contractor or service bookings.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-3xl border border-[#E3EAF4] hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between p-6 group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F9FF] border border-[#E3EAF4] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 uppercase tracking-wide">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-navy-900 group-hover:text-brand-600 transition-colors mb-2">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                  {card.description}
                </p>

                {/* Scope items */}
                <div className="pt-3 border-t border-slate-100 mb-5">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">What is included:</p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {card.typicalScope.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Card Footer with Starting Rate and Connected Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Indicative Benchmark</span>
                  <span className="text-xs font-bold text-navy-900">{card.startingIndicative}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(card.targetRoute)}
                  className="bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 group-hover:bg-brand-500 group-hover:text-white shadow-xs"
                >
                  <span>Select</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
