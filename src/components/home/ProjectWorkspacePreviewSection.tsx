import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  DollarSign, 
  Info,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../lib/pricing/formatINR';

export const ProjectWorkspacePreviewSection: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useApp();

  // Use the primary active project (e.g. proj-101 Modern 3BHK Eco Villa)
  const activeProj = projects[0];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#F5F9FF] border-b border-[#E3EAF4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="max-w-3xl">
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Ongoing Project Coordination
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 mt-2.5 tracking-tight">
              A Connected Workspace from Groundbreak to Handover
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Say goodbye to fragmented WhatsApp chats and disputed paper invoices. Track milestones, verified tasks, site photos, material dispatches, and milestone payout releases in one live dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/projects/${activeProj.id}`)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-soft flex items-center gap-2"
            >
              <span>Explore Active Project #{activeProj.id}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Scenario Callout */}
        <div className="p-3.5 rounded-2xl bg-white border border-brand-200/80 mb-8 flex items-start gap-3 shadow-xs">
          <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-navy-900">Illustrative Demo Workspace:</strong> Reflects genuine project state stored in your browser workspace. Milestones, material requisitions, and photo logs update interactively as tasks complete.
          </p>
        </div>

        {/* Workspace Mockup Card */}
        <div className="bg-white rounded-3xl border border-[#E3EAF4] shadow-soft-lg overflow-hidden">
          
          {/* Workspace Title Bar */}
          <div className="p-6 bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 text-brand-200 text-xs">
                <span>{activeProj.type}</span>
                <span>&bull;</span>
                <span>{activeProj.location}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {activeProj.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <span className="text-slate-300 block text-[10px]">Contractor</span>
                <span className="font-bold">{activeProj.contractor.name}</span>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <span className="text-slate-300 block text-[10px]">Agreed Budget</span>
                <span className="font-bold">{formatINR(activeProj.agreedQuotation)}</span>
              </div>
              <div className="bg-brand-500 text-white px-3 py-1.5 rounded-xl font-extrabold">
                {activeProj.progressPercentage}% Completed
              </div>
            </div>
          </div>

          {/* Interactive Workspace Grid Preview */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Milestones & Expenses */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-extrabold text-navy-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    <span>Contractual Milestones & Escrow Release</span>
                  </h4>
                  <span className="text-xs font-semibold text-slate-400">
                    {activeProj.milestones.filter(m => m.status === 'Completed').length} of {activeProj.milestones.length} Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeProj.milestones.slice(0, 4).map((ms) => (
                    <div
                      key={ms.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-[#F9FBFE] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          ms.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ms.status === 'In Progress'
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-navy-900">{ms.title}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-xs">{ms.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-navy-900 block">{formatINR(ms.payoutAmount)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ms.isPaid 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ms.isPaid ? 'Payout Released' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost & Expense Distribution */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-extrabold text-navy-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-500" />
                  <span>Financial Summary</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Estimated Budget</span>
                    <span className="font-extrabold text-navy-900 text-sm mt-0.5 block">{formatINR(activeProj.budgetEstimated)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Agreed Quotation</span>
                    <span className="font-extrabold text-brand-600 text-sm mt-0.5 block">{formatINR(activeProj.agreedQuotation)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Verified Paid</span>
                    <span className="font-extrabold text-emerald-600 text-sm mt-0.5 block">{formatINR(activeProj.amountSpent)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Site Photos & Daily Tasks */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Site Photos Log */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-extrabold text-navy-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-brand-500" />
                    <span>Site Inspection Photo Logs</span>
                  </h4>
                  <span className="text-xs font-semibold text-brand-600">Geo-tagged</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {activeProj.photos.slice(0, 2).map((photo) => (
                    <div key={photo.id} className="relative rounded-2xl overflow-hidden aspect-[4/3] group border border-slate-200">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <p className="text-[11px] font-bold truncate leading-tight">{photo.title}</p>
                        <p className="text-[9px] text-slate-300">{photo.date} &bull; {photo.milestoneTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Checklist */}
              <div>
                <h4 className="text-sm font-extrabold text-navy-900 mb-3 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-brand-500" />
                  <span>Immediate Active Tasks</span>
                </h4>
                <div className="space-y-2">
                  {activeProj.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-navy-900">{task.title}</p>
                        <p className="text-[10px] text-slate-400">Assigned: {task.assignedTo}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        task.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : task.status === 'In Progress'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected CTA to full workspace */}
              <button
                type="button"
                onClick={() => navigate(`/projects/${activeProj.id}`)}
                className="w-full py-3 rounded-xl bg-[#F5F9FF] hover:bg-brand-50 border border-brand-200 text-brand-600 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Full Interactive Project Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
