import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  RotateCw, 
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../types';
import { formatINR } from '../lib/pricing/formatINR';

export const BookingsPage: React.FC = () => {
  const { bookings, cancelBooking, advanceBookingStep } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'All' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'>('All');
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    return b.status === activeTab;
  });

  const liveStepLabels = [
    'Pro Assigned',
    'On The Way',
    'Arrived on Site',
    'Work in Progress',
    'Completed'
  ];

  return (
    <div className="py-10 bg-[#F5F9FF] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              On-Demand Dispatch
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-2">
              My Service Bookings
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Track live worker arrivals, inspect job scopes, and manage daily crew scheduling.
            </p>
          </div>

          <button
            onClick={() => navigate('/book-service')}
            className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Service</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {(['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'bg-white text-slate-600 hover:text-navy-900 border border-[#E3EAF4]'
              }`}
            >
              {tab} ({tab === 'All' ? bookings.length : bookings.filter((b) => b.status === tab).length})
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E3EAF4] shadow-soft">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-900">No bookings in "{activeTab}" status</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Need a plumber, electrician, or mason crew right now?
            </p>
            <button
              onClick={() => navigate('/book-service')}
              className="bg-brand-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-soft"
            >
              Book Instant Service
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((b) => {
              const currentStep = b.liveStep || 1;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border border-[#E3EAF4] hover:border-brand-300 shadow-soft transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Ref: {b.id}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            b.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'In Progress'
                              ? 'bg-brand-50 text-brand-700 border border-brand-200 animate-pulse'
                              : b.status === 'Cancelled'
                              ? 'bg-slate-100 text-slate-500 border border-slate-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                        <span className="text-[11px] text-slate-400">Created: {b.createdAt}</span>
                      </div>

                      <h3 className="text-lg font-extrabold text-navy-900 leading-tight">
                        {b.serviceName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                        <span className="font-semibold text-brand-600">{b.professionalName}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.workerCount} personnel</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.durationValue} {b.durationUnit}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:self-start">
                      <span className="text-[11px] font-semibold text-slate-400 block">Indicative Cost</span>
                      <span className="text-2xl font-black text-navy-900">{formatINR(b.totalPrice)}</span>
                      <span className="text-[10px] text-slate-400 block">{b.timeSlot}</span>
                    </div>
                  </div>

                  {/* LIVE STATUS TRACKER SIMULATOR (Only if not cancelled) */}
                  {b.status !== 'Cancelled' && (
                    <div className="pt-5 pb-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-navy-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping inline-block" />
                          Live Tracking Simulation: {liveStepLabels[currentStep - 1]}
                        </span>

                        {/* Interactive Step Advancement Simulator button */}
                        {b.status !== 'Completed' && (
                          <button
                            onClick={() => advanceBookingStep(b.id)}
                            className="text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Simulate Next Step</span>
                          </button>
                        )}
                      </div>

                      {/* 5-Step horizontal indicator */}
                      <div className="grid grid-cols-5 gap-2">
                        {liveStepLabels.map((lbl, idx) => {
                          const isDone = currentStep > idx + 1;
                          const isCurrent = currentStep === idx + 1;

                          return (
                            <div key={lbl} className="flex flex-col gap-1.5">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isDone
                                    ? 'bg-emerald-500'
                                    : isCurrent
                                    ? 'bg-brand-500'
                                    : 'bg-slate-100'
                                }`}
                              />
                              <span
                                className={`text-[10px] font-semibold truncate ${
                                  isCurrent ? 'text-brand-600 font-bold' : isDone ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                {lbl}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[10px] text-slate-400 mt-2">
                        * Demonstration simulation. Step advancement simulates real-time driver/craftsperson telemetry.
                      </p>
                    </div>
                  )}

                  {/* Requirements Note & Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <p className="text-slate-500 italic max-w-xl">
                      "{b.requirements}"
                    </p>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {b.status === 'Scheduled' && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                      {b.status === 'Completed' && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          Service Fulfilled
                        </span>
                      )}
                      {b.status === 'Cancelled' && (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
                          Cancelled
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedBookingForDetails(b)}
                        className="bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold px-3.5 py-1.5 rounded-xl transition-colors border border-brand-200"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: View Receipt / Booking Details */}
        {selectedBookingForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#E3EAF4] shadow-soft-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-extrabold text-navy-900 text-base">Booking Voucher</h3>
                  <span className="text-[11px] text-slate-400">Ref: {selectedBookingForDetails.id}</span>
                </div>
                <button
                  onClick={() => setSelectedBookingForDetails(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-navy-900">{selectedBookingForDetails.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Worker Group:</span>
                  <span className="font-bold text-navy-900">{selectedBookingForDetails.workerCount} Workers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-navy-900">{selectedBookingForDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-bold text-navy-900">{selectedBookingForDetails.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Site Location:</span>
                  <span className="font-bold text-navy-900">{selectedBookingForDetails.location}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
                  <span className="font-extrabold text-navy-900">Total Charged:</span>
                  <span className="font-black text-brand-600">{formatINR(selectedBookingForDetails.totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-soft text-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
