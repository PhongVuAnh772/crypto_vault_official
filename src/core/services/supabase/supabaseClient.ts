import { createClient } from '@supabase/supabase-js';
import EnvConfig from 'src/core/constants/EnvConfig';

const RAW_SUPABASE_URL = process.env.SUPABASE_URL || EnvConfig.SUPABASE_URL || '';
const RAW_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || EnvConfig.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  RAW_SUPABASE_URL?.trim() && RAW_SUPABASE_ANON_KEY?.trim(),
);

const SUPABASE_URL = isSupabaseConfigured
  ? RAW_SUPABASE_URL
  : 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = isSupabaseConfigured
  ? RAW_SUPABASE_ANON_KEY
  : 'placeholder-anon-key';

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Running with placeholder config; auth/data sync is disabled.',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
