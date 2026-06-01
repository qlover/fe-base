/**
 * Builds OAuth 2.0 redirect URLs for authorization responses.
 */
export function buildOAuthRedirectUrl(
  redirectUri: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL(redirectUri);

  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export function parseScopeList(scope: string | undefined): string[] {
  if (!scope?.trim()) {
    return ['openid', 'profile', 'email'];
  }

  return scope.trim().split(/\s+/).filter(Boolean);
}
