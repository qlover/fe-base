import { ROUTE_OAUTH_AUTHORIZE } from '@config/route';

export type OAuthCallbackParams = {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
};

/**
 * Builds the real OAuth authorize query string from registered client fields.
 */
export function buildAuthorizeSearchParams(input: {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256';
}): URLSearchParams {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: input.clientId,
    redirect_uri: input.redirectUri
  });
  if (input.scopes.length > 0) {
    params.set('scope', input.scopes.join(' '));
  }
  if (input.state?.trim()) {
    params.set('state', input.state.trim());
  }
  if (input.codeChallenge?.trim()) {
    params.set('code_challenge', input.codeChallenge.trim());
    params.set('code_challenge_method', input.codeChallengeMethod ?? 'S256');
  }
  return params;
}

export function buildAuthorizeUrl(
  origin: string,
  locale: string,
  input: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
    state?: string;
    codeChallenge?: string;
    codeChallengeMethod?: 'S256';
  }
): string {
  const prefix = locale ? `/${locale}` : '';
  const params = buildAuthorizeSearchParams(input);
  return `${origin}${prefix}${ROUTE_OAUTH_AUTHORIZE}?${params.toString()}`;
}

/**
 * Parses code / error from the redirect URL returned by consent (no browser navigation).
 */
export function parseOAuthCallbackUrl(
  redirectUrl: string
): OAuthCallbackParams {
  const url = new URL(redirectUrl);
  return {
    code: url.searchParams.get('code') ?? undefined,
    state: url.searchParams.get('state') ?? undefined,
    error: url.searchParams.get('error') ?? undefined,
    error_description: url.searchParams.get('error_description') ?? undefined
  };
}

export function randomStateValue(): string {
  return `playground_${Math.random().toString(36).slice(2, 12)}`;
}
