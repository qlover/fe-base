export const OAuthWrapperEndpoints = {
  authorize: '/oauth/authorize',
  token: '/oauth/token',
  revoke: '/oauth/revoke',
  userinfo: '/oauth/userinfo'
} as const;

export const DEFAULT_OAUTH_AUTHORIZE_PATH = OAuthWrapperEndpoints.authorize;

export type OAuthAuthorizationConfig = {
  serverUrl: string;
  clientId: string;
  /**
   * @default 'openid profile email'
   */
  scope?: string;
  /**
   * @default 'oauth/callback'
   */
  redirectPath?: string;
};

export const DEFAULT_PKCE_STORAGE_KEY = 'oauth-wrapper-pkcesession';

export type OAuthLocaleIn = 'path' | 'query' | 'header' | 'none';

export type OAuthLocaleOptions = {
  /** Locale value; omit when locale is not used */
  locale?: string;
  /**
   * Where locale is applied.
   * Defaults to `path` when `locale` is set, otherwise `none`.
   */
  localeIn?: OAuthLocaleIn;
  /** Query param name when `localeIn` is `query`. @default `'locale'` */
  localeQueryParam?: string;
  /** Header name for token/userinfo requests. @default `'Accept-Language'` */
  localeHeader?: string;
};

export type OAuthUrlOptions = {
  origin?: string;
  routerPrefix?: string;
};

/**
 * Static OAuth browser client configuration (not reactive / not persisted as async state).
 */
export type OAuthClientConfig = OAuthAuthorizationConfig &
  OAuthUrlOptions &
  OAuthLocaleOptions;

export const defaultOAuthClientConfig: OAuthClientConfig = {
  locale: 'en',
  localeIn: 'path',
  localeQueryParam: 'local',
  localeHeader: 'Accept-Language',
  serverUrl: '',
  clientId: '',
  scope: 'openid profile email',
  redirectPath: 'oauth/callback'
};

export function resolveOAuthClientConfig(
  partial?: Partial<OAuthClientConfig>
): OAuthClientConfig {
  return {
    ...defaultOAuthClientConfig,
    ...partial
  };
}
