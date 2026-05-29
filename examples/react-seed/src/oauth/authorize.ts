import type { OAuthClientConfig } from './config';

const AUTHORIZE_PATH = '/oauth/authorize';

export function buildAuthorizeSearchParams(input: {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge: string;
}): URLSearchParams {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    scope: input.scope,
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: 'S256'
  });
  return params;
}

export function buildAuthorizeUrl(
  config: OAuthClientConfig,
  locale: string,
  input: {
    state: string;
    codeChallenge: string;
    redirectUri: string;
  }
): string {
  const params = buildAuthorizeSearchParams({
    clientId: config.clientId,
    redirectUri: input.redirectUri,
    scope: config.scope,
    state: input.state,
    codeChallenge: input.codeChallenge
  });
  return `${config.siteUrl}/${locale}${AUTHORIZE_PATH}?${params.toString()}`;
}
