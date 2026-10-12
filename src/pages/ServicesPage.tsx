import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  HardHat, 
  Building2, 
  Compass, 
  Wrench, 
  Zap, 
  Paintbrush, 
  Hammer, 
  Home, 
  Package,
  Calculator,
  Sparkles
} from 'lucide-react';
import { POPULAR_SERVICES, SERVICE_CATEGORIES } from '../data/mockData';
import { formatINR } from '../lib/pricing/formatINR';

const iconMap: Record<string, React.ReactNode> = {
  HardHat: <HardHat className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Paintbrush: <Paintbrush className="w-5 h-5" />,
  Hammer: <Hammer className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
};

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get('cat') || 'all';
  const currentQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [selectedCat, setSelectedCat] = useState<string>(currentCategory);
  
  // Interactive mini calculator widget
  const [calcServiceType, setCalcServiceType] = useState('labour');
  const [calcQuantity, setCalcQuantity] = useState(2);
  const [calcDays, setCalcDays] = useState(3);

  const estimatedCalcCost = useMemo(() => {
    if (calcServiceType === 'labour') {
      return calcQuantity * calcDays * 950; // ₹950/mason/day
    } else if (calcServiceType === 'painting') {
      return calcQuantity * 24 * 100; // per 100 sq ft (₹24/sq ft)
    } else if (calcServiceType === 'plumbing') {
      return calcQuantity * 650; // per job visit
    } else {
      return calcQuantity * 850;
    }
  }, [calcServiceType, calcQuantity, calcDays]);

  const filteredServices = useMemo(() => {
    return POPULAR_SERVICES.filter((srv) => {
      const matchCat = selectedCat === 'all' || srv.category === selectedCat;
      const matchSearch =
        !searchTerm.trim() ||
        srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        srv.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchTerm]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCat(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 mb-3">
            <span>Marketplace Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Service Categories & Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl">
            Choose from specialized individual trade workers, labor crews, or full turnkey construction solutions.
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white rounded-3xl p-5 border border-[#E3EAF4] shadow-soft mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services (e.g. Mason team, electrical rewiring, waterproofing)..."
                className="w-full pl-11 pr-4 py-3 bg-[#F8FBFF] border border-[#E3EAF4] rounded-2xl text-sm font-medium text-navy-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-3">
              <Filter className="w-4 h-4 text-brand-500" />
              <span>Showing {filteredServices.length} available service options</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === 'all'
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-navy-900'
              }`}
            >
              All Categories
            </button>
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCat === cat.id
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-navy-900'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Layout: Service Cards Grid + Interactive Estimator Aside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main List */}
          <div className="lg:col-span-8">
            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E3EAF4] shadow-soft">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-navy-900">No matching services found</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  Try adjusting your search terms or select "All Categories".
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCat('all'); }}
                  className="bg-brand-50 text-brand-600 font-bold px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors text-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white rounded-3xl p-6 border border-[#E3EAF4] hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Category Pill and Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                          {srv.categoryLabel}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-[#F0F7FE] text-brand-600 flex items-center justify-center">
                          {iconMap[srv.iconName] || <Wrench className="w-5 h-5" />}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-navy-900 text-base group-hover:text-brand-600 transition-colors mb-2 leading-snug">
                        {srv.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {srv.description}
                      </p>

                      {/* Duration Tag */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Est: {srv.estimatedTime}</span>
                      </div>
                    </div>

                    {/* Bottom Pricing & CTA */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting At</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-extrabold text-navy-900">{formatINR(srv.startingPrice)}</span>
                          <span className="text-[11px] text-slate-500">/{srv.priceUnit}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/book-service?service=${srv.id}`)}
                        className="bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 group/btn shadow-xs"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aside Widget: Quick Estimate Calculator & Project Planner Callout */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Interactive Cost Estimator Box */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3EAF4] shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900">Quick Labour Estimator</h3>
                  <p className="text-[11px] text-slate-400">Indicative budget calculator</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Service Type</label>
                  <select
                    value={calcServiceType}
                    onChange={(e) => setCalcServiceType(e.target.value)}
                    className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3 py-2 text-navy-900 font-medium focus:outline-none focus:border-brand-500"
                  >
                    <option value="labour">Skilled Labour & Mason Team (₹950/worker/day)</option>
                    <option value="plumbing">Plumber Visit & Repair (₹650/job)</option>
                    <option value="painting">Interior Painting Putty + Primer (₹24/sq ft)</option>
                  </select>
                </div>

                {calcServiceType === 'labour' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-600 block mb-1">Worker Count</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={calcQuantity}
                          onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3 py-2 text-navy-900 font-medium focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-1">Duration (Days)</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={calcDays}
                          onChange={(e) => setCalcDays(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3 py-2 text-navy-900 font-medium focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Estimate Result Box */}
                <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-4 text-center mt-4">
                  <span className="text-[11px] font-semibold text-brand-700 block mb-1">
                    Estimated Labour Budget
                  </span>
                  <div className="text-2xl font-black text-brand-600">
                    {formatINR(estimatedCalcCost)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    *Sample calculation based on standard market day rates.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/book-service')}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-soft flex items-center justify-center gap-2"
                >
                  <span>Proceed to Book Crew</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Need Larger Turnkey Build Card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-3xl p-6 shadow-soft-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-brand-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-100">
                  Full Project
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">Building or Remodeling a Home?</h3>
              <p className="text-xs text-brand-100 leading-relaxed mb-5">
                Don't book piecemeal. Use our AI Project Planner to calculate square-footage budgets and get 3 contractor bids.
              </p>
              <button
                onClick={() => navigate('/plan-project')}
                className="w-full bg-white hover:bg-brand-50 text-brand-600 font-extrabold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Launch Project Planner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
