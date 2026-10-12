import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  RotateCcw, 
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  HardHat,
  User,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SafeImage } from '../components/common/SafeImage';

export const ProfilePage: React.FC = () => {
  const { 
    user, 
    updateUser, 
    resetDemoData, 
    projects, 
    bookings, 
    isSupabaseConfigured, 
    backendMode,
    isAuthenticated,
    openAuthModal,
    signOut,
    demoSignIn 
  } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [city, setCity] = useState(user.city);

  // Preference toggles
  const [smsUpdates, setSmsUpdates] = useState(true);
  const [photoVerificationAlerts, setPhotoVerificationAlerts] = useState(true);
  const [weeklyBudgetDigest, setWeeklyBudgetDigest] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, phone, address, city });
  };

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Account Management
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-2">
              Customer Profile & Backend Hub
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Manage your site details, test Supabase backend synchronization, and configure notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="bg-white hover:bg-slate-50 border border-[#E3EAF4] text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-soft transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Backend & Supabase Architecture Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-soft ${
                isSupabaseConfigured ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400' : 'bg-gradient-to-tr from-brand-600 to-sky-400'
              }`}>
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-navy-900">Backend Infrastructure</h2>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    backendMode === 'supabase-connected'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {backendMode === 'supabase-connected' ? 'Supabase Live' : 'Demo Showcase Mode'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {backendMode === 'supabase-connected'
                    ? 'Connected to live PostgreSQL database with Row Level Security (RLS) policies enabled.'
                    : 'Running in safe client-side presentation mode with LocalStorage persistence.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal('signin')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Switch Accounts / Demo Role</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
              <div className="font-bold text-navy-900 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Supabase Ready Architecture</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Normalized schema prepared in <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">supabase/schema.sql</code> spanning all 14 entities: profiles, provider_profiles, projects, milestones, tasks, materials, quotations, reviews, and escrow records.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4]">
              <div className="font-bold text-navy-900 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Zero-Flicker Lab Demo Guarantee</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                If Supabase credentials are not specified in <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">.env</code>, Buildzy operates seamlessly without broken views or missing dependencies during evaluations.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <SafeImage
              src={user.avatar}
              alt={user.name}
              fallbackText={user.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-brand-200 shadow-soft"
            />
            <div className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-1 shadow-xs" title="Verified Customer">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-extrabold text-navy-900">{user.name}</h2>
                <p className="text-xs font-semibold text-brand-600">{user.email}</p>
              </div>

              <div className="flex items-center gap-2 self-center sm:self-auto">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  user.role === 'contractor'
                    ? 'text-brand-700 bg-brand-50 border-brand-200'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}>
                  {user.role === 'contractor' ? 'Licensed General Contractor' : 'Verified Homeowner'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap justify-center sm:justify-start gap-6 text-xs text-slate-500">
              <div>
                <span className="font-extrabold text-navy-900 block text-base">{projects.length}</span>
                <span>Active Projects</span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="font-extrabold text-navy-900 block text-base">{bookings.length}</span>
                <span>Services Booked</span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="font-extrabold text-emerald-600 block text-base">100%</span>
                <span>Escrow Verified</span>
              </div>
            </div>

            {/* Presentation quick role switcher */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Quick Persona Switch:</span>
              <button
                onClick={() => demoSignIn('customer')}
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
              >
                <User className="w-3 h-3 text-slate-500" />
                <span>Homeowner</span>
              </button>
              <button
                onClick={() => demoSignIn('contractor')}
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
              >
                <HardHat className="w-3 h-3 text-brand-600" />
                <span>Contractor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft mb-8">
          <h3 className="text-lg font-bold text-navy-900 mb-1">Personal & Site Information</h3>
          <p className="text-xs text-slate-500 mb-6">Default location auto-filled when booking services or crews</p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-xs font-medium text-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-xs font-medium text-navy-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-xs font-medium text-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-xs font-medium text-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Default Property / Construction Site Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-xs font-medium text-navy-900"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-soft transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Notifications & Alert Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft mb-8">
          <h3 className="text-lg font-bold text-navy-900 mb-1">Alert & Communication Preferences</h3>
          <p className="text-xs text-slate-500 mb-6">Choose how contractor milestone updates and crew arrivals reach you</p>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4] cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-brand-500" />
                <div>
                  <span className="font-bold text-navy-900 block">SMS Arrival & Live Tracking Alerts</span>
                  <span className="text-slate-400">Receive dispatch and GPS arrival messages on your phone</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsUpdates}
                onChange={(e) => setSmsUpdates(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4] cursor-pointer">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className="font-bold text-navy-900 block">Milestone Inspection Photo Prompts</span>
                  <span className="text-slate-400">Notified whenever site engineer uploads QC photos for approval</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={photoVerificationAlerts}
                onChange={(e) => setPhotoVerificationAlerts(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#E3EAF4] cursor-pointer">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-brand-500" />
                <div>
                  <span className="font-bold text-navy-900 block">Weekly Budget & Material Expenditure Digest</span>
                  <span className="text-slate-400">Summary email of funds committed, spent, and remaining</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={weeklyBudgetDigest}
                onChange={(e) => setWeeklyBudgetDigest(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Prototype Reset Controls */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-extrabold text-navy-900">Demonstration State Reset</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Restore mock bookings, projects, and comparison lists to default showcase values.
            </p>
          </div>

          <button
            onClick={resetDemoData}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>

      </div>
    </div>
  );
};
