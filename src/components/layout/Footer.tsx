import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, HelpCircle, Phone, Mail, MapPin, Sparkles, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { resetDemoData } = useApp();

  return (
    <footer className="bg-white border-t border-[#E3EAF4] pt-12 sm:pt-14 pb-12 mt-12 sm:mt-16 text-slate-600">
      {/* Demo helper pill */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy-900">Buildzy Interactive Demonstration</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstration platform. All contractor ratings, pricing ranges, and AI estimates are illustrative mock data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetDemoData}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
            >
              Reset Demo State
            </button>
            <Link
              to="/compare"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-xs"
            >
              Test Quotation Matrix
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-soft">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-navy-900">
                Buildzy
              </span>
            </Link>
            <p className="text-sm text-slate-600 max-w-sm mb-4 leading-relaxed">
              <strong>Plan. Compare. Build.</strong> From a small repair to your dream home, manage it all in one place with AI-assisted project planning and verified contractor quotations.
            </p>
            
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Headquarters: 450 Mission St, San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500" />
                <span>Customer Care: +1 (800) 555-BUILD</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500" />
                <span>General Enquiries: support@buildzy.platform</span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Services */}
          <div>
            <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services?cat=labour" className="hover:text-brand-600 transition-colors">
                  Labour & Helpers
                </Link>
              </li>
              <li>
                <Link to="/services?cat=contractors" className="hover:text-brand-600 transition-colors">
                  General Contractors
                </Link>
              </li>
              <li>
                <Link to="/services?cat=architects" className="hover:text-brand-600 transition-colors">
                  Architects & Blueprints
                </Link>
              </li>
              <li>
                <Link to="/services?cat=plumbing" className="hover:text-brand-600 transition-colors">
                  Plumbing Services
                </Link>
              </li>
              <li>
                <Link to="/services?cat=electrical" className="hover:text-brand-600 transition-colors">
                  Electrical & Solar
                </Link>
              </li>
              <li>
                <Link to="/services?cat=renovation" className="hover:text-brand-600 transition-colors">
                  Renovation & Interiors
                </Link>
              </li>
              <li>
                <Link to="/services?cat=materials" className="hover:text-brand-600 transition-colors">
                  Building Materials
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div>
            <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4">
              Explore Buildzy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/book-service" className="hover:text-brand-600 transition-colors">
                  Book Labour & Repairs
                </Link>
              </li>
              <li>
                <Link to="/plan-project" className="hover:text-brand-600 transition-colors">
                  AI Project Planner
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-brand-600 transition-colors">
                  Quotation Comparison
                </Link>
              </li>
              <li>
                <Link to="/professionals" className="hover:text-brand-600 transition-colors">
                  Directory of Pros
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors">
                  Project Tracking Portal
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-brand-600 transition-colors">
                  Live Booking Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div>
            <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4">
              Trust & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Verified Provider IDs
                </span>
              </li>
              <li>
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-500" />
                  Transparent Quotations
                </span>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
                  How Escrow Works
                </a>
              </li>
              <li>
                <Link to="/profile" className="hover:text-brand-600 transition-colors">
                  Customer Settings
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-brand-600 transition-colors">
                  Safety Standards
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-600 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Buildzy Technologies Inc. All rights reserved. Plan. Compare. Build.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Designed with modern soft-blue styling</span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              Handcrafted for homeowners & builders <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
