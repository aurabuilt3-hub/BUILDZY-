import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Wrench
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { POPULAR_SERVICES } from '../data/mockData';
import { formatINR } from '../lib/pricing/formatINR';
import { CITIES } from '../lib/pricing/pricingEngine';

export const BookServicePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addBooking, user } = useApp();

  const preselectedServiceId = searchParams.get('service');
  const matchedService = POPULAR_SERVICES.find((s) => s.id === preselectedServiceId);

  // Form State
  const [selectedCityId, setSelectedCityId] = useState<string>('mumbai');
  const [serviceCategory, setServiceCategory] = useState<string>(
    matchedService ? matchedService.categoryLabel : 'Labour & Helpers'
  );
  const [serviceName, setServiceName] = useState<string>(
    matchedService ? matchedService.name : 'Skilled Masonry & Labour Team'
  );
  const [bookingMode, setBookingMode] = useState<'individual' | 'crew'>('crew');
  const [workerCount, setWorkerCount] = useState<number>(2);
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days'>('days');
  const [durationValue, setDurationValue] = useState<number>(3);
  const [bookingDate, setBookingDate] = useState<string>('2026-10-16');
  const [timeSlot, setTimeSlot] = useState<string>('08:00 AM - 05:00 PM');
  const [locationAddress, setLocationAddress] = useState<string>(user.address || 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai');
  const [requirements, setRequirements] = useState<string>(
    'Need 2 experienced masons for interior brick partition wall and plastering. Raw sand and cement are already delivered to site.'
  );
  const [includeSafetyGear, setIncludeSafetyGear] = useState<boolean>(true);

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Price calculations calibrated for India
  const baseRatePerUnit = React.useMemo(() => {
    const city = CITIES.find((c) => c.id === selectedCityId);
    const labMult = city ? city.labourMultiplier : 1.0;

    if (serviceCategory.includes('Labour')) {
      return Math.round((durationUnit === 'days' ? 950 : 140) * labMult); // Raj Mistry
    } else if (serviceCategory.includes('Plumbing')) {
      return Math.round((durationUnit === 'days' ? 900 : 150) * labMult);
    } else if (serviceCategory.includes('Electrical')) {
      return Math.round((durationUnit === 'days' ? 900 : 150) * labMult);
    } else if (serviceCategory.includes('Painting')) {
      return Math.round((durationUnit === 'days' ? 850 : 130) * labMult);
    } else {
      return Math.round((durationUnit === 'days' ? 950 : 145) * labMult);
    }
  }, [serviceCategory, durationUnit, selectedCityId]);

  const activeWorkerCount = bookingMode === 'individual' ? 1 : workerCount;
  const calculatedTotal = activeWorkerCount * durationValue * baseRatePerUnit;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!serviceName.trim()) errs.serviceName = 'Service title is required';
    if (!locationAddress.trim()) errs.locationAddress = 'Service site location is required';
    if (!bookingDate) errs.bookingDate = 'Please select a preferred date';
    if (durationValue < 1) errs.durationValue = 'Duration must be at least 1';
    if (bookingMode === 'crew' && workerCount < 2) errs.workerCount = 'Crew must have at least 2 workers';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newB = addBooking({
        serviceName,
        category: serviceCategory,
        professionalName: bookingMode === 'individual' ? 'Assigned Trade Specialist' : `${activeWorkerCount}-Person Certified Labour Crew`,
        professionalTrade: serviceCategory,
        date: new Date(bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeSlot,
        location: locationAddress,
        workerCount: activeWorkerCount,
        durationValue,
        durationUnit,
        totalPrice: calculatedTotal,
        status: 'Scheduled',
        requirements,
      });

      setIsSubmitting(false);
      setConfirmedBookingId(newB.id);
    }, 600);
  };

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Direct Labour & Service Dispatch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-2">
            Book a Service or Labour Crew
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Hire verified solo craftspeople or scalable construction labour teams with upfront daily/hourly pricing.
          </p>
        </div>

        {confirmedBookingId ? (
          /* Confirmation Success Card */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E3EAF4] shadow-soft-xl max-w-2xl mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-soft">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Demo Booking Confirmed
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-3 mb-2">
              Booking Ref: {confirmedBookingId}
            </h2>

            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Your request for <strong>{activeWorkerCount} {activeWorkerCount > 1 ? 'workers' : 'specialist'}</strong> has been simulated and saved to your customer portal.
            </p>

            <div className="bg-[#F8FBFF] rounded-2xl p-5 border border-[#E3EAF4] text-left text-xs space-y-2 mb-8">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-navy-900">{serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-bold text-navy-900">{bookingDate} ({timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-navy-900">{durationValue} {durationUnit} ({activeWorkerCount} personnel)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-navy-900">{locationAddress}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                <span className="font-bold text-navy-900">Total Indicative Cost:</span>
                <span className="font-black text-brand-600">${calculatedTotal}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/bookings')}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <span>Track in My Bookings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold px-5 py-3 rounded-2xl transition-colors"
              >
                View Customer Dashboard
              </button>
              <button
                onClick={() => setConfirmedBookingId(null)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl transition-colors"
              >
                Book Another Service
              </button>
            </div>
          </div>
        ) : (
          /* Main Interactive Booking Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Form Controls */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EAF4] shadow-soft">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Mode Selector: Individual vs Crew */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                    1. Select Hiring Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingMode('individual')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        bookingMode === 'individual'
                          ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-100 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Wrench className={`w-4 h-4 ${bookingMode === 'individual' ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span className="font-bold text-sm text-navy-900">Solo Specialist</span>
                      </div>
                      <p className="text-[11px] text-slate-500">1 Plumber, Electrician or Mason for repair</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingMode('crew')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        bookingMode === 'crew'
                          ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-100 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className={`w-4 h-4 ${bookingMode === 'crew' ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span className="font-bold text-sm text-navy-900">Workforce Crew</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Team of 2 to 15+ masons, helpers & loaders</p>
                    </button>
                  </div>
                </div>

                {/* 2. City Selector & Trade Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Indian City</label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-900 focus:outline-none focus:border-brand-500"
                    >
                      {CITIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.state}) — {c.regionTier}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trade Category</label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => {
                        setServiceCategory(e.target.value);
                        setServiceName(`${e.target.value} Service Support`);
                      }}
                      className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-900 focus:outline-none focus:border-brand-500"
                    >
                      <option value="Labour & Helpers">Labour & Helpers (Mason / Daily)</option>
                      <option value="Plumbing">Plumbing Services</option>
                      <option value="Electrical">Electrical & Solar</option>
                      <option value="Painting">Painting & Coatings</option>
                      <option value="Carpentry">Carpentry & Joinery</option>
                      <option value="Civil Construction">Civil Construction</option>
                    </select>
                  </div>
                </div>

                {/* Service Job Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Job Title</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. 2 Masons for bricklaying"
                    className={`w-full bg-[#F8FBFF] border ${errors.serviceName ? 'border-rose-400' : 'border-[#E3EAF4]'} rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-900 focus:outline-none focus:border-brand-500`}
                  />
                  {errors.serviceName && <span className="text-xs text-rose-500 mt-1">{errors.serviceName}</span>}
                </div>

                {/* 3. Crew Count (if crew mode) & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {bookingMode === 'crew' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Number of Workers</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setWorkerCount(Math.max(2, workerCount - 1))}
                          className="w-10 h-10 rounded-l-xl bg-slate-100 border border-[#E3EAF4] font-bold text-slate-700 hover:bg-slate-200"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="2"
                          max="20"
                          value={workerCount}
                          onChange={(e) => setWorkerCount(Math.max(2, parseInt(e.target.value) || 2))}
                          className="w-full text-center h-10 border-y border-[#E3EAF4] text-sm font-bold text-navy-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setWorkerCount(workerCount + 1)}
                          className="w-10 h-10 rounded-r-xl bg-slate-100 border border-[#E3EAF4] font-bold text-slate-700 hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Workers</label>
                      <div className="h-10 bg-slate-100 rounded-xl px-3.5 flex items-center text-sm font-bold text-slate-700 border border-slate-200">
                        1 Solo Craftsperson
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration Value</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={durationValue}
                      onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2 text-sm font-medium text-navy-900 h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit of Time</label>
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value as any)}
                      className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3 py-2 text-sm font-medium text-navy-900 h-10"
                    >
                      <option value="days">Days (8 hrs/day)</option>
                      <option value="hours">Hours (Hourly job)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className={`w-full bg-[#F8FBFF] border ${errors.bookingDate ? 'border-rose-400' : 'border-[#E3EAF4]'} rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-900`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Daily Time Window</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-900"
                    >
                      <option value="08:00 AM - 05:00 PM">Full Day: 08:00 AM - 05:00 PM</option>
                      <option value="09:00 AM - 01:00 PM">Morning Half: 09:00 AM - 01:00 PM</option>
                      <option value="01:30 PM - 05:30 PM">Afternoon Half: 01:30 PM - 05:30 PM</option>
                      <option value="Emergency ASAP">Emergency Immediate Dispatch</option>
                    </select>
                  </div>
                </div>

                {/* 5. Site Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project / Site Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="e.g. 128 Willow Creek Way, North District"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-[#F8FBFF] border ${errors.locationAddress ? 'border-rose-400' : 'border-[#E3EAF4]'} rounded-xl text-sm font-medium text-navy-900`}
                    />
                  </div>
                  {errors.locationAddress && <span className="text-xs text-rose-500 mt-1">{errors.locationAddress}</span>}
                </div>

                {/* 6. Requirements */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Specific Work Instructions & Materials on Site</label>
                  <textarea
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Describe specific tasks, tools needed, height access, or site constraints..."
                    className="w-full bg-[#F8FBFF] border border-[#E3EAF4] rounded-xl p-3 text-sm font-medium text-navy-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Checkbox add-ons */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <input
                    type="checkbox"
                    id="safety"
                    checked={includeSafetyGear}
                    onChange={(e) => setIncludeSafetyGear(e.target.checked)}
                    className="w-4 h-4 text-brand-500 rounded"
                  />
                  <label htmlFor="safety" className="text-slate-700 font-medium cursor-pointer">
                    Ensure team brings standard safety helmets, protective boots and site gloves (Compliant)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-extrabold text-base py-3.5 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <span>Processing Booking Request...</span>
                  ) : (
                    <>
                      <span>Confirm & Book Service</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Transparent Price Breakdown Summary Card */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EAF4] shadow-soft sticky top-28">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-extrabold text-navy-900 text-base">Booking Summary</h3>
                    <p className="text-[11px] text-slate-400">Live rate quotation preview</p>
                  </div>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                    Transparent Rate
                  </span>
                </div>

                {/* Itemized Table */}
                <div className="space-y-3 text-xs mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Day/Hour Rate:</span>
                    <span className="font-bold text-navy-900">{formatINR(baseRatePerUnit)} / worker / {durationUnit.slice(0, -1)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Assigned Personnel:</span>
                    <span className="font-bold text-navy-900">{activeWorkerCount} {activeWorkerCount > 1 ? 'Workers' : 'Worker'}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Scheduled Duration:</span>
                    <span className="font-bold text-navy-900">{durationValue} {durationUnit}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Platform Insurance & Escrow:</span>
                    <span className="font-bold text-emerald-600">Included (₹0)</span>
                  </div>

                  <div className="bg-brand-50/70 rounded-xl p-3 border border-brand-200/80 text-[11px] text-brand-900">
                    <span className="font-bold block text-brand-700 mb-0.5">Calculation Formula:</span>
                    <span>{activeWorkerCount} worker{activeWorkerCount > 1 ? 's' : ''} × {durationValue} {durationUnit} × {formatINR(baseRatePerUnit)}/worker/{durationUnit.slice(0, -1)} = </span>
                    <span className="font-black text-brand-600">{formatINR(calculatedTotal)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex justify-between items-baseline">
                    <div>
                      <span className="font-extrabold text-navy-900 text-sm block">Total Estimated Cost:</span>
                      <span className="text-[10px] text-slate-400">Paid only upon verified job milestone</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-brand-600">{formatINR(calculatedTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Trust guarantee box */}
                <div className="bg-[#F8FBFF] rounded-2xl p-4 border border-[#E3EAF4] space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Identity verified workers with background verification check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span>Cancel or reschedule anytime before 2 hours with zero penalty</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-4">
                  * Demonstrative pricing model. Real payments are not charged in this demo environment.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
