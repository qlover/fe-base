export interface OAuthGatewayAuthorizeParams {
  /**
   * 服务端 URL
   */
  readonly serverUrl: string;

  /**
   * 服务端鉴权用的客户端 ID
   */
  readonly clientId: string;
  /**
   * 鉴权范围
   *
   * @default `'openid profile email'`
   */
  readonly scope?: string;
  /**
   * 鉴权成功后回调地址, 会接收的鉴权回调参数
   *
   * @default `'oauth/callback'`
   */
  readonly redirectPath?: string;
  /**
   * 跳转目标
   * - _self: 当前窗口
   * - _blank: 新窗口
   *
   * @default _self
   */
  readonly target?: '_self' | '_blank';
}

export type OAuthGatewayTokenRequest = {
  readonly grant_type: 'authorization_code' | 'refresh_token';
  readonly code: string;
  readonly redirect_uri: string;
  readonly client_id: string;
  readonly code_verifier: string;
};

export type OAuthGatewayTokenResult = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

export type OAuthGatewayUserinfoResult = {
  sub: string;
  email: string;
  name: string;
  roles?: string[] | undefined;
};

export type OAuthGatewayCallbackParams = {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
};

export interface OAuthGatwayInterface {
  /**
   * 开始鉴权
   *
   * - 跳转 OAuth 授权页面
   */
  authorize(params: OAuthGatewayAuthorizeParams): Promise<void>;
  authorize(authorizeUrl: string): Promise<void>;
  /**
   * 获取令牌
   *
   * - 请求服务端获取令牌
   */
  getToken(request: OAuthGatewayTokenRequest): Promise<OAuthGatewayTokenResult>;

  /**
   * 获取用户信息
   *
   * - 请求服务端获取用户信息
   */
  getUserInfo(accessToken: string): Promise<OAuthGatewayUserinfoResult>;

  /**
   * 处理 OAuth 回调
   *
   * 你可以在回调页面直接调用该方法即可
   *
   * 回调页面见 {@link authorize} {@link OAuthGatewayAuthorizeParams}
   *
   * - 处理 OAuth 回调参数
   */
  oAuthWrapperCallback(
    params?: OAuthGatewayCallbackParams | URLSearchParams
  ): Promise<unknown>;

  /**
   * RFC 7009 — revoke the refresh token on the authorization server when provided.
   */
  revokeToken(options?: { refreshToken?: string }): Promise<void>;
}
