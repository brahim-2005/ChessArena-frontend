import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || /your-|placeholder|example/i.test(`${supabaseUrl} ${supabaseKey}`)) {
    return false;
  }

  try {
    const url = new URL(supabaseUrl);
    return url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseKey) {
    throw new Error('Supabase is not configured. Set a valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export const supabase = isSupabaseConfigured() ? createClient() : null;
