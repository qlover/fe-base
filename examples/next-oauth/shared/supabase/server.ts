import { SUPABASE_KEY, SUPABASE_URL } from '@qlover/next-kit/common';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import {
  createClient as createSupabaseClient,
  type SupabaseClient
} from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Decode JWT payload without verifying signature (config sanity check only).
 */
function readJwtRole(jwt: string): string | null {
  try {
    const part = jwt.split('.')[1];
    if (!part) {
      return null;
    }
    const pad = part + '='.repeat((4 - (part.length % 4)) % 4);
    const json = Buffer.from(
      pad.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf8');
    const payload = JSON.parse(json) as { role?: string };
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

function requireSupabaseUrl(): string {
  const url = SUPABASE_URL?.trim();
  if (!url) {
    throw new Error('SUPABASE_URL is required');
  }
  return url;
}

function requireAnonKey(): string {
  const key = SUPABASE_KEY?.trim();
  if (!key) {
    throw new Error('SUPABASE_ANON_KEY / SUPABASE_KEY is required');
  }
  return key;
}

function requireServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for OAuth operations'
    );
  }
  // New Dashboard "publishable" keys must not be used as service role —
  // they hit PostgREST as anon and RLS returns empty role tables.
  if (key.startsWith('sb_publishable_') || key.startsWith('sb_secret_')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY must be the legacy service_role JWT (eyJ…), ' +
        'not sb_publishable_ / sb_secret_. Copy service_role from Project Settings → API.'
    );
  }
  const role = readJwtRole(key);
  if (role !== 'service_role') {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY JWT role is "${role ?? 'unreadable'}", expected "service_role". ` +
        'A publishable/anon key yields empty role tables under RLS.'
    );
  }
  return key;
}

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(requireSupabaseUrl(), requireAnonKey(), {
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
 * Cookie-free anon client for GoTrue auth only (`refreshSession` / `getUser`).
 * Never reuse the service-role admin client for these — `refreshSession`
 * writes a user JWT onto the client and subsequent PostgREST calls hit RLS
 * as that user (empty role tables, etc.).
 */
export function createEphemeralAuthClient(): SupabaseClient {
  return createSupabaseClient(requireSupabaseUrl(), requireAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

/**
 * Drop the process-wide admin client so the next {@link createAdminClient}
 * builds a clean service_role client (clears user-session pollution).
 */
export function resetAdminSupabaseClient(): void {
  const cache = globalThis as typeof globalThis & {
    __feAdminSupabase?: SupabaseClient;
    __feAdminSupabaseCacheKey?: string;
  };
  delete cache.__feAdminSupabase;
  delete cache.__feAdminSupabaseCacheKey;
}

/**
 * Service-role Supabase client for OAuth server operations (bypasses RLS).
 * Never import from client bundles.
 *
 * Do NOT call `auth.refreshSession` / `signIn*` on this client — that replaces
 * the service_role Authorization header with a user JWT.
 *
 * Cached on `globalThis` so TLS / HTTP keep-alive to Supabase is reused
 * across API requests. Cache key includes URL + key fingerprint so env
 * changes do not reuse a wrong client (e.g. anon/publishable).
 */
export function createAdminClient(): SupabaseClient {
  const url = requireSupabaseUrl();
  const serviceKey = requireServiceRoleKey();

  const cache = globalThis as typeof globalThis & {
    __feAdminSupabase?: SupabaseClient;
    __feAdminSupabaseCacheKey?: string;
  };
  const cacheKey = `${url}::${serviceKey.slice(0, 16)}`;
  if (
    cache.__feAdminSupabase &&
    cache.__feAdminSupabaseCacheKey === cacheKey
  ) {
    return cache.__feAdminSupabase;
  }

  cache.__feAdminSupabase = createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Pin service_role on PostgREST even if auth session was polluted earlier.
    global: {
      headers: {
        Authorization: `Bearer ${serviceKey}`
      }
    }
  });
  cache.__feAdminSupabaseCacheKey = cacheKey;
  return cache.__feAdminSupabase;
}
