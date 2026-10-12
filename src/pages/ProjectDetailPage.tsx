import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  ArrowLeft,
  X,
  Send,
  Eye,
  Star,
  ShieldCheck,
  Sparkles,
  ThumbsUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../lib/pricing/formatINR';
import { SafeImage } from '../components/common/SafeImage';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateMilestoneStatus, updateTaskStatus, updateMaterialStatus, addProjectFeedback, user } = useApp();

  const project = projects.find((p) => p.id === id) || projects[0];

  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks' | 'photos' | 'materials' | 'finances' | 'feedback'>('milestones');
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  
  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackCategory, setFeedbackCategory] = useState<'Quality of Work' | 'Timeliness' | 'Communication' | 'Budget Adherence' | 'Overall Experience'>('Overall Experience');
  const [feedbackComment, setFeedbackComment] = useState<string>('The site crew has been highly professional, keeping the build on track according to the milestone roadmap.');

  // Chat message state
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'contractor'; text: string; time: string }[]>([
    {
      sender: 'contractor',
      text: 'Good morning Alexander! Today the site team is finishing up the conduit concealment on the first floor.',
      time: '09:15 AM'
    }
  ]);

  if (!project) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Project not found</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-brand-600 font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setChatMessage('');

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'contractor',
          text: `Acknowledged: "${userMsg}". Site Supervisor Marcus will inspect this during the afternoon round.`,
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    addProjectFeedback(project.id, {
      rating: feedbackRating,
      category: feedbackCategory,
      comment: feedbackComment.trim(),
      authorName: user.name || 'Alexander Reed',
    });

    setFeedbackModalOpen(false);
    setActiveTab('feedback');
  };

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Dashboard</span>
        </button>

        {/* Project Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  {project.tier} Plan
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {project.status}
                </span>
                <span className="text-xs text-slate-400">ID: {project.id}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.location}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Started: {project.startDate}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target: {project.estimatedCompletion}</span>
                </div>
              </div>
            </div>

            {/* Financial Quick Glance */}
            <div className="flex flex-wrap gap-4 sm:gap-6 lg:text-right">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Agreed Quotation</span>
                <span className="text-xl sm:text-2xl font-black text-navy-900">
                  {formatINR(project.agreedQuotation)}
                </span>
              </div>
              <div className="pl-4 sm:pl-6 border-l border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block">Released Payouts</span>
                <span className="text-xl sm:text-2xl font-black text-brand-600">
                  {formatINR(project.amountSpent)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Contractor Info */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Progress status */}
            <div className="md:col-span-6 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Overall Milestone Progress</span>
                <span className="text-brand-600">{project.progressPercentage}% Completed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Based on verified structural stages and approved inspections.
              </p>
            </div>

            {/* Contractor Contact Quick Bar & Feedback Trigger */}
            <div className="md:col-span-6 bg-[#F8FBFF] rounded-2xl p-4 border border-[#E3EAF4] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <SafeImage
                  src={project.contractor.avatar}
                  alt={project.contractor.name}
                  fallbackText={project.contractor.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-navy-900">{project.contractor.name}</h4>
                  <span className="text-[11px] text-slate-500 block">{project.assignedWorkersCount} crew on site</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMessageModalOpen(true)}
                  className="bg-white hover:bg-brand-50 text-brand-600 border border-brand-200 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-soft"
                >
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Feedback</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#E3EAF4]">
          {[
            { id: 'milestones' as const, label: 'Milestones & Timeline', count: project.milestones.length },
            { id: 'tasks' as const, label: 'Task Checklist', count: project.tasks.length },
            { id: 'photos' as const, label: 'Site Photos', count: project.photos.length },
            { id: 'materials' as const, label: 'Materials Log', count: project.materials.length },
            { id: 'finances' as const, label: 'Cost & Escrow', count: null },
            { id: 'feedback' as const, label: 'Reviews & Feedback', count: project.feedbacks?.length || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'bg-white text-slate-600 hover:text-navy-900 border border-[#E3EAF4]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: MILESTONES & TIMELINE */}
        {activeTab === 'milestones' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 border border-[#E3EAF4] shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-navy-900">Project Milestone Roadmap</h3>
                  <p className="text-xs text-slate-500">
                    Click status button to simulate milestone advancement and verified payment approvals.
                  </p>
                </div>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 self-start">
                  Interactive Demo State
                </span>
              </div>

              <div className="space-y-4">
                {project.milestones.map((m, idx) => {
                  const isCompleted = m.status === 'Completed';
                  const isInProgress = m.status === 'In Progress';

                  return (
                    <div
                      key={m.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : isInProgress
                          ? 'bg-brand-50/40 border-brand-300 ring-2 ring-brand-100'
                          : 'bg-[#F8FBFF] border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isInProgress
                                ? 'bg-brand-500 text-white shadow-soft'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `0${idx + 1}`}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-navy-900">{m.title}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isInProgress
                                    ? 'bg-brand-100 text-brand-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {m.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mt-1 max-w-xl">{m.description}</p>
                            <span className="text-[11px] text-slate-400 block mt-1.5">
                              Target Date: {m.targetDate} • Payout Allocation: {formatINR(m.payoutAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Status Change Interactive Buttons */}
                        <div className="flex items-center gap-2 self-start md:self-center">
                          {m.status !== 'Completed' ? (
                            <button
                              onClick={() => updateMilestoneStatus(project.id, m.id, 'Completed')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Complete</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => updateMilestoneStatus(project.id, m.id, 'In Progress')}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                            >
                              Re-open Milestone
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TASKS CHECKLIST */}
        {activeTab === 'tasks' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 border border-[#E3EAF4] shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-navy-900">Task Checklist</h3>
                  <p className="text-xs text-slate-500">Live on-site tasks assigned to site supervisors and leads</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4] gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            project.id,
                            task.id,
                            task.status === 'Completed' ? 'In Progress' : 'Completed'
                          )
                        }
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 bg-white hover:border-brand-500'
                        }`}
                      >
                        {task.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <span
                          className={`text-xs font-bold ${
                            task.status === 'Completed' ? 'line-through text-slate-400' : 'text-navy-900'
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>Assigned: {task.assignedTo}</span>
                          <span>•</span>
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(project.id, task.id, e.target.value as any)}
                        className="bg-white border border-[#E3EAF4] text-xs font-semibold rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none focus:border-brand-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SITE PHOTOS */}
        {activeTab === 'photos' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 border border-[#E3EAF4] shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-navy-900">Site Progress Photo Records</h3>
                  <p className="text-xs text-slate-500">Verified site engineer timestamped uploads</p>
                </div>
                <span className="text-xs font-bold text-slate-400">{project.photos.length} photos logged</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {project.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setPhotoModalUrl(photo.imageUrl)}
                    className="group relative rounded-2xl overflow-hidden border border-[#E3EAF4] shadow-xs cursor-pointer aspect-square"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-90 p-3.5 flex flex-col justify-end text-white">
                      <span className="text-[10px] font-bold uppercase text-brand-300 tracking-wider">
                        {photo.milestoneTitle}
                      </span>
                      <p className="text-xs font-bold line-clamp-2 mt-0.5">{photo.title}</p>
                      <span className="text-[10px] text-slate-300 mt-1">{photo.date}</span>
                    </div>

                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-xs p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 text-navy-900" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MATERIALS LOG (Interactive Status Editing - Section 6 Requirement) */}
        {activeTab === 'materials' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 border border-[#E3EAF4] shadow-soft overflow-x-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-navy-900">Materials Requisition Ledger</h3>
                  <p className="text-xs text-slate-500">Procured and delivered construction supplies with editable statuses</p>
                </div>
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                  Interactive Status Controls
                </span>
              </div>

              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Material Item</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Delivery Status</th>
                    <th className="pb-3">Supplier</th>
                    <th className="pb-3 text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {project.materials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-navy-900">{m.name}</td>
                      <td className="py-3.5">{m.quantity}</td>
                      <td className="py-3.5">
                        <select
                          value={m.status}
                          onChange={(e) => updateMaterialStatus(project.id, m.id, e.target.value as any)}
                          className="bg-white border border-[#E3EAF4] text-xs font-semibold rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer shadow-2xs"
                        >
                          <option value="Requisitioned">Requisitioned</option>
                          <option value="Ordered">Ordered</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Installed">Installed</option>
                        </select>
                      </td>
                      <td className="py-3.5 text-slate-500">{m.supplier}</td>
                      <td className="py-3.5 text-right font-extrabold text-navy-900">
                        {formatINR(m.estimatedCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCES & ESCROW */}
        {activeTab === 'finances' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-[#E3EAF4] shadow-soft">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Total Agreed Value</span>
                <span className="text-2xl font-black text-navy-900">{formatINR(project.agreedQuotation)}</span>
                <p className="text-[11px] text-slate-500 mt-1">Locked contract price</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#E3EAF4] shadow-soft">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Approved Payouts</span>
                <span className="text-2xl font-black text-emerald-600">{formatINR(project.amountSpent)}</span>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Released after sign-off</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#E3EAF4] shadow-soft">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Remaining Escrow</span>
                <span className="text-2xl font-black text-brand-600">
                  {formatINR(Math.max(0, project.agreedQuotation - project.amountSpent))}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Safely held for upcoming stages</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E3EAF4] shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-navy-900">Milestone Payment Release Log</h3>
                <span className="text-xs font-bold text-slate-400">Escrow Simulation</span>
              </div>

              <div className="space-y-3 mb-6">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4] text-xs">
                    <div>
                      <span className="font-bold text-navy-900 block">{m.title}</span>
                      <span className="text-slate-400 text-[11px]">Due: {m.targetDate}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-navy-900">{formatINR(m.payoutAmount)}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          m.isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.isPaid ? 'Released' : 'Pending Escrow'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explicit demonstration disclosure (Section 6 Requirement) */}
              <div className="bg-[#F8FBFF] rounded-2xl p-4 border border-[#E3EAF4] flex items-center gap-3 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <p>
                  <strong>Demonstration Escrow Environment:</strong> Payment states and payout releases represent demonstration tracking logic. No real financial transaction or banking transfer occurs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS & FEEDBACK (Journey requirement) */}
        {activeTab === 'feedback' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-navy-900">Project Reviews & Verified Feedback</h3>
                  <p className="text-xs text-slate-500">
                    Submit customer quality assessments and milestone reviews for the project contractor.
                  </p>
                </div>
                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-soft flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit New Review</span>
                </button>
              </div>

              {(!project.feedbacks || project.feedbacks.length === 0) ? (
                <div className="text-center py-10 bg-[#F8FBFF] rounded-2xl border border-dashed border-[#E3EAF4]">
                  <ThumbsUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-navy-900">No feedback submitted yet</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Share your experience on work quality, team timeliness, or site cleanliness.
                  </p>
                  <button
                    onClick={() => setFeedbackModalOpen(true)}
                    className="bg-brand-50 text-brand-600 border border-brand-200 font-bold text-xs px-4 py-2 rounded-xl hover:bg-brand-100"
                  >
                    Write First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.feedbacks.map((fb) => (
                    <div key={fb.id} className="p-5 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-navy-900">{fb.authorName}</span>
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                            {fb.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{fb.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < fb.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{fb.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Zoom Modal with accessible close */}
        {photoModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-xs animate-fade-in">
            <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
              <button
                onClick={() => setPhotoModalUrl(null)}
                className="absolute top-4 right-4 bg-navy-900/70 hover:bg-navy-900 text-white p-2 rounded-full z-10"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={photoModalUrl} alt="Inspection Full view" className="w-full max-h-[80vh] object-contain bg-black" />
            </div>
          </div>
        )}

        {/* Contractor Messaging Modal with clear demo notice */}
        {messageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E3EAF4] shadow-soft-xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={project.contractor.avatar}
                    alt={project.contractor.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-navy-900">{project.contractor.name}</h3>
                    <span className="text-[11px] text-emerald-600 font-medium">● Active on site (Demo)</span>
                  </div>
                </div>
                <button onClick={() => setMessageModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
                <div className="bg-brand-50/70 border border-brand-200 text-brand-800 p-2.5 rounded-xl text-center text-[11px]">
                  <strong>Demo Interaction:</strong> Messages simulate contractor responses for presentation purposes.
                </div>
                {chatLog.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-brand-500 text-white rounded-br-none'
                          : 'bg-[#F0F7FE] text-navy-900 rounded-bl-none border border-brand-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type an instruction or question..."
                  className="flex-1 bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-xs text-navy-900 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Customer Feedback Submission Modal (Journey Requirement) */}
        {feedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E3EAF4] shadow-soft-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-extrabold text-navy-900 text-lg">Submit Project Review</h3>
                  <span className="text-xs text-slate-400">{project.title}</span>
                </div>
                <button onClick={() => setFeedbackModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                {/* Star rating selector */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-navy-900 text-sm">{feedbackRating} / 5 Stars</span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Review Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as any)}
                    className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 font-medium text-navy-900 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Overall Experience">Overall Experience</option>
                    <option value="Quality of Work">Quality of Work</option>
                    <option value="Timeliness">Timeliness</option>
                    <option value="Communication">Communication</option>
                    <option value="Budget Adherence">Budget Adherence</option>
                  </select>
                </div>

                {/* Comment */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Detailed Feedback Comments</label>
                  <textarea
                    rows={4}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share feedback on site execution, quality of materials or communication..."
                    className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl p-3 font-medium text-navy-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-soft"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
