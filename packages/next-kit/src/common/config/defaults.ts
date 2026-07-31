/**
 * Shared defaults used by list/search validators and UI pagination.
 */
export const defaultSearchParams = {
  page: 1,
  pageSize: 20,
  sort: [{ orderBy: 'created_at', order: 'desc' }]
} as const;

export const loginProviders = {
  GitHub: 'GitHub',
  Google: 'Google'
} as const;

export type LoginProviderType =
  (typeof loginProviders)[keyof typeof loginProviders];

/**
 * Maps UI `loginProviders` names to Supabase Auth `signInWithOAuth` provider ids.
 */
export function resolveSupabaseOAuthProvider(
  provider: LoginProviderType
): string {
  return provider.toLowerCase();
}
