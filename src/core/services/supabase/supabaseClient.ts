import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project URL and Anon Key
const SUPABASE_URL = 'https://zmsgkyiqikhtwwsjhoxn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oWKTV0ViCo_8TTsBITbJiA_VfXziOtN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
