import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Booking } from '../types';

export const bookingsService = {
  async fetchBookings(customerId?: string): Promise<{ data: Booking[] | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped: Booking[] = (data || []).map((row: any) => ({
        id: row.booking_reference || row.id,
        serviceName: row.service_name,
        category: row.category,
        professionalName: row.provider_name,
        professionalTrade: row.provider_trade,
        date: row.scheduled_date,
        timeSlot: row.time_slot,
        location: row.location,
        workerCount: row.worker_count,
        durationValue: row.duration_value,
        durationUnit: row.duration_unit,
        totalPrice: Number(row.total_price),
        status: row.status,
        requirements: row.special_instructions || '',
        createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
        liveStep: row.live_step || 1,
      }));

      return { data: mapped, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to fetch bookings' };
    }
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>, customerId: string): Promise<{ data: Booking | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    const bookingRef = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          booking_reference: bookingRef,
          customer_id: customerId,
          service_name: booking.serviceName,
          category: booking.category,
          provider_name: booking.professionalName,
          provider_trade: booking.professionalTrade,
          scheduled_date: booking.date || new Date().toISOString().slice(0, 10),
          time_slot: booking.timeSlot,
          location: booking.location,
          worker_count: booking.workerCount,
          duration_value: booking.durationValue,
          duration_unit: booking.durationUnit,
          total_price: booking.totalPrice,
          status: booking.status,
          live_step: booking.liveStep || 1,
          special_instructions: booking.requirements,
        })
        .select()
        .single();

      if (error) throw error;

      const newBooking: Booking = {
        ...booking,
        id: bookingRef,
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };

      return { data: newBooking, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to create booking' };
    }
  },

  async updateBookingStatus(bookingReference: string, status: Booking['status']): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('booking_reference', bookingReference);
    return { error: error ? error.message : null };
  },

  async advanceBookingStep(bookingReference: string, step: number, status: Booking['status']): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase
      .from('bookings')
      .update({ live_step: step, status })
      .eq('booking_reference', bookingReference);
    return { error: error ? error.message : null };
  },
};
