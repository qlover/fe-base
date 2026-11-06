/**
 * 通用上游 OAuth/PKCE（oauth-pkce）环境配置键与默认值。
 */

export const UPSTREAM_OIDC_PROVIDER_KEY = 'oauth-pkce' as const;

export const UPSTREAM_OIDC_PKCE_COOKIE = 'upstream_oidc_pkce' as const;

export type UpstreamOidcEnvConfigType = {
  readonly serverUrl: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly scope: string;
  readonly redirectPath: string;
  readonly authorizePath: string;
  readonly tokenPath: string;
  readonly userinfoPath: string;
  /** 写入 fe_oauth_user_links.provider */
  readonly linkProvider: string;
};

/**
 * 从 process.env 解析上游 OIDC 配置（缺省给安全空串，由调用方校验）。
 */
export function resolveUpstreamOidcEnvConfig(
  env: NodeJS.ProcessEnv = process.env
): UpstreamOidcEnvConfigType {
  return {
    serverUrl: (env.OAUTH_UPSTREAM_OIDC_SERVER_URL ?? '').trim(),
    clientId: (env.OAUTH_UPSTREAM_OIDC_CLIENT_ID ?? '').trim(),
    clientSecret: (env.OAUTH_UPSTREAM_OIDC_CLIENT_SECRET ?? '').trim(),
    scope: (env.OAUTH_UPSTREAM_OIDC_SCOPE ?? 'openid profile email').trim(),
    redirectPath: (
      env.OAUTH_UPSTREAM_OIDC_REDIRECT_PATH ?? '/api/callback/upstream-oauth'
    ).trim(),
    authorizePath: (
      env.OAUTH_UPSTREAM_OIDC_AUTHORIZE_PATH ?? '/oauth/authorize'
    ).trim(),
    tokenPath: (env.OAUTH_UPSTREAM_OIDC_TOKEN_PATH ?? '/oauth/token').trim(),
    userinfoPath: (
      env.OAUTH_UPSTREAM_OIDC_USERINFO_PATH ?? '/oauth/userinfo'
    ).trim(),
    linkProvider: (
      env.OAUTH_UPSTREAM_OIDC_LINK_PROVIDER ?? UPSTREAM_OIDC_PROVIDER_KEY
    ).trim()
  };
}

/**
 * 是否具备发起授权所需的最小配置。
 */
export function isUpstreamOidcConfigured(
  config: UpstreamOidcEnvConfigType
): boolean {
  return Boolean(config.serverUrl && config.clientId && config.redirectPath);
}
