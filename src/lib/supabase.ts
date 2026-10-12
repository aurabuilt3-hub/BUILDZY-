import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Check if valid credentials are provided (not empty and not the placeholder)
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon')
);

export const isSupabaseConfigured = isConfigured;

/**
 * Singleton Supabase client instance.
 * Safe fallback client if credentials are not configured yet,
 * enabling seamless offline Demo Showcase mode.
 */
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (createClient('https://placeholder-offline.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }));

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
  mode: 'supabase-connected' | 'demo-showcase';
}

export const getSupabaseConfigStatus = (): SupabaseConfigStatus => ({
  isConfigured,
  url: isConfigured ? supabaseUrl : null,
  mode: isConfigured ? 'supabase-connected' : 'demo-showcase',
});
