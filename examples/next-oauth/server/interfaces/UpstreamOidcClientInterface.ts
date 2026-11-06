/**
 * 服务端上游 OIDC/OAuth 客户端（授权码 + PKCE）。
 */

export type UpstreamOidcTokenResultType = {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly token_type?: string;
  readonly expires_in?: number;
  readonly id_token?: string;
};

export type UpstreamOidcUserInfoType = {
  readonly sub: string;
  readonly email?: string;
  readonly name?: string;
  readonly preferred_username?: string;
  readonly [key: string]: unknown;
};

export type UpstreamOidcAuthorizeStartType = {
  readonly authorizeUrl: string;
  readonly state: string;
  readonly codeVerifier: string;
};

export interface UpstreamOidcClientInterface {
  isConfigured(): boolean;

  buildAuthorizeStart(params: {
    readonly redirectUri: string;
  }): Promise<UpstreamOidcAuthorizeStartType>;

  exchangeAuthorizationCode(params: {
    readonly code: string;
    readonly codeVerifier: string;
    readonly redirectUri: string;
  }): Promise<UpstreamOidcTokenResultType>;

  fetchUserInfo(accessToken: string): Promise<UpstreamOidcUserInfoType>;
}
