import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Zap, 
  Paintbrush, 
  Hammer, 
  HardHat, 
  Building2, 
  Compass, 
  Home, 
  ArrowRight
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../data/mockData';

const iconMap: Record<string, React.ReactNode> = {
  HardHat: <HardHat className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Paintbrush: <Paintbrush className="w-6 h-6" />,
  Hammer: <Hammer className="w-6 h-6" />,
  Home: <Home className="w-6 h-6" />,
};

export const IndividualServicesSection: React.FC = () => {
  const navigate = useNavigate();

  // Filter 8 core trade services
  const trades = SERVICE_CATEGORIES.filter((c) => c.id !== 'materials').slice(0, 8);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-[#E3EAF4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              On-Demand Trades & Specialist Crews
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
              Individual Home Services & Daily Labour
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Need a quick fix or specialist helpers? Book vetted plumbers, electricians, carpenters, masons, painters, and site labour crews on-demand with hourly or daily transparent rates.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 py-1"
            >
              <span>View All 20+ Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 8 Trade Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {trades.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/services?category=${cat.id}`)}
              className="bg-[#F9FBFE] hover:bg-white rounded-3xl p-5 border border-[#E3EAF4] hover:border-brand-300 shadow-xs hover:shadow-soft transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E3EAF4] text-brand-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 group-hover:bg-brand-50 transition-all">
                  {iconMap[cat.icon] || <Wrench className="w-6 h-6 text-brand-600" />}
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-navy-900 group-hover:text-brand-600 transition-colors mb-1.5">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Starting Rate</span>
                  <span className="text-xs font-extrabold text-navy-900">{cat.unit}</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 flex items-center justify-center text-slate-400 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Instant Labour Booking Banner */}
        <div className="bg-[#F0F6FF] border border-brand-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-navy-900">
                Need Daily Civil Helpers (Beldar) or Master Masons (Raj Mistry)?
              </h4>
              <p className="text-xs text-slate-500">
                Hire dedicated labour crews (1 to 10+ workers) for day-rate site excavation, demolition, or unloading.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/book-service?category=labour')}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <span>Book Daily Labour Crew</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
