import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck, CheckCircle2, AlertCircle, Building2, HardHat, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    authModalTab, 
    closeAuthModal, 
    openAuthModal,
    signIn, 
    signUp, 
    demoSignIn,
    isSupabaseConfigured,
    backendMode
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'customer' | 'contractor'>('customer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (authModalTab === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid credentials or sign-in failed');
        } else {
          closeAuthModal();
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, fullName, role);
        if (!res.success) {
          setErrorMsg(res.error || 'Sign-up failed');
        } else {
          closeAuthModal();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (selectedRole: 'customer' | 'contractor') => {
    demoSignIn(selectedRole);
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E3EAF4] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 p-6 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Buildzy Account</span>
          </div>

          <p className="text-brand-100 text-xs">
            {authModalTab === 'signin'
              ? 'Access your saved projects, quotes, and active bookings.'
              : 'Create your account to manage construction and home services.'}
          </p>

          {/* Backend Status indicator */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md border border-white/20">
            <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'}`} />
            <span>
              {backendMode === 'supabase-connected' ? 'Supabase Database Connected' : 'Demo Mode (Local Showcase)'}
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E3EAF4] bg-slate-50/70 p-1">
          <button
            type="button"
            onClick={() => { setErrorMsg(null); openAuthModal('signin'); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              authModalTab === 'signin'
                ? 'bg-white text-brand-600 shadow-xs border border-[#E3EAF4]'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setErrorMsg(null); openAuthModal('signup'); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              authModalTab === 'signup'
                ? 'bg-white text-brand-600 shadow-xs border border-[#E3EAF4]'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authModalTab === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E3EAF4] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Type & Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      role === 'customer'
                        ? 'border-brand-500 bg-brand-50/80 text-brand-700 font-bold'
                        : 'border-[#E3EAF4] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="text-xs font-bold">Homeowner</div>
                      <div className="text-[10px] text-slate-500">Book & Plan</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('contractor')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      role === 'contractor'
                        ? 'border-brand-500 bg-brand-50/80 text-brand-700 font-bold'
                        : 'border-[#E3EAF4] text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <HardHat className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="text-xs font-bold">Contractor</div>
                      <div className="text-[10px] text-slate-500">Provide quotes</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E3EAF4] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E3EAF4] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold rounded-xl shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{authModalTab === 'signin' ? 'Sign In to Buildzy' : 'Complete Registration'}</span>
              </>
            )}
          </button>

          {/* Quick Demo Login Option for College Lab Presentation */}
          <div className="pt-3 border-t border-[#E3EAF4]">
            <div className="text-center text-xs text-slate-400 font-medium mb-2.5 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Lab Presentation Instant Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('customer')}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Homeowner</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('contractor')}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <HardHat className="w-3.5 h-3.5 text-brand-600" />
                <span>Demo Contractor</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
