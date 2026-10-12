import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HardHat, 
  Building2, 
  Compass, 
  Wrench, 
  Zap, 
  Paintbrush, 
  Hammer, 
  Home, 
  Package,
  ArrowRight
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../data/mockData';

const iconMap: Record<string, React.ReactNode> = {
  HardHat: <HardHat className="w-7 h-7" />,
  Building2: <Building2 className="w-7 h-7" />,
  Compass: <Compass className="w-7 h-7" />,
  Wrench: <Wrench className="w-7 h-7" />,
  Zap: <Zap className="w-7 h-7" />,
  Paintbrush: <Paintbrush className="w-7 h-7" />,
  Hammer: <Hammer className="w-7 h-7" />,
  Home: <Home className="w-7 h-7" />,
  Package: <Package className="w-7 h-7" />,
};

export const PopularCategories: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-white border-y border-[#E3EAF4] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Verified Trades & Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-2 tracking-tight">
              Popular Service Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              From on-demand plumbers and master masons to complete turnkey home contractors.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 group self-start sm:self-auto py-1"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 9 Category Grid matching specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3 sm:gap-4 lg:gap-4.5">
          {SERVICE_CATEGORIES.map((cat) => {
            const icon = iconMap[cat.icon] || <Home className="w-7 h-7" />;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/services?cat=${cat.id}`)}
                className="group cursor-pointer bg-white hover:bg-brand-50/40 border border-[#E3EAF4] hover:border-brand-300 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg"
              >
                {/* Icon wrapper with subtle gradient background */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-xs ${cat.bgTint}`}>
                  {icon}
                </div>

                {/* Title */}
                <h3 className="font-bold text-navy-900 text-sm group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                  {cat.name}
                </h3>

                {/* Indicative starting rate */}
                <p className="text-[11px] font-semibold text-slate-400 group-hover:text-brand-500 transition-colors mt-1.5">
                  {cat.unit.startsWith('₹') ? cat.unit : `From ₹${cat.startingPrice}`}
                </p>

                {/* Counter */}
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {cat.count}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
