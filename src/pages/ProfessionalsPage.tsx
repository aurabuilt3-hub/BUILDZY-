import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Check,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Professional } from '../types';
import { SafeImage } from '../components/common/SafeImage';

export const ProfessionalsPage: React.FC = () => {
  const { professionals, toggleCompare, isInCompare, compareIds } = useApp();
  const navigate = useNavigate();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [selectedProForModal, setSelectedProForModal] = useState<Professional | null>(null);

  const trades = ['All', 'Turnkey Construction', 'Civil Labour', 'Architectural Design', 'Electrical Systems'];
  const tiers = ['All', 'Budget-friendly', 'Balanced', 'Premium'];

  const filteredPros = useMemo(() => {
    return professionals.filter((pro) => {
      const matchSearch =
        !searchQuery.trim() ||
        pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTrade =
        selectedTrade === 'All' ||
        pro.trade.toLowerCase().includes(selectedTrade.toLowerCase());

      const matchTier = selectedTier === 'All' || pro.tier === selectedTier;
      const matchRating = pro.rating >= minRating;

      return matchSearch && matchTrade && matchTier && matchRating;
    });
  }, [professionals, searchQuery, selectedTrade, selectedTier, minRating]);

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Verified Marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-2">
              Find Construction Professionals
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Select verified contractors, compare scopes side-by-side, and hire with confidence.
            </p>
          </div>

          {/* Quick Floating Compare Drawer Bar */}
          {compareIds.length > 0 && (
            <div className="bg-white border border-brand-200 rounded-2xl p-3 shadow-soft flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center">
                  {compareIds.length}
                </span>
                <span className="text-xs font-bold text-navy-900">Providers in Compare</span>
              </div>
              <button
                onClick={() => navigate('/compare')}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1"
              >
                <span>Open Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-5 border border-[#E3EAF4] shadow-soft mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contractor, trade or skill..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl text-xs font-medium text-navy-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Trade Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3 py-2.5 text-xs font-medium text-navy-900 focus:outline-none focus:border-brand-500"
              >
                {trades.map((t) => (
                  <option key={t} value={t}>Trade: {t}</option>
                ))}
              </select>
            </div>

            {/* Tier Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3 py-2.5 text-xs font-medium text-navy-900 focus:outline-none focus:border-brand-500"
              >
                {tiers.map((t) => (
                  <option key={t} value={t}>Tier: {t}</option>
                ))}
              </select>
            </div>

            {/* Min Rating */}
            <div className="md:col-span-2">
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3 py-2.5 text-xs font-medium text-navy-900 focus:outline-none focus:border-brand-500"
              >
                <option value={0}>All Ratings</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPros.map((pro) => {
            const inCompare = isInCompare(pro.id);

            return (
              <div
                key={pro.id}
                className="bg-white rounded-3xl border border-[#E3EAF4] hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Avatar and Badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative">
                      <SafeImage
                        src={pro.avatar}
                        alt={pro.name}
                        fallbackText={pro.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      {pro.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-0.5 shadow-xs" title="Verified ID">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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

                  {/* Title & Trade */}
                  <h3 className="font-extrabold text-navy-900 text-lg group-hover:text-brand-600 transition-colors">
                    {pro.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{pro.trade}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{pro.companyName}</p>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{pro.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-400">({pro.reviewCount} verified reviews)</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-medium text-slate-600">{pro.completedProjects} done</span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{pro.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium">{pro.availability}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {pro.skills.map((s, i) => (
                      <span key={i} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rate Bar */}
                <div className="bg-[#F8FBFF] border-y border-[#E3EAF4] px-6 py-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Sample Rate:</span>
                  <span className="font-extrabold text-navy-900">{pro.projectRateRange || (pro.dailyRate ? `₹${pro.dailyRate}/day` : 'Contact for Quote')}</span>
                </div>

                {/* Buttons */}
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
                    onClick={() => setSelectedProForModal(pro)}
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-soft flex items-center justify-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Profile Detail Modal */}
        {selectedProForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#E3EAF4] shadow-soft-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedProForModal.avatar}
                    alt={selectedProForModal.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
                  />
                  <div>
                    <h3 className="text-xl font-extrabold text-navy-900">{selectedProForModal.name}</h3>
                    <p className="text-xs font-semibold text-brand-600">{selectedProForModal.title}</p>
                    <p className="text-xs text-slate-400">{selectedProForModal.companyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProForModal(null)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {selectedProForModal.bio}
              </p>

              {/* Quotation Sample details */}
              {selectedProForModal.quotationSample && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">Sample Quotation Scope</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedProForModal.quotationSample.scope.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 text-xs text-slate-500">
                    <p><strong>Materials:</strong> {selectedProForModal.quotationSample.materialsDetails}</p>
                    <p className="mt-1"><strong>Warranty:</strong> {selectedProForModal.quotationSample.warranty}</p>
                  </div>
                </div>
              )}

              {/* Contact simulation strip */}
              <div className="bg-[#F8FBFF] rounded-2xl p-4 border border-[#E3EAF4] space-y-2 text-xs mb-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-brand-500" />
                  <span>{selectedProForModal.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-brand-500" />
                  <span>{selectedProForModal.email}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toggleCompare(selectedProForModal.id);
                  }}
                  className="flex-1 py-3 rounded-xl border border-brand-200 text-brand-600 font-bold text-xs hover:bg-brand-50"
                >
                  {isInCompare(selectedProForModal.id) ? 'Remove from Compare' : 'Add to Compare Table'}
                </button>
                <button
                  onClick={() => {
                    setSelectedProForModal(null);
                    navigate('/compare');
                  }}
                  className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 shadow-soft"
                >
                  Compare Quotation Now
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
