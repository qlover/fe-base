import type { OAuthGatewayAuthorizeParams } from './OAuthGatwayInterface';

export interface OAuthClientInterface {
  /**
   * 是否已配置
   */
  isConfigured(): boolean;

  /**
   * 开始鉴权
   *
   * @param params
   */
  startOAuthLogin(params?: OAuthGatewayAuthorizeParams): Promise<void>;

  /**
   * RFC 7009 — revoke the refresh token on the authorization server when provided.
   */
  revokeToken(refreshToken?: string | null): Promise<void>;
}
