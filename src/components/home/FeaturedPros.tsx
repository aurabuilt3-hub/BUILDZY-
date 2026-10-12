import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../common/SafeImage';

export const FeaturedPros: React.FC = () => {
  const { professionals, toggleCompare, isInCompare } = useApp();
  const navigate = useNavigate();

  // Show top 3 featured professionals
  const featured = professionals.slice(0, 3);

  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-white border-b border-[#E3EAF4] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Verified Marketplace
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
              Featured Contractors & Specialists
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Compare ratings, verified scopes, and indicative prices before commissioning your build.
            </p>
          </div>

          <Link
            to="/professionals"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 group self-start sm:self-auto"
          >
            <span>Browse All Professionals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((pro) => {
            const inCompare = isInCompare(pro.id);
            const isAvailableToday = pro.availability === 'Available Today';

            return (
              <div
                key={pro.id}
                className="bg-white rounded-3xl border border-[#E3EAF4] hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header & Avatar */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="relative">
                        <SafeImage
                          src={pro.avatar}
                          alt={pro.name}
                          fallbackText={pro.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
                        />
                        {pro.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-0.5 shadow-xs" title="Verified Provider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Tier Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          pro.tier === 'Premium'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : pro.tier === 'Balanced'
                            ? 'bg-brand-50 text-brand-700 border border-brand-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {pro.tier}
                      </span>
                    </div>

                    {/* Name & Title */}
                    <h3 className="font-extrabold text-navy-900 text-lg group-hover:text-brand-600 transition-colors">
                      {pro.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">
                      {pro.trade}
                    </p>

                    {/* Rating & Review Counter */}
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-lg border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pro.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-400">({pro.reviewCount} verified reviews)</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-600">{pro.experienceYears} yrs exp</span>
                    </div>

                    {/* Area & Availability */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{pro.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className={`font-semibold ${isAvailableToday ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {pro.availability}
                        </span>
                      </div>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {pro.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-slate-50 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded-md font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Indicative Rate Banner */}
                  <div className="bg-[#F8FBFF] border-y border-[#E3EAF4] px-6 py-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Indicative Rate:</span>
                    <span className="text-sm font-extrabold text-navy-900">
                      {pro.projectRateRange || (pro.dailyRate ? `₹${pro.dailyRate}/day` : 'Contact for Quote')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-4 flex items-center gap-3">
                  <button
                    onClick={() => toggleCompare(pro.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 border ${
                      inCompare
                        ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-xs'
                        : 'bg-white border-[#E3EAF4] hover:border-brand-200 text-slate-700 hover:text-brand-600'
                    }`}
                  >
                    {inCompare ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-brand-600 stroke-[3]" />
                        <span>In Compare</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Compare</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/compare')}
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-soft flex items-center justify-center gap-1 group/btn"
                  >
                    <span>View Quote</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo note */}
        <p className="text-center text-xs text-slate-400 mt-8">
          * Note: Ratings, reviews and prices are illustrative demonstration data for showcase purposes.
        </p>

      </div>
    </section>
  );
};
