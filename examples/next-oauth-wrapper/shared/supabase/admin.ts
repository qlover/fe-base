import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './conts';

/**
 * Service-role Supabase client for OAuth server operations (bypasses RLS).
 * Never import from client bundles.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for OAuth operations'
    );
  }
  return createSupabaseClient(SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
