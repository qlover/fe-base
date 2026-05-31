import {
  defaultOAuthClientConfig,
  type OAuthAuthorizationConfig,
  type OAuthLocaleIn,
  type OAuthLocaleOptions,
  type OAuthUrlOptions
} from './interface/OAuthConfig';
import type { OAuthGatewayAuthorizeParams } from './interface/OAuthGatwayInterface';

export type ResolvedOAuthAuthorizationConfig = OAuthAuthorizationConfig & {
  scope: string;
  redirectPath: string;
};

function resolveLocaleIn(options: OAuthLocaleOptions): OAuthLocaleIn {
  if (options.localeIn) {
    return options.localeIn;
  }
  return options.locale ? 'path' : 'none';
}

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

export function mergeOAuthAuthorizationConfig(
  params: Partial<OAuthGatewayAuthorizeParams> | undefined,
  baseConfig: OAuthAuthorizationConfig | null | undefined
): ResolvedOAuthAuthorizationConfig | null {
  const serverUrl = (params?.serverUrl ?? baseConfig?.serverUrl)?.trim();
  const clientId = (params?.clientId ?? baseConfig?.clientId)?.trim();

  if (!serverUrl || !clientId) {
    return null;
  }

  return {
    serverUrl: serverUrl.replace(/\/$/, ''),
    clientId,
    scope:
      params?.scope?.trim() ||
      baseConfig?.scope ||
      defaultOAuthClientConfig.scope!,
    redirectPath:
      params?.redirectPath?.trim() ||
      baseConfig?.redirectPath ||
      defaultOAuthClientConfig.redirectPath!
  };
}

export function buildOAuthRedirectUri(
  redirectPath: string,
  options: OAuthUrlOptions & OAuthLocaleOptions = {}
): string {
  const origin = (
    options.origin ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  ).replace(/\/$/, '');
  const prefix = (options.routerPrefix ?? '').replace(/\/$/, '');
  const path = redirectPath.replace(/^\//, '');
  const localeIn = resolveLocaleIn(options);

  const segments = [
    prefix,
    localeIn === 'path' && options.locale ? options.locale : '',
    path
  ].filter(Boolean);

  let url = `${origin}/${segments.join('/')}`.replace(/([^:]\/)\/+/g, '$1');

  if (options.locale && localeIn === 'query') {
    const param = options.localeQueryParam ?? 'locale';
    const joiner = url.includes('?') ? '&' : '?';
    url = `${url}${joiner}${param}=${encodeURIComponent(options.locale)}`;
  }

  return url;
}

export function formatOAuthAuthorizeUrl(
  serverUrl: string,
  authorizePath: string,
  searchParams: URLSearchParams,
  localeOptions: OAuthLocaleOptions = {}
): string {
  const base = serverUrl.replace(/\/$/, '');
  const path = authorizePath.startsWith('/')
    ? authorizePath
    : `/${authorizePath}`;
  const localeIn = resolveLocaleIn(localeOptions);

  const url =
    localeOptions.locale && localeIn === 'path'
      ? `${base}/${localeOptions.locale}${path}`
      : `${base}${path}`;

  const params = new URLSearchParams(searchParams);
  if (localeOptions.locale && localeIn === 'query') {
    params.set(
      localeOptions.localeQueryParam ?? 'locale',
      localeOptions.locale
    );
  }

  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export type BuildOAuthAuthorizeUrlInput = {
  config: ResolvedOAuthAuthorizationConfig;
  authorizePath: string;
  state: string;
  codeChallenge: string;
  redirectPath?: string;
  scope?: string;
} & OAuthUrlOptions &
  OAuthLocaleOptions;

export function buildOAuthAuthorizeUrl(
  input: BuildOAuthAuthorizeUrlInput
): string {
  const { config, authorizePath, state, codeChallenge, redirectPath, scope } =
    input;
  const redirectUri = buildOAuthRedirectUri(
    redirectPath ?? config.redirectPath,
    input
  );
  const searchParams = buildAuthorizeSearchParams({
    clientId: config.clientId,
    redirectUri,
    scope: scope ?? config.scope,
    state,
    codeChallenge
  });
  return formatOAuthAuthorizeUrl(
    config.serverUrl,
    authorizePath,
    searchParams,
    input
  );
}

export function buildOAuthLocaleHeaders(
  options: OAuthLocaleOptions = {}
): Record<string, string> {
  if (!options.locale || options.localeIn !== 'header') {
    return {};
  }

  const header = options.localeHeader ?? 'Accept-Language';
  return { [header]: options.locale };
}
