import { createClient } from '@supabase/supabase-js';

export class SupabaseAdminConfigurationError extends Error {
  constructor() {
    super('Missing Supabase URL or Service Role Key for admin client');
    this.name = 'SupabaseAdminConfigurationError';
  }
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new SupabaseAdminConfigurationError();
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}