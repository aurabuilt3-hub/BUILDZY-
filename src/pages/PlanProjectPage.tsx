import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  MapPin, 
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatCompactINR } from '../lib/pricing/formatINR';
import { CITIES, calculateConstructionEstimate } from '../lib/pricing/pricingEngine';
import { calculateMaterialQuantities } from '../lib/pricing/quantityCalculator';
import { calculateCriticalPathSchedule } from '../lib/pricing/schedulingEngine';
import { aiEstimationService } from '../lib/pricing/aiEstimationService';
import { estimationService } from '../services/estimationService';

export const PlanProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addProject, selectedTier, setSelectedTier, draftPlan, setDraftPlan } = useApp();

  const urlType = searchParams.get('type');
  const urlArea = searchParams.get('area');
  const urlCity = searchParams.get('city');
  const urlTier = searchParams.get('tier');

  const [step, setStep] = useState<number>(1);
  const [selectedCityId, setSelectedCityId] = useState<string>(urlCity || 'mumbai');
  const [projectType, setProjectType] = useState<string>(
    urlType || draftPlan?.type?.split(' (')[0] || 'Residential Villa Construction'
  );
  const [builtUpArea, setBuiltUpArea] = useState<number>(
    urlArea ? parseInt(urlArea, 10) : draftPlan?.builtUpArea || 2200
  );
  const [floorCount, setFloorCount] = useState<number>(draftPlan?.floorCount || 2);
  const [projectTitle, setProjectTitle] = useState<string>(draftPlan?.title || 'Grand Horizon 3BHK Residence');
  const [location, setLocation] = useState<string>(draftPlan?.location || 'Hiranandani Estate, Thane, Mumbai MMR');
  const [timelineMonths, setTimelineMonths] = useState<number>(draftPlan?.timelineMonths || 8);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ title?: string; location?: string }>({});

  useEffect(() => {
    if (urlTier) {
      if (urlTier === 'Basic') setSelectedTier('Budget-friendly');
      else if (urlTier === 'Standard') setSelectedTier('Balanced');
      else if (urlTier === 'Premium') setSelectedTier('Premium');
    }
  }, [urlTier, setSelectedTier]);

  // Pricing calculation via shared engine
  const mappedTier = selectedTier === 'Budget-friendly' ? 'Basic' : selectedTier === 'Balanced' ? 'Standard' : 'Premium';
  const estimateData = React.useMemo(() => {
    return calculateConstructionEstimate(builtUpArea, mappedTier, selectedCityId);
  }, [builtUpArea, mappedTier, selectedCityId]);

  // Material quantities via quantityCalculator
  const materialQuantities = React.useMemo(() => {
    return calculateMaterialQuantities({ builtUpAreaSqFt: builtUpArea }, selectedCityId);
  }, [builtUpArea, selectedCityId]);

  const estimatedBudget = estimateData.totalEstimatedCostINR;
  const budgetRangeMin = estimateData.rangeMinINR;
  const budgetRangeMax = estimateData.rangeMaxINR;

  const handleStep1Next = () => {
    if (!projectTitle.trim()) {
      setValidationErrors((prev) => ({ ...prev, title: 'Please provide a working project title' }));
      return;
    }
    setValidationErrors((prev) => ({ ...prev, title: undefined }));
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!location.trim()) {
      setValidationErrors((prev) => ({ ...prev, location: 'Please specify the construction site location' }));
      return;
    }
    setValidationErrors((prev) => ({ ...prev, location: undefined }));
    setStep(3);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);

    // 1. Calculate deterministic CPM schedule
    const scheduleForecast = calculateCriticalPathSchedule(builtUpArea);

    // 2. Formulate AI complete estimation package
    const completeResult = aiEstimationService.generateCompleteEstimate({
      userPrompt: `${projectType} in ${location}`,
      projectCity: selectedCityId,
      estimatedAreaSqFt: builtUpArea,
      qualityTier: mappedTier as any,
    });

    // 3. Save immutable estimate version
    await estimationService.saveEstimateVersion(
      completeResult,
      'demo-customer-id'
    );

    setTimeout(() => {
      setIsGenerating(false);
      const generated = {
        title: projectTitle,
        type: `${projectType} (${builtUpArea} sq. ft)`,
        tier: selectedTier,
        budgetRange: `${formatCompactINR(budgetRangeMin)} - ${formatCompactINR(budgetRangeMax)}`,
        estimatedBudget,
        timeline: `${scheduleForecast.totalMonthsEstimate} Months (${scheduleForecast.totalCalendarDays} Days)`,
        milestonesCount: 5,
        curingDays: scheduleForecast.curingBufferDaysTotal,
        criticalTasks: scheduleForecast.criticalPathTaskIds.length,
        scheduleForecast,
        completeResult,
      };
      setGeneratedPlan(generated);
      setDraftPlan({
        title: projectTitle,
        type: `${projectType} (${builtUpArea} sq. ft)`,
        builtUpArea,
        floorCount,
        location,
        timelineMonths: Math.round(scheduleForecast.totalMonthsEstimate),
        tier: selectedTier,
        estimatedBudget,
        budgetRangeMin,
        budgetRangeMax,
      });
      setStep(4);
    }, 700);
  };

  const handleCreateAndProceed = () => {
    const newProj = addProject({
      title: projectTitle,
      type: `${projectType} (${builtUpArea} sq. ft)`,
      location,
      startDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      estimatedCompletion: `In ${timelineMonths} months`,
      progressPercentage: 10,
      budgetEstimated: estimatedBudget,
      agreedQuotation: estimatedBudget,
      amountSpent: Math.round(estimatedBudget * 0.15),
      tier: selectedTier,
      status: 'In Progress',
      contractor: {
        name: selectedTier === 'Premium' ? 'Apex Heritage Builders' : selectedTier === 'Balanced' ? 'Vanguard Structural & Works' : 'Metro Craft Foundations',
        company: selectedTier === 'Premium' ? 'Apex Heritage Group Ltd.' : selectedTier === 'Balanced' ? 'Vanguard Civil Solutions' : 'Metro Craft Co.',
        avatar: selectedTier === 'Premium' 
          ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=400&auto=format&fit=crop&q=80'
          : selectedTier === 'Balanced'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        phone: '+1 (555) 234-8901',
        rating: 4.9,
      },
      assignedWorkersCount: selectedTier === 'Premium' ? 12 : 8,
      milestones: [
        {
          id: 'm-gen-1',
          title: 'Site Demarcation & Foundation Casting',
          description: 'Soil test, excavation, anti-termite, plinth beam and column foundation.',
          percentage: 50,
          status: 'In Progress',
          targetDate: 'Month 1',
          payoutAmount: Math.round(estimatedBudget * 0.20),
          isPaid: false,
        },
        {
          id: 'm-gen-2',
          title: 'Ground & Upper Superstructure RCC Frame',
          description: 'Columns, beam reinforcement, shuttering and floor slab casting.',
          percentage: 0,
          status: 'Upcoming',
          targetDate: 'Month 3',
          payoutAmount: Math.round(estimatedBudget * 0.25),
          isPaid: false,
        },
        {
          id: 'm-gen-3',
          title: 'Masonry, Plaster & MEP Rough-Ins',
          description: 'AAC blocks/brickwork, internal conduit piping, electrical switchboxes.',
          percentage: 0,
          status: 'Upcoming',
          targetDate: 'Month 5',
          payoutAmount: Math.round(estimatedBudget * 0.20),
          isPaid: false,
        },
        {
          id: 'm-gen-4',
          title: 'Flooring, Bathroom Waterproofing & Joinery',
          description: 'Vitrified tiles, bathroom membranes, doors, window jambs.',
          percentage: 0,
          status: 'Upcoming',
          targetDate: 'Month 7',
          payoutAmount: Math.round(estimatedBudget * 0.20),
          isPaid: false,
        },
        {
          id: 'm-gen-5',
          title: 'Finishing Coats, Fittings & Final OC Handover',
          description: 'Paint coats, sanitary fixtures, deep cleaning and key handover.',
          percentage: 0,
          status: 'Upcoming',
          targetDate: `Month ${timelineMonths}`,
          payoutAmount: Math.round(estimatedBudget * 0.15),
          isPaid: false,
        },
      ],
      tasks: [
        { id: 'tg-1', title: 'Site topography and soil compaction check', status: 'Completed', assignedTo: 'Lead Structural Eng.', dueDate: 'Done', category: 'Foundation' },
        { id: 'tg-2', title: 'Order first steel rebar reinforcement batch', status: 'In Progress', assignedTo: 'Procurement Specialist', dueDate: 'Tomorrow', category: 'Materials' },
        { id: 'tg-3', title: 'Finalize bathroom tile samples with owner', status: 'Pending', assignedTo: 'Interior Coordinator', dueDate: 'Next Week', category: 'Design' }
      ],
      materials: [
        { id: 'mg-1', name: 'Grade-53 Portland Cement (Foundation)', quantity: '350 Bags', estimatedCost: 3850, status: 'Ordered', supplier: 'Buildzy Direct Hub' },
        { id: 'mg-2', name: 'Fe-500D TMT Reinforcement Steel', quantity: '3.8 Metric Tons', estimatedCost: 15200, status: 'Requisitioned', supplier: 'National Steel Mills' },
      ],
      photos: [
        {
          id: 'pg-1',
          title: 'Excavation & plinth survey completed',
          date: '10 Oct 2026',
          imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
          milestoneTitle: 'Foundation Casting'
        }
      ]
    });

    navigate(`/projects/${newProj.id}`);
  };

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            AI-Assisted Project Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-2">
            Plan a Complete Project
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Configure requirements, explore budget tiers, and generate a transparent milestone roadmap with contractor options.
          </p>
        </div>

        {/* Multi-Step Stepper Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#E3EAF4] shadow-soft mb-8 flex items-center justify-between">
          {[
            { num: 1, label: 'Scope & Area' },
            { num: 2, label: 'Timeline & Site' },
            { num: 3, label: 'Budget Tier' },
            { num: 4, label: 'AI Blueprint' },
          ].map((item, idx) => (
            <div key={item.num} className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                  step === item.num
                    ? 'bg-brand-500 text-white shadow-soft'
                    : step > item.num
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > item.num ? <CheckCircle2 className="w-4 h-4" /> : item.num}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${step === item.num ? 'text-navy-900' : 'text-slate-400'}`}>
                {item.label}
              </span>
              {idx < 3 && <div className="hidden sm:block flex-1 h-0.5 bg-slate-100 mx-2" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Project Scope & Dimensions */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft animate-fade-in">
            <h2 className="text-xl font-bold text-navy-900 mb-1">Step 1: Project Scope & Dimensions</h2>
            <p className="text-xs text-slate-500 mb-6">Choose project category and specify built-up area</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Project Classification</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Residential Villa Construction', desc: 'Ground-up independent house' },
                    { id: 'Full Apartment Remodel', desc: 'Interior civil & turnkey overhaul' },
                    { id: 'Kitchen & Floor Extension', desc: 'Structural addition or terrace build' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProjectType(p.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        projectType === p.id
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <h4 className="font-bold text-sm text-navy-900 mb-1">{p.id}</h4>
                      <p className="text-[11px] text-slate-500">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Estimated Built-Up Area (sq. ft)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="600"
                      max="5000"
                      step="100"
                      value={builtUpArea}
                      onChange={(e) => setBuiltUpArea(parseInt(e.target.value))}
                      className="flex-1 accent-brand-500"
                    />
                    <span className="font-extrabold text-navy-900 text-sm bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 min-w-24 text-center">
                      {builtUpArea} sq. ft
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Number of Floors</label>
                  <select
                    value={floorCount}
                    onChange={(e) => setFloorCount(parseInt(e.target.value))}
                    className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-900"
                  >
                    <option value={1}>Ground Floor Only (G+0)</option>
                    <option value={2}>Ground + 1 Floor (G+1 Duplex)</option>
                    <option value={3}>Ground + 2 Floors (G+2 Triplex)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Working Name</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => {
                    setProjectTitle(e.target.value);
                    if (validationErrors.title) setValidationErrors(prev => ({ ...prev, title: undefined }));
                  }}
                  placeholder="e.g. Modern Horizon Villa"
                  className={`w-full bg-[#F8FBFF] border ${validationErrors.title ? 'border-rose-400' : 'border-[#E3EAF4]'} rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-900`}
                />
                {validationErrors.title && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl shadow-soft transition-all flex items-center gap-2"
                >
                  <span>Continue to Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Timeline & Site Location */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft animate-fade-in">
            <h2 className="text-xl font-bold text-navy-900 mb-1">Step 2: Timeline & Site Location</h2>
            <p className="text-xs text-slate-500 mb-6">Specify project location and delivery goals</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Site / Plot Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (validationErrors.location) setValidationErrors(prev => ({ ...prev, location: undefined }));
                    }}
                    placeholder="e.g. Westwood Heights, Sector 12"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-[#F8FBFF] border ${validationErrors.location ? 'border-rose-400' : 'border-[#E3EAF4]'} rounded-xl text-sm font-medium text-navy-900`}
                  />
                </div>
                {validationErrors.location && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{validationErrors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Completion Horizon</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { months: 6, label: 'Fast-Track (6 Months)', desc: 'Accelerated double-shift crew' },
                    { months: 8, label: 'Standard (8 Months)', desc: 'Balanced cure & finish pacing' },
                    { months: 12, label: 'Phased (12 Months)', desc: 'Staggered stage funding' },
                  ].map((t) => (
                    <button
                      key={t.months}
                      type="button"
                      onClick={() => setTimelineMonths(t.months)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        timelineMonths === t.months
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <h4 className="font-bold text-sm text-navy-900">{t.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-600 hover:text-navy-900 font-bold px-4 py-2 text-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl shadow-soft transition-all flex items-center gap-2"
                >
                  <span>Select Planning Preference</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Planning Tier Preference Selection */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-xl font-bold text-navy-900">Step 3: Select Planning Tier Preference</h2>
                <p className="text-xs text-slate-500">
                  Planning preferences help calibrate material grades and scope. Not a locked fixed-package.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 self-start">
                Demonstration Estimates
              </span>
            </div>

            {/* City Selector for Project Location */}
            <div className="mb-6 bg-[#F8FBFF] p-4 rounded-2xl border border-[#E3EAF4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-navy-900 block">Pricing Calibration City:</span>
                <span className="text-[11px] text-slate-500">Adjusts labour & material index for construction</span>
              </div>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="bg-white border border-[#E3EAF4] rounded-xl px-3 py-2 text-xs font-bold text-navy-900 focus:outline-none focus:border-brand-500"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.state}) — {c.regionTier}
                  </option>
                ))}
              </select>
            </div>

            {/* 3 Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {[
                {
                  id: 'Budget-friendly' as const,
                  title: 'Basic / Standard',
                  tagline: 'Essential structural durability',
                  rate: `₹${Math.round(1550 * estimateData.city.overallMultiplier).toLocaleString('en-IN')} / sq. ft`,
                  materials: 'Kamdhenu/Jindal Fe-500 TMT, UltraTech PPC cement, standard ceramic & vitrified tiles, Anchor wiring.',
                  warranty: '5-Year Structural Workmanship Warranty',
                },
                {
                  id: 'Balanced' as const,
                  title: 'Standard Living (Most Popular)',
                  tagline: 'Best blend of quality & durability',
                  rate: `₹${Math.round(2150 * estimateData.city.overallMultiplier).toLocaleString('en-IN')} / sq. ft`,
                  materials: 'Tata Tiscon / JSW Fe-500D steel, UltraTech Super cement, 800x800 Kajaria vitrified tiles, Jaquar bath sets.',
                  warranty: '10-Year Structural + 2-Year Maintenance',
                },
                {
                  id: 'Premium' as const,
                  title: 'Premium Architectural',
                  tagline: 'Luxury finishes & seismic engineering',
                  rate: `₹${Math.round(3150 * estimateData.city.overallMultiplier).toLocaleString('en-IN')} / sq. ft`,
                  materials: 'Tata Tiscon Fe-550D rebar, OPC-53 cement, 800x1600 vitrified slabs, Kohler sanitary, smart home automation.',
                  warranty: '15-Year Structural + 3-Year Seepage Guarantee',
                },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedTier === tier.id
                      ? 'border-brand-500 bg-brand-50/50 shadow-soft-lg ring-2 ring-brand-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
                        {tier.title}
                      </span>
                      {selectedTier === tier.id && (
                        <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="text-2xl font-black text-navy-900 mb-1">{tier.rate}</div>
                    <p className="text-[11px] text-slate-500 mb-4">{tier.tagline}</p>

                    <div className="space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
                      <p><strong>Materials:</strong> {tier.materials}</p>
                      <p><strong>Guarantee:</strong> {tier.warranty}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                    <span className="text-xs font-bold text-brand-600">
                      {selectedTier === tier.id ? 'Selected Preference' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time estimate calculation pill */}
            <div className="bg-[#F8FBFF] rounded-2xl p-5 border border-[#E3EAF4] flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs text-slate-500 block">Indicative Budget for {builtUpArea.toLocaleString('en-IN')} sq. ft ({selectedTier}) in {estimateData.city.name}:</span>
                <span className="text-2xl font-black text-navy-900">
                  {formatCompactINR(budgetRangeMin)} - {formatCompactINR(budgetRangeMax)} ({formatINR(estimatedBudget)})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs text-center sm:text-right">
                Includes structural RCC, finishes, 18% GST estimate, and 5% contingency reserve.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-slate-600 hover:text-navy-900 font-bold px-4 py-2 text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Generating AI Project Architecture...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-brand-200" />
                    <span>Generate AI Project Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Generated AI Blueprint & Next Steps */}
        {step === 4 && generatedPlan && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Announcement */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-3xl p-6 sm:p-8 shadow-soft-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-200 bg-white/10 px-3 py-1 rounded-full">
                  AI Plan Generated
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">{generatedPlan.title}</h2>
                <p className="text-sm text-brand-100 mt-1">
                  {generatedPlan.type} • {location} • {generatedPlan.timeline}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right">
                <span className="text-xs text-brand-100 block">Estimated Budget</span>
                <span className="text-2xl font-black">{generatedPlan.budgetRange}</span>
              </div>
            </div>

            {/* CPM Critical-Path Duration Prediction Card */}
            {generatedPlan.scheduleForecast && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      CPM Critical-Path Duration Prediction
                    </span>
                    <h3 className="text-lg font-bold text-navy-900 mt-1">
                      Construction Schedule & Sequential Task Network
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Forecast Duration</span>
                    <span className="text-sm font-black text-navy-900">
                      {generatedPlan.scheduleForecast.totalCalendarDays} Calendar Days ({generatedPlan.scheduleForecast.totalWorkingDays} Working Days)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-5">
                  <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                    <span className="text-slate-400 block font-medium">Critical Path Activities</span>
                    <span className="text-base font-extrabold text-navy-900 mt-0.5 block">
                      {generatedPlan.scheduleForecast.criticalPathTaskIds.length} Key Milestones
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Zero-float sequential path</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                    <span className="text-slate-400 block font-medium">Mandatory Concrete Curing</span>
                    <span className="text-base font-extrabold text-brand-700 mt-0.5 block">
                      {generatedPlan.scheduleForecast.curingBufferDaysTotal} Total Days
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Slab ponding & plaster drying</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                    <span className="text-slate-400 block font-medium">Schedule Confidence</span>
                    <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                      {generatedPlan.scheduleForecast.confidence} Confidence
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Engine: {generatedPlan.scheduleForecast.version}</span>
                  </div>
                </div>

                {/* Plain-Language Explanation */}
                {generatedPlan.completeResult?.aiExplanation && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed mb-4">
                    <strong className="text-navy-900 block mb-1">AI Scope & Budget Explanation:</strong>
                    {generatedPlan.completeResult.aiExplanation}
                  </div>
                )}
              </div>
            )}

            {/* 5 Milestone Breakdown */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Automated Milestone Payout Stages</h3>
              <p className="text-xs text-slate-500 mb-6">
                Funds are held in secure escrow simulation and released only after customer photo & site verification.
              </p>

              <div className="space-y-3">
                {[
                  { name: 'Stage 1: Soil Test & Foundation Casting', percent: '20%', duration: 'Weeks 1 - 6', desc: 'Excavation, anti-termite, plinth beam' },
                  { name: 'Stage 2: RCC Superstructure & Columns', percent: '25%', duration: 'Weeks 7 - 14', desc: 'Columns, ceiling shuttering, concrete curing' },
                  { name: 'Stage 3: Masonry & Conduit Concealment', percent: '20%', duration: 'Weeks 15 - 22', desc: 'AAC blocks, plumbing lines, electrical wiring boxes' },
                  { name: 'Stage 4: Flooring, Waterproofing & Joinery', percent: '20%', duration: 'Weeks 23 - 28', desc: 'Vitrified tiles, bathroom membranes, doors' },
                  { name: 'Stage 5: Paint Finishing & Final OC Handover', percent: '15%', duration: 'Weeks 29 - 32', desc: 'Royale emulsion, sanitary fittings, clean handover' },
                ].map((m, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                        0{i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-navy-900">{m.name}</h4>
                        <p className="text-[11px] text-slate-500">{m.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 sm:text-right">
                      <span className="text-slate-400">{m.duration}</span>
                      <span className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md border border-brand-200">
                        {m.percent} Payout
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill of Materials (BOM) Calculation Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-navy-900">Standard Material Quantity Estimate (CPWD Calibrated)</h3>
                  <p className="text-xs text-slate-500">
                    Rule-of-thumb requirements for {builtUpArea.toLocaleString('en-IN')} sq. ft with 7% cutting & transit allowance
                  </p>
                </div>
                <span className="text-xs font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full self-start">
                  Est. Materials: {formatINR(materialQuantities.estimatedMaterialCostINR)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs mb-4">
                <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                  <span className="text-slate-500 block font-medium">Cement (50kg bags)</span>
                  <span className="text-base font-extrabold text-navy-900">{materialQuantities.cementBags.toLocaleString('en-IN')} bags</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">~0.40 bags / sq.ft</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                  <span className="text-slate-500 block font-medium">TMT Steel (Fe-500D)</span>
                  <span className="text-base font-extrabold text-navy-900">{materialQuantities.steelKg.toLocaleString('en-IN')} kg</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{(materialQuantities.steelKg / 1000).toFixed(1)} metric tons</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                  <span className="text-slate-500 block font-medium">M-Sand (Concrete)</span>
                  <span className="text-base font-extrabold text-navy-900">{materialQuantities.sandCft.toLocaleString('en-IN')} cu. ft</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Washed quarry sand</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                  <span className="text-slate-500 block font-medium">Coarse Aggregate</span>
                  <span className="text-base font-extrabold text-navy-900">{materialQuantities.aggregateCft.toLocaleString('en-IN')} cu. ft</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">20mm/10mm granite</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                  <span className="text-slate-500 block font-medium">Bricks / AAC Blocks</span>
                  <span className="text-base font-extrabold text-navy-900">{materialQuantities.bricksCount.toLocaleString('en-IN')} units</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">First class red clay / blocks</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                  <span className="text-slate-500 block font-medium">Vitrified Floor Tiles</span>
                  <span className="text-base font-extrabold text-navy-900">{materialQuantities.tilesSqFt.toLocaleString('en-IN')} sq. ft</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Flooring + skirting + waste</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
                  <span className="text-slate-500 block font-medium">Paint & Primer</span>
                  <span className="text-base font-extrabold text-navy-900">{materialQuantities.paintLiters.toLocaleString('en-IN')} liters</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">3-coat surface system</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block font-medium">Waste Contingency</span>
                  <span className="text-base font-extrabold text-emerald-800">7.0%</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Site cutting allowance</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                * Note: Material estimations reflect standard civil residential norms. Final quantities depend on structural architectural blueprints and site soil bearing reports.
              </div>
            </div>

            {/* Call to Actions: Compare Quotations vs Track in Dashboard */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-base font-bold text-navy-900">What would you like to do next?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  You can compare contractor quotation bids side-by-side or launch the live project tracking dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/compare')}
                  className="bg-white hover:bg-slate-50 border border-brand-200 text-brand-600 font-bold px-6 py-3 rounded-2xl transition-colors text-sm shadow-xs flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Compare 3 Contractor Quotes</span>
                </button>

                <button
                  onClick={handleCreateAndProceed}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all text-sm flex items-center gap-2"
                >
                  <span>Launch Project Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
