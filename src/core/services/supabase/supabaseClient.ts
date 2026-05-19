import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../../../env.config';

let client: SupabaseClient | null = null;

const resolvedUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  SUPABASE_URL ||
  '';

const resolvedAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  SUPABASE_ANON_KEY ||
  '';

export const getSupabaseClient = () => {
  if (client) return client;
  if (!resolvedUrl || !resolvedAnonKey) return null;
  client = createClient(resolvedUrl, resolvedAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
};

export const requireSupabaseClient = () => {
  const c = getSupabaseClient();
  if (!c) {
    throw new Error(
      'Supabase is not configured on mobile. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_* equivalents).',
    );
  }
  return c;
};

export type SupabaseAuthSession = Session | null;
