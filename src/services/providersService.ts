import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Professional } from '../types';
import { MOCK_PROFESSIONALS } from '../data/mockData';

export const providersService = {
  async fetchProviders(): Promise<{ data: Professional[]; isLive: boolean }> {
    if (!isSupabaseConfigured) {
      return { data: MOCK_PROFESSIONALS, isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*');

      if (error || !data || data.length === 0) {
        return { data: MOCK_PROFESSIONALS, isLive: false };
      }

      const mapped: Professional[] = data.map((row: any) => ({
        id: row.id,
        name: row.business_name,
        title: row.trade,
        trade: row.trade,
        companyName: row.business_name,
        rating: Number(row.rating) || 5.0,
        reviewCount: row.review_count || 0,
        experienceYears: row.experience_years || 5,
        hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : undefined,
        dailyRate: row.daily_rate ? Number(row.daily_rate) : undefined,
        area: row.service_area,
        availability: row.availability || 'Available Today',
        avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=300&auto=format&fit=crop&q=80',
        tier: row.tier || 'Balanced',
        verified: row.verified,
        skills: row.skills || [],
        completedProjects: row.completed_projects || 0,
        phone: '+1 (555) 302-8491',
        email: 'contact@buildzy-provider.com',
        bio: row.bio || '',
      }));

      return { data: mapped, isLive: true };
    } catch {
      return { data: MOCK_PROFESSIONALS, isLive: false };
    }
  },
};
