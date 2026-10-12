import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Menu, 
  X, 
  Layers, 
  User, 
  CalendarCheck, 
  ArrowRight,
  Sparkles,
  LogIn,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { 
    compareIds, 
    bookings, 
    user, 
    isAuthenticated, 
    openAuthModal, 
    signOut, 
    backendMode 
  } = useApp();

  const activeBookingsCount = bookings.filter(b => b.status === 'Scheduled' || b.status === 'In Progress').length;

  interface NavLinkItem {
    name: string;
    path: string;
    highlight?: boolean;
  }

  const navLinks: NavLinkItem[] = [
    { name: 'Home', path: '/' },
    { name: 'My Projects', path: '/projects' },
    { name: 'Services', path: '/services' },
    { name: 'Professionals', path: '/professionals' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/projects') return location.pathname.startsWith('/projects') || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-medium py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 relative z-50">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Sparkles className="w-3.5 h-3.5 text-brand-200 inline flex-shrink-0" />
          <span className="hidden sm:inline">Plan, Compare & Build with AI Guidance. Compare verified contractors side-by-side.</span>
          <span className="sm:hidden">Plan & Compare contractors with AI</span>
          <Link to="/compare" className="underline font-semibold hover:text-brand-100 ml-1 inline-flex items-center gap-0.5">
            View Quotations <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Backend Status indicator badge */}
        <div 
          onClick={() => openAuthModal('signin')}
          className="mx-auto sm:mx-0 cursor-pointer text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center gap-1.5 transition-colors"
          title="Click to view backend authentication status"
        >
          <span className={`w-2 h-2 rounded-full ${backendMode === 'supabase-connected' ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'}`} />
          <span className="text-white/95">
            {backendMode === 'supabase-connected' ? 'Supabase Live' : 'Demo Mode'}
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EAF4] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl p-1 shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-soft shadow-brand-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-navy-900 group-hover:text-brand-600 transition-colors">
                  Buildzy
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full border border-brand-200 leading-normal">
                  AI Pro
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium tracking-tight mt-1 hidden sm:block leading-none">
                Plan. Compare. Build.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (lg+ with clean responsive spacing) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 h-10 ${
                    active
                      ? 'text-brand-600 bg-brand-50/80 shadow-xs'
                      : link.highlight
                      ? 'text-brand-600 hover:bg-brand-50'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  {link.highlight && <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Compare Quick Pill with badge */}
            <Link
              to="/compare"
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 h-10 ${
                isActive('/compare')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-brand-500 shrink-0" />
              <span>Compare</span>
              {compareIds.length > 0 && (
                <span className="bg-brand-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none shrink-0 shadow-xs">
                  {compareIds.length}
                </span>
              )}
            </Link>

            {/* Dashboard / Bookings shortcut (without unverified pulse status dot) */}
            <Link
              to="/dashboard"
              className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 h-10 ${
                isActive('/dashboard')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Dashboard</span>
            </Link>
          </nav>

          {/* Right Action Buttons (Desktop lg+) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 xl:gap-2">
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-700 hover:text-navy-900 hover:bg-slate-100/80 transition-all flex items-center gap-2 border border-transparent hover:border-slate-200 h-10"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 xl:w-7 xl:h-7 rounded-full object-cover border border-brand-200"
                  />
                  <span className="max-w-[100px] xl:max-w-[130px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={signOut}
                  title="Sign out of account"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors h-10 w-10 flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="px-3.5 xl:px-4 py-2 rounded-xl text-xs xl:text-sm font-semibold text-slate-700 hover:text-navy-900 hover:bg-slate-100/80 transition-all flex items-center gap-1.5 xl:gap-2 border border-[#E3EAF4] whitespace-nowrap h-10 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </button>
            )}

            <Link
              to="/plan-project"
              className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-xs xl:text-sm px-4 xl:px-5 py-2 xl:py-2.5 rounded-xl shadow-soft hover:shadow-soft-lg hover:shadow-brand-500/25 transition-all flex items-center gap-1.5 xl:gap-2 group whitespace-nowrap h-10"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>

          {/* Mobile & Tablet Action Buttons (< lg) */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/compare"
              className="relative p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
              title="Compare Quotations"
              aria-label="View quotation comparison"
            >
              <Layers className="w-5 h-5 text-brand-600" />
              {compareIds.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {compareIds.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-brand-600" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile / Tablet Dropdown Menu with Backdrop Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs z-30 animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Dropdown panel */}
            <div 
              className="relative z-40 border-t border-[#E3EAF4] bg-white px-4 pt-3 pb-6 shadow-2xl animate-fade-in max-h-[calc(100vh-120px)] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between min-h-[48px] ${
                      isActive(link.path)
                        ? 'text-brand-600 bg-brand-50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.highlight && (
                      <span className="text-xs bg-brand-100 text-brand-600 font-bold px-2 py-0.5 rounded-md">
                        Featured
                      </span>
                    )}
                  </Link>
                ))}

                <Link
                  to="/compare"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-500" />
                    <span>Compare Quotations</span>
                  </div>
                  <span className="text-xs bg-brand-500 text-white font-bold px-2 py-0.5 rounded-full">
                    {compareIds.length} selected
                  </span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-brand-500" />
                    <span>Customer Dashboard</span>
                  </div>
                </Link>

                <Link
                  to="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-slate-400" />
                    <span>My Bookings</span>
                  </div>
                  {activeBookingsCount > 0 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                      {activeBookingsCount} active
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 min-h-[48px]"
                >
                  <User className="w-5 h-5 text-slate-400" />
                  <span>My Account & Settings</span>
                </Link>

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3.5 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 text-left min-h-[48px]"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span>Sign Out ({user.name})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openAuthModal('signin');
                      setMobileMenuOpen(false);
                    }}
                    className="px-3.5 py-3 rounded-xl text-base font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 flex items-center gap-2 text-left min-h-[48px]"
                  >
                    <LogIn className="w-5 h-5 text-brand-600" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}

                <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2.5">
                  <Link
                    to="/book-service"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl border border-brand-200 text-brand-600 font-semibold bg-brand-50 hover:bg-brand-100 transition-colors min-h-[48px] flex items-center justify-center"
                  >
                    Book Instant Labour & Repair
                  </Link>
                  <Link
                    to="/plan-project"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 shadow-soft transition-colors min-h-[48px] flex items-center justify-center"
                  >
                    Plan Complete Project
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
};
