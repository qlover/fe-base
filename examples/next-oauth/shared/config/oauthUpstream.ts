/**
 * Upstream identity provider selected for this Next OAuth template.
 *
 * - `supabase` (default): existing Supabase Auth password / OTP / SSO path — unchanged.
 * - `brain-user`: wrap an existing login API (Brain User) as the OAuth AS credential source.
 *
 * Prefer `NEXT_PUBLIC_OAUTH_UPSTREAM_PROVIDER` so client UI (e.g. hide SSO) stays in sync
 * with server IOC. Server also reads `OAUTH_UPSTREAM_PROVIDER` as fallback.
 */
export const OAUTH_UPSTREAM_SUPABASE = 'supabase' as const;
export const OAUTH_UPSTREAM_BRAIN_USER = 'brain-user' as const;

export type OAuthUpstreamId =
  | typeof OAUTH_UPSTREAM_SUPABASE
  | typeof OAUTH_UPSTREAM_BRAIN_USER;

export function resolveOAuthUpstreamProvider(
  raw: string | undefined | null
): OAuthUpstreamId {
  return raw === OAUTH_UPSTREAM_BRAIN_USER
    ? OAUTH_UPSTREAM_BRAIN_USER
    : OAUTH_UPSTREAM_SUPABASE;
}

/**
 * Active upstream for this process. Defaults to Supabase when unset / unknown.
 */
export function getOAuthUpstreamProvider(): OAuthUpstreamId {
  return resolveOAuthUpstreamProvider(
    process.env.NEXT_PUBLIC_OAUTH_UPSTREAM_PROVIDER ??
      process.env.OAUTH_UPSTREAM_PROVIDER
  );
}

export function isSupabaseOAuthUpstream(): boolean {
  return getOAuthUpstreamProvider() === OAUTH_UPSTREAM_SUPABASE;
}

export function isBrainUserOAuthUpstream(): boolean {
  return getOAuthUpstreamProvider() === OAUTH_UPSTREAM_BRAIN_USER;
}
