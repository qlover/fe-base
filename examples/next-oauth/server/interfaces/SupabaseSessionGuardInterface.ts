/**
 * Keep the Supabase cookie session aligned with the app HttpOnly JWT session.
 *
 * When the app session is valid but the Supabase session is missing/expired,
 * RLS treats the request as anonymous and queries return empty rows. This
 * guard recovers (or clears) before data access.
 */
export interface SupabaseSessionGuardInterface {
  /**
   * Ensure the current user's Supabase session is usable:
   * - cookie session OK: sync rotated refresh tokens back to the app session
   * - cookie session missing: recover with the app session refresh token
   * - recovery fails: clear the app session and throw `API_NOT_AUTHORIZED`
   *
   * No-ops when there is no app session (caller handles auth).
   */
  ensureForCurrentUser(): Promise<void>;

  /**
   * Prefer the live cookie refresh token so callers do not reuse a rotated
   * token and trigger `refresh_token_already_used`.
   *
   * @param appUserId - User id from the app session
   * @param fallback - Token from the app session when the cookie is unavailable
   */
  resolveLiveRefreshToken(appUserId: string, fallback: string): Promise<string>;
}
