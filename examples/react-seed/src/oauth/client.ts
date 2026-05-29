import {
  buildRedirectUri,
  getOAuthConfig,
  oauthTokenUrl,
  oauthUserinfoUrl
} from './config';
import { buildAuthorizeUrl } from './authorize';
import { mapOAuthUserToSeed } from './mapUser';
import { computePkceS256Challenge, generatePkceVerifier, randomOAuthState } from './pkce';
import {
  clearOAuthPkceSession,
  loadOAuthPkceSession,
  saveOAuthPkceSession
} from './session';
import {
  parseOAuthTokenError,
  parseOAuthTokenResponse,
  parseOAuthUserInfoResponse
} from './parseEnvelope';
import type { OAuthCallbackParams } from './types';
import type { OAuthSeedUser } from './mapUser';
import type { UserCredential } from '@/interfaces/schema/UserSchema';

export type OAuthLoginResult = {
  user: OAuthSeedUser;
  credential: UserCredential;
};

const callbackInflight = new Map<string, Promise<OAuthLoginResult>>();

function callbackDedupeKey(params: OAuthCallbackParams): string | null {
  if (!params.code || !params.state) {
    return null;
  }
  return `${params.code}:${params.state}`;
}

export async function startOAuthLogin(locale: string): Promise<void> {
  const config = getOAuthConfig();
  if (!config) {
    throw new Error('OAuth is not configured (VITE_OAUTH_SITE_URL, VITE_OAUTH_CLIENT_ID)');
  }

  const verifier = generatePkceVerifier();
  const challenge = await computePkceS256Challenge(verifier);
  const state = randomOAuthState();
  const redirectUri = buildRedirectUri(locale);

  saveOAuthPkceSession({
    state,
    codeVerifier: verifier,
    locale
  });

  const url = buildAuthorizeUrl(config, locale, {
    state,
    codeChallenge: challenge,
    redirectUri
  });
  window.location.assign(url);
}

export function parseOAuthCallbackSearchParams(
  searchParams: URLSearchParams
): OAuthCallbackParams {
  return {
    code: searchParams.get('code') ?? undefined,
    state: searchParams.get('state') ?? undefined,
    error: searchParams.get('error') ?? undefined,
    error_description: searchParams.get('error_description') ?? undefined
  };
}

async function exchangeAuthorizationCode(input: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<{ access_token: string; refresh_token?: string }> {
  const config = getOAuthConfig();
  if (!config) {
    throw new Error('OAuth is not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: config.clientId,
    code_verifier: input.codeVerifier
  });

  const res = await fetch(oauthTokenUrl(config.siteUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  const json: unknown = await res.json();
  if (!res.ok) {
    throw new Error(parseOAuthTokenError(json, 'Token exchange failed'));
  }

  return parseOAuthTokenResponse(json);
}

async function fetchOAuthUserInfo(accessToken: string) {
  const config = getOAuthConfig();
  if (!config) {
    throw new Error('OAuth is not configured');
  }

  const res = await fetch(oauthUserinfoUrl(config.siteUrl), {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const json: unknown = await res.json();
  if (!res.ok) {
    throw new Error(parseOAuthTokenError(json, 'Failed to fetch userinfo'));
  }

  return parseOAuthUserInfoResponse(json);
}

export async function completeOAuthCallback(
  params: OAuthCallbackParams,
  locale: string
): Promise<OAuthLoginResult> {
  const dedupeKey = callbackDedupeKey(params);
  if (dedupeKey) {
    const inflight = callbackInflight.get(dedupeKey);
    if (inflight) {
      return inflight;
    }
  }

  const promise = runCompleteOAuthCallback(params, locale);
  if (dedupeKey) {
    callbackInflight.set(dedupeKey, promise);
    promise.finally(() => {
      callbackInflight.delete(dedupeKey);
    });
  }

  return promise;
}

async function runCompleteOAuthCallback(
  params: OAuthCallbackParams,
  locale: string
): Promise<OAuthLoginResult> {
  if (params.error) {
    throw new Error(
      params.error_description?.trim() || params.error || 'Authorization denied'
    );
  }

  if (!params.code || !params.state) {
    throw new Error('Missing authorization code or state');
  }

  const session = loadOAuthPkceSession();
  if (!session) {
    throw new Error('OAuth session expired; please sign in again');
  }

  if (session.state !== params.state) {
    clearOAuthPkceSession();
    throw new Error('Invalid state (possible CSRF)');
  }

  if (session.locale !== locale) {
    clearOAuthPkceSession();
    throw new Error('Locale mismatch during OAuth callback');
  }

  const redirectUri = buildRedirectUri(locale);

  try {
    const tokens = await exchangeAuthorizationCode({
      code: params.code,
      redirectUri,
      codeVerifier: session.codeVerifier
    });

    const userinfo = await fetchOAuthUserInfo(tokens.access_token);
    return mapOAuthUserToSeed(userinfo, tokens.access_token);
  } finally {
    clearOAuthPkceSession();
  }
}
