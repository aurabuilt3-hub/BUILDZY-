import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  Plus, 
  Trash2, 
  FileCheck2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Professional } from '../types';
import { formatINR } from '../lib/pricing/formatINR';
import { SafeImage } from '../components/common/SafeImage';

export const ComparePage: React.FC = () => {
  const { 
    professionals, 
    compareIds, 
    toggleCompare, 
    clearCompare, 
    selectedTier, 
    setSelectedTier, 
    draftPlan, 
    setDraftPlan,
    addProject, 
    showToast 
  } = useApp();
  const navigate = useNavigate();

  // Selected provider modal & booked success states
  const [selectedProviderForReview, setSelectedProviderForReview] = useState<Professional | null>(null);
  const [confirmedCreatedProjectId, setConfirmedCreatedProjectId] = useState<string | null>(null);

  // Filter out the contractors selected for comparison
  const comparedProfessionals = professionals.filter((p) => compareIds.includes(p.id));

  const handleSelectProvider = (pro: Professional) => {
    setSelectedProviderForReview(pro);
  };

  const handleConfirmProvider = () => {
    if (!selectedProviderForReview) return;

    // Use values from active draftPlan if available, otherwise sensible defaults
    const projArea = draftPlan?.builtUpArea || 2400;
    const projTitle = draftPlan?.title || `${selectedProviderForReview.tier} Residential Villa Build`;
    const projType = draftPlan?.type || `Residential Villa Construction (${projArea} sq. ft)`;
    const projLocation = draftPlan?.location || '128 Willow Creek Way, North District';
    const projMonths = draftPlan?.timelineMonths || 8;
    const projQuote = selectedProviderForReview.quotationSample?.indicativePrice || (selectedProviderForReview.dailyRate ? selectedProviderForReview.dailyRate * 120 : 168000);

    const newProj = addProject({
      title: projTitle,
      type: projType,
      location: projLocation,
      startDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      estimatedCompletion: `In ${projMonths} months`,
      progressPercentage: 10,
      budgetEstimated: draftPlan?.estimatedBudget || projQuote,
      agreedQuotation: projQuote,
      amountSpent: Math.round(projQuote * 0.15),
      tier: selectedProviderForReview.tier,
      status: 'In Progress',
      contractor: {
        name: selectedProviderForReview.name,
        company: selectedProviderForReview.companyName || selectedProviderForReview.name,
        avatar: selectedProviderForReview.avatar,
        phone: selectedProviderForReview.phone,
        rating: selectedProviderForReview.rating,
      },
      assignedWorkersCount: selectedProviderForReview.tier === 'Premium' ? 14 : selectedProviderForReview.tier === 'Balanced' ? 10 : 8,
      milestones: [
        {
          id: 'm-cb-1',
          title: 'Foundation & Soil Retaining Plinth',
          description: 'Excavation, anti-termite, PCC foundation and plinth beam casting.',
          percentage: 50,
          status: 'In Progress',
          targetDate: 'Month 1',
          payoutAmount: Math.round(projQuote * 0.20),
          isPaid: false,
        },
        {
          id: 'm-cb-2',
          title: 'Ground & Upper Superstructure RCC Frame',
          description: 'Reinforced columns, staircase, and cured ceiling slab casting.',
          percentage: 0,
          status: 'Upcoming',
          targetDate: 'Month 3',
          payoutAmount: Math.round(projQuote * 0.25),
          isPaid: false,
        },
        {
          id: 'm-cb-3',
          title: 'Masonry Walls & Conduit Concealment',
          description: 'Block masonry, electrical wiring conduits, and plumbing lines.',
          percentage: 0,
          status: 'Upcoming',
          targetDate: 'Month 5',
          payoutAmount: Math.round(projQuote * 0.20),
          isPaid: false,
        },
        {
          id: 'm-cb-4',
          title: 'Flooring, Tiling & Waterproofing',
          description: 'Vitrified tiles, bathroom waterproofing membranes, and joinery.',
          percentage: 0,
          status: 'Upcoming',
          targetDate: 'Month 7',
          payoutAmount: Math.round(projQuote * 0.20),
          isPaid: false,
        },
        {
          id: 'm-cb-5',
          title: 'Finishing Coats, Fittings & Final OC Handover',
          description: 'Paint finish, Kohler/Jaquar sanitary sets, deep cleaning and handover.',
          percentage: 0,
          status: 'Upcoming',
          targetDate: `Month ${projMonths}`,
          payoutAmount: Math.round(projQuote * 0.15),
          isPaid: false,
        },
      ],
      tasks: [
        { id: 't-cb-1', title: 'Topographical soil compaction and boundary survey', status: 'Completed', assignedTo: 'Lead Structural Eng.', dueDate: 'Done', category: 'Foundation' },
        { id: 't-cb-2', title: 'Procure primary Fe-500D steel rebar bundle', status: 'In Progress', assignedTo: 'Materials Coordinator', dueDate: 'Tomorrow', category: 'Materials' },
        { id: 't-cb-3', title: 'Inspect plumbing rough-ins with site architect', status: 'Pending', assignedTo: 'Site Engineer', dueDate: 'Next Week', category: 'Civil' },
      ],
      materials: [
        { id: 'mat-cb-1', name: 'Portland Pozzolana 53-Grade Cement', quantity: '400 Bags', estimatedCost: 4400, status: 'Ordered', supplier: 'Buildzy Direct Hub' },
        { id: 'mat-cb-2', name: 'Branded Fe-500D TMT Reinforcement Steel', quantity: '4.5 Metric Tons', estimatedCost: 17800, status: 'Requisitioned', supplier: 'National Steel Mills' },
      ],
      photos: [
        {
          id: 'p-cb-1',
          title: 'Excavation and foundation plinth beam marking',
          date: '11 Oct 2026',
          imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
          milestoneTitle: 'Foundation & Plinth'
        }
      ]
    });

    // Clear active draft plan now that project is created
    setDraftPlan(null);
    setSelectedProviderForReview(null);
    setConfirmedCreatedProjectId(newProj.id);
  };

  const handleResetToTopThree = () => {
    toggleCompare('pro-1');
    toggleCompare('pro-2');
    toggleCompare('pro-3');
    showToast('Loaded top 3 contractors into comparison table', 'info');
  };

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Quotation Comparison Matrix</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
              Compare Contractor Quotations
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1 max-w-2xl">
              Inspect transparent scopes of work, exclusions, material grades and timelines side by side before hiring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/professionals')}
              className="text-xs font-bold text-slate-600 hover:text-navy-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-brand-500" />
              <span>Add More Pros</span>
            </button>
            {compareIds.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Draft Project Banner (if user came from PlanProjectPage) */}
        {draftPlan && (
          <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-3xl p-5 sm:p-6 mb-8 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                  Planned Requirement In Context
                </span>
                <h3 className="text-base sm:text-lg font-extrabold mt-0.5">{draftPlan.title}</h3>
                <p className="text-xs text-brand-100">
                  {draftPlan.type} • {draftPlan.location} • Est. Budget: ${draftPlan.estimatedBudget.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/plan-project')}
              className="bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Edit Requirements
            </button>
          </div>
        )}

        {/* Planning Tier Preferences Strip (Section 6 Requirement) */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3EAF4] shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Project Planning Preferences
              </span>
              <h3 className="text-base font-extrabold text-navy-900 mt-0.5">
                Calibrate Your Scope & Material Expectations
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
              {(['Budget-friendly', 'Balanced', 'Premium'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedTier === tier
                      ? 'bg-white text-navy-900 shadow-soft font-extrabold'
                      : 'text-slate-500 hover:text-navy-900'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#F8FBFF] rounded-2xl p-4 border border-[#E3EAF4] flex items-start gap-3 text-xs text-slate-600">
            <HelpCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Important Note:</strong> Planning preferences represent typical specification baselines, not guaranteed fixed-price packages. All example prices and estimates are illustrative demonstration data. <strong>You retain complete final selection and control.</strong>
            </p>
          </div>
        </div>

        {/* SUCCESS STATE: Project Booked with Selected Provider */}
        {confirmedCreatedProjectId ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E3EAF4] shadow-soft-xl max-w-2xl mx-auto text-center animate-fade-in my-8">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-soft">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Demo Contract Initialized
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-3 mb-2">
              Project Assigned Successfully!
            </h2>

            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Your selected contractor quotation has been locked into your digital project tracking workspace. You can now track milestones, tasks, and site photos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/projects/${confirmedCreatedProjectId}`)}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <span>Open Project Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-2xl transition-colors"
              >
                View in Dashboard
              </button>
            </div>
          </div>
        ) : comparedProfessionals.length === 0 ? (
          /* EMPTY STATE (Section 3 Requirement) */
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#E3EAF4] shadow-soft my-6">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-100">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-navy-900 mb-2">
              No Professionals Selected for Comparison
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
              You haven't selected any contractors yet. Browse our verified directory to pick 2 to 4 candidates, or instantly load the top 3 recommended builders.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleResetToTopThree}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-soft flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Load Top 3 Recommended Contractors</span>
              </button>
              <Link
                to="/professionals"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
              >
                Browse Directory
              </Link>
            </div>
          </div>
        ) : (
          /* Side-by-Side Comparison Table / Cards Matrix */
          <div className="bg-white rounded-3xl border border-[#E3EAF4] shadow-soft-lg overflow-hidden">
            
            {/* Header Row: Contractor Cards */}
            <div className={`grid grid-cols-1 ${
              comparedProfessionals.length === 1 ? 'md:grid-cols-1' :
              comparedProfessionals.length === 2 ? 'md:grid-cols-2' :
              comparedProfessionals.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
            } divide-y md:divide-y-0 md:divide-x divide-slate-200`}>
              {comparedProfessionals.map((pro) => (
                <div key={pro.id} className="p-6 sm:p-7 flex flex-col justify-between bg-white relative">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          pro.tier === 'Premium'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : pro.tier === 'Balanced'
                            ? 'bg-brand-50 text-brand-700 border border-brand-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {pro.tier}
                      </span>

                      <button
                        onClick={() => toggleCompare(pro.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3.5 mb-3">
                      <SafeImage
                        src={pro.avatar}
                        alt={pro.name}
                        fallbackText={pro.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
                      />
                      <div>
                        <h3 className="font-extrabold text-navy-900 text-base leading-tight">
                          {pro.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{pro.trade}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs mb-4">
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pro.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-400">({pro.reviewCount} verified reviews)</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-600">{pro.experienceYears} yrs</span>
                    </div>

                    {/* Indicative Quotation Box */}
                    <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-4 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
                        Indicative Quotation ({draftPlan?.builtUpArea || 2400} sq. ft)
                      </span>
                      <div className="text-2xl font-black text-brand-600 mt-0.5">
                        {pro.quotationSample ? formatINR(pro.quotationSample.indicativePrice) : formatINR(pro.dailyRate ? pro.dailyRate * 120 : 5160000)}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {pro.projectRateRange || (pro.dailyRate ? `₹${pro.dailyRate}/day rate` : 'Turnkey Bid')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectProvider(pro)}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Select Provider</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Section: Estimated Timeline & Availability */}
            <div className="border-t border-slate-200 bg-[#F8FBFF] px-6 py-3">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Project Schedule & Team
              </span>
            </div>
            <div className={`grid grid-cols-1 ${
              comparedProfessionals.length === 1 ? 'md:grid-cols-1' :
              comparedProfessionals.length === 2 ? 'md:grid-cols-2' :
              comparedProfessionals.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
            } divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200`}>
              {comparedProfessionals.map((pro) => (
                <div key={pro.id} className="p-5 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Estimated Duration:</span>
                    <span className="font-bold text-navy-900">
                      {pro.quotationSample?.durationEstimate || '8 - 9 Months'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Current Availability:</span>
                    <span className="font-bold text-emerald-600">{pro.availability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Active Crew Size:</span>
                    <span className="font-bold text-navy-900">{pro.tier === 'Premium' ? '12 - 16 Workers' : pro.tier === 'Balanced' ? '8 - 10 Workers' : '6 - 8 Workers'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Section: Scope of Work */}
            <div className="bg-[#F8FBFF] px-6 py-3">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Scope of Work Included
              </span>
            </div>
            <div className={`grid grid-cols-1 ${
              comparedProfessionals.length === 1 ? 'md:grid-cols-1' :
              comparedProfessionals.length === 2 ? 'md:grid-cols-2' :
              comparedProfessionals.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
            } divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200`}>
              {comparedProfessionals.map((pro) => (
                <div key={pro.id} className="p-5">
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(pro.quotationSample?.scope || [
                      'Standard foundation and structural column casting',
                      'Brickwork and AAC block masonry',
                      'Internal concealed conduit piping',
                      'Floor tiling and 2-coat painting'
                    ]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Section: Exclusions */}
            <div className="bg-[#F8FBFF] px-6 py-3">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Exclusions (What's NOT Included)
              </span>
            </div>
            <div className={`grid grid-cols-1 ${
              comparedProfessionals.length === 1 ? 'md:grid-cols-1' :
              comparedProfessionals.length === 2 ? 'md:grid-cols-2' :
              comparedProfessionals.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
            } divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200`}>
              {comparedProfessionals.map((pro) => (
                <div key={pro.id} className="p-5">
                  <ul className="space-y-2 text-xs text-slate-600">
                    {(pro.quotationSample?.exclusions || [
                      'Municipal property tax and electricity meter deposit',
                      'Designer chandeliers and loose furniture'
                    ]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Section: Materials & Warranty */}
            <div className="bg-[#F8FBFF] px-6 py-3">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Materials Specifications & Guarantee
              </span>
            </div>
            <div className={`grid grid-cols-1 ${
              comparedProfessionals.length === 1 ? 'md:grid-cols-1' :
              comparedProfessionals.length === 2 ? 'md:grid-cols-2' :
              comparedProfessionals.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
            } divide-y md:divide-y-0 md:divide-x divide-slate-200`}>
              {comparedProfessionals.map((pro) => (
                <div key={pro.id} className="p-5 text-xs space-y-3 text-slate-600">
                  <div>
                    <span className="font-bold text-navy-900 block mb-0.5">Material Grades:</span>
                    <p className="text-slate-600 leading-relaxed">
                      {pro.quotationSample?.materialsDetails || 'Standard ISI certified rebar and 43-grade cement.'}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-navy-900 block mb-0.5">Warranty & Guarantee:</span>
                    <div className="inline-flex items-center gap-1.5 text-brand-700 font-semibold bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                      <span>{pro.quotationSample?.warranty || '3-Year Structural Guarantee'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Modal: Selected Provider Review Confirmation (Section 3 & 6 Requirement) */}
        {selectedProviderForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E3EAF4] shadow-soft-xl">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <FileCheck2 className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-extrabold text-navy-900 mb-1">
                Confirm Provider Selection
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                You are designating <strong>{selectedProviderForReview.name}</strong> as your chosen contractor for milestone project execution.
              </p>

              <div className="bg-[#F8FBFF] rounded-2xl p-4 border border-[#E3EAF4] space-y-2.5 text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Project Name:</span>
                  <span className="font-bold text-navy-900">{draftPlan?.title || 'Modern Residential Villa'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contractor:</span>
                  <span className="font-bold text-navy-900">{selectedProviderForReview.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Planning Tier:</span>
                  <span className="font-bold text-brand-600">{selectedProviderForReview.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Indicative Quote:</span>
                  <span className="font-bold text-navy-900">
                    {formatINR(selectedProviderForReview.quotationSample?.indicativePrice || (selectedProviderForReview.dailyRate ? selectedProviderForReview.dailyRate * 120 : 5160000))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-navy-900">{selectedProviderForReview.quotationSample?.durationEstimate || '8 Months'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Warranty:</span>
                  <span className="font-bold text-emerald-600">{selectedProviderForReview.quotationSample?.warranty || '5 Years'}</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-800 mb-6">
                <strong>Demonstration Note:</strong> Confirming this booking will create a sample project in your customer dashboard with zero real financial deduction.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProviderForReview(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmProvider}
                  className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 shadow-soft"
                >
                  Confirm & Book Project
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
