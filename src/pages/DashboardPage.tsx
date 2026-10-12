import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  CalendarCheck, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Plus, 
  MapPin, 
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../lib/pricing/formatINR';
import { SafeImage } from '../components/common/SafeImage';

export const DashboardPage: React.FC = () => {
  const { user, projects, bookings } = useApp();
  const navigate = useNavigate();

  const activeProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'Planning');
  const activeBookings = bookings.filter((b) => b.status === 'Scheduled' || b.status === 'In Progress');

  const totalCommitted = projects.reduce((acc, p) => acc + p.agreedQuotation, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.amountSpent, 0);

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300 bg-brand-500/20 px-2.5 py-0.5 rounded-full border border-brand-400/30">
                Customer Project Command Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Monitor active construction milestones, track scheduled labour crews, and inspect verified progress photos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/book-service')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Labour</span>
            </button>
            <button
              onClick={() => navigate('/plan-project')}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-soft transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              <span>Start New Project</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#E3EAF4] shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Active Projects</span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-navy-900">{activeProjects.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">{activeProjects.length} Ongoing build{activeProjects.length !== 1 ? 's' : ''} on site</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E3EAF4] shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Active Bookings</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-navy-900">{activeBookings.length}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">{activeBookings.length} Active booking{activeBookings.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E3EAF4] shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Committed</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-navy-900">{formatINR(totalCommitted)}</div>
            <p className="text-[11px] text-slate-500 mt-1">Across {projects.length} contracted project{projects.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E3EAF4] shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Milestone Payouts</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-navy-900">{formatINR(totalSpent)}</div>
            <p className="text-[11px] text-slate-500 mt-1">Released upon QC verification</p>
          </div>
        </div>

        {/* 2-Column Layout: Active Projects & Active Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Ongoing Projects (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-navy-900">Ongoing Projects</h2>
              <Link to="/plan-project" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <span>+ Plan Another</span>
              </Link>
            </div>

            <div className="space-y-4">
              {projects.map((proj) => {
                const currentMilestone = proj.milestones.find(m => m.status === 'In Progress') || proj.milestones[0];
                return (
                  <div
                    key={proj.id}
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    className="bg-white rounded-3xl p-6 border border-[#E3EAF4] hover:border-brand-300 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                            {proj.tier}
                          </span>
                          <span className="text-xs text-slate-400">Ref: {proj.id}</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-navy-900 group-hover:text-brand-600 transition-colors">
                          {proj.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{proj.location}</span>
                          <span>•</span>
                          <span>{proj.type}</span>
                        </div>
                      </div>

                      <div className="text-right sm:self-start">
                        <span className="text-xs text-slate-400 block">Agreed Quotation</span>
                        <span className="text-base font-extrabold text-navy-900">
                          {formatINR(proj.agreedQuotation)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">
                          Active Stage: <span className="text-navy-900">{currentMilestone?.title}</span>
                        </span>
                        <span className="text-brand-600">{proj.progressPercentage}% Complete</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-brand-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${proj.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Contractor & Quick Action Row */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <SafeImage
                          src={proj.contractor.avatar}
                          alt={proj.contractor.name}
                          fallbackText={proj.contractor.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-navy-900 block">{proj.contractor.name}</span>
                          <span className="text-[11px] text-slate-400">{proj.assignedWorkersCount} workers on site</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform">
                        <span>Open Workspace</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Bookings & Quick Tools Aside (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-navy-900">Service Bookings</h2>
              <Link to="/bookings" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {bookings.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigate('/bookings')}
                  className="bg-white rounded-2xl p-4 border border-[#E3EAF4] hover:border-brand-200 shadow-soft transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {b.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'In Progress'
                          ? 'bg-brand-50 text-brand-700 border border-brand-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {b.serviceName}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{b.professionalName}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{b.date}</span>
                    <span className="font-extrabold text-navy-900">{formatINR(b.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Side Card: Quotation Comparison Hub */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3EAF4] shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-sm text-navy-900">Compare Contractor Bids</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Review side-by-side quotations from verified builders for scope, materials, and warranty.
              </p>
              <button
                onClick={() => navigate('/compare')}
                className="w-full bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-xs py-2.5 rounded-xl border border-brand-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Comparison Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
