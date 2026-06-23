import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SUPABASE_KEY, SUPABASE_URL } from './conts';

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    // global: {
    //   fetch: (input, init) => {
    //     console.log('supabase globals fetch', input, init);

    //     return fetch(input, init);
    //   }
    // },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have proxy refreshing
          // user sessions.
        }
      }
    }
  });
}

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
