import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../context/AppContext';

export interface AuthResponse<T = any> {
  data: T | null;
  error: string | null;
}

export const authService = {
  async getCurrentSession() {
    if (!isSupabaseConfigured) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async signUp(email: string, password: string, fullName: string, role: 'customer' | 'contractor' = 'customer'): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase is not configured. Running in Demo Mode.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase is not configured. Running in Demo Mode.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  async signOut(): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      return { data: null, error: null };
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: true, error: null };
  },

  async getProfile(userId: string): Promise<AuthResponse<UserProfile>> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    const profile: UserProfile = {
      name: data.display_name || data.email,
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      avatar: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      projectsCount: 0,
      bookingsCount: 0,
      role: data.role || 'customer',
    };

    return { data: profile, error: null };
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.display_name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },
};
