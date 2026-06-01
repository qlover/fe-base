import {
  HttpMethods,
  type RequestAdapterConfig,
  type RequestAdapterResponse,
  type RequestExecutorInterface
} from '@qlover/fe-corekit';
import {
  DEFAULT_OAUTH_AUTHORIZE_PATH,
  defaultOAuthClientConfig,
  OAuthWrapperEndpoints,
  type OAuthAuthorizationConfig,
  type OAuthLocaleOptions,
  type OAuthUrlOptions
} from './interface/OAuthConfig';
import {
  buildOAuthAuthorizeUrl,
  buildOAuthLocaleHeaders,
  buildOAuthRedirectUri,
  mergeOAuthAuthorizationConfig
} from './oauthUrlUtils';
import {
  parseOAuthTokenError,
  parseOAuthTokenResponse,
  parseOAuthUserInfoResponse
} from './parseEnvelope';
import type { OAuthUserMapper } from './types';
import type { PKCESessionStore } from './PKCESessionStore';
import type {
  OAuthGatewayAuthorizeParams,
  OAuthGatewayCallbackParams,
  OAuthGatewayTokenRequest,
  OAuthGatewayTokenResult,
  OAuthGatewayUserinfoResult,
  OAuthGatwayInterface
} from './interface/OAuthGatwayInterface';
import { computePkceS256Challenge } from '../core';

export type OAuthGatewayRequestConfig = RequestAdapterConfig<string>;

export type OAuthGatewayOptions = {
  store: PKCESessionStore;
  config: OAuthAuthorizationConfig | null;
  mapUser: OAuthUserMapper;
  /** When provided, token/userinfo requests go through the executor; otherwise uses fetch */
  requester?: RequestExecutorInterface<OAuthGatewayRequestConfig>;
} & OAuthUrlOptions &
  OAuthLocaleOptions & {
    authorizePath?: string;
  };

function parseCallbackParams(
  params?: OAuthGatewayCallbackParams | URLSearchParams
): OAuthGatewayCallbackParams {
  if (params instanceof URLSearchParams) {
    return {
      code: params.get('code') ?? undefined,
      state: params.get('state') ?? undefined,
      error: params.get('error') ?? undefined,
      error_description: params.get('error_description') ?? undefined
    };
  }
  return params ?? {};
}

function callbackDedupeKey(params: OAuthGatewayCallbackParams): string | null {
  if (!params.code || !params.state) {
    return null;
  }
  return `${params.code}:${params.state}`;
}

export class OAuthGateway<T = unknown> implements OAuthGatwayInterface {
  private readonly callbackInflight = new Map<string, Promise<T>>();

  constructor(private readonly options: OAuthGatewayOptions) {}

  private get localeOptions(): OAuthLocaleOptions {
    return {
      locale: this.options.locale,
      localeIn: this.options.localeIn,
      localeQueryParam: this.options.localeQueryParam,
      localeHeader: this.options.localeHeader
    };
  }

  private get authorizePath(): string {
    return this.options.authorizePath ?? DEFAULT_OAUTH_AUTHORIZE_PATH;
  }

  private get urlOptions(): OAuthUrlOptions {
    return {
      origin: this.options.origin,
      routerPrefix: this.options.routerPrefix
    };
  }

  private getServerUrl(): string {
    const serverUrl = this.options.config?.serverUrl;
    if (!serverUrl) {
      throw new Error('OAuth is not configured');
    }
    return serverUrl;
  }

  private buildRequestHeaders(
    headers: Record<string, string>
  ): Record<string, string> {
    return {
      ...buildOAuthLocaleHeaders(this.localeOptions),
      ...headers
    };
  }

  private async requestJson(
    path: string,
    init: {
      method: string;
      headers: Record<string, string>;
      body?: string;
    },
    errorFallback: string
  ): Promise<unknown> {
    const requester = this.options.requester;
    if (requester) {
      const response = (await requester.request({
        url: path,
        method: init.method,
        headers: init.headers,
        data: init.body
      })) as RequestAdapterResponse<unknown, unknown>;

      if (response.status < 200 || response.status >= 300) {
        throw new Error(parseOAuthTokenError(response.data, errorFallback));
      }
      return response.data;
    }

    const res = await fetch(`${this.getServerUrl()}${path}`, {
      method: init.method,
      headers: init.headers,
      body: init.body
    });

    const json: unknown = await res.json();
    if (!res.ok) {
      throw new Error(parseOAuthTokenError(json, errorFallback));
    }
    return json;
  }

  /**
   * @override
   */
  public async authorize(params: OAuthGatewayAuthorizeParams): Promise<void>;
  /**
   * @override
   */
  public async authorize(authorizeUrl: string): Promise<void>;
  /**
   * @override
   */
  public async authorize(
    paramsOrUrl: OAuthGatewayAuthorizeParams | string
  ): Promise<void> {
    if (typeof paramsOrUrl === 'string') {
      window.location.assign(paramsOrUrl);
      return;
    }

    const config = mergeOAuthAuthorizationConfig(
      paramsOrUrl,
      this.options.config
    );
    if (!config) {
      throw new Error('OAuth is not configured');
    }

    const session = this.options.store.loadPkceSession();
    if (!session) {
      throw new Error('PKCE session is required before authorize');
    }

    const url = buildOAuthAuthorizeUrl({
      config,
      authorizePath: this.authorizePath,
      redirectPath: paramsOrUrl.redirectPath,
      scope: paramsOrUrl.scope,
      state: session.state,
      codeChallenge: await computePkceS256Challenge(session.codeVerifier),
      ...this.urlOptions,
      ...this.localeOptions
    });

    if (paramsOrUrl.target === '_blank') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    window.location.assign(url);
  }

  /**
   * @override
   */
  public async getToken(
    request: OAuthGatewayTokenRequest
  ): Promise<OAuthGatewayTokenResult> {
    const body = new URLSearchParams({
      grant_type: request.grant_type,
      code: request.code,
      redirect_uri: request.redirect_uri,
      client_id: request.client_id,
      code_verifier: request.code_verifier
    });

    const json = await this.requestJson(
      OAuthWrapperEndpoints.token,
      {
        method: HttpMethods.POST,
        headers: this.buildRequestHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body: body.toString()
      },
      'Token exchange failed'
    );

    return parseOAuthTokenResponse(json);
  }

  /**
   * @override
   */
  public async getUserInfo(
    accessToken: string
  ): Promise<OAuthGatewayUserinfoResult> {
    const json = await this.requestJson(
      OAuthWrapperEndpoints.userinfo,
      {
        method: HttpMethods.GET,
        headers: this.buildRequestHeaders({
          Authorization: `Bearer ${accessToken}`
        })
      },
      'Failed to fetch userinfo'
    );

    return parseOAuthUserInfoResponse(json);
  }

  /**
   * @override
   */
  public async oAuthWrapperCallback(
    params?: OAuthGatewayCallbackParams | URLSearchParams
  ): Promise<T> {
    const parsed = parseCallbackParams(params);
    const dedupeKey = callbackDedupeKey(parsed);
    if (dedupeKey) {
      const inflight = this.callbackInflight.get(dedupeKey);
      if (inflight) {
        return inflight;
      }
    }

    const promise = this.runOAuthWrapperCallback(parsed);
    if (dedupeKey) {
      this.callbackInflight.set(dedupeKey, promise);
      promise.finally(() => {
        this.callbackInflight.delete(dedupeKey);
      });
    }

    return promise;
  }

  private async runOAuthWrapperCallback(
    params: OAuthGatewayCallbackParams
  ): Promise<T> {
    if (params.error) {
      throw new Error(
        params.error_description?.trim() ||
          params.error ||
          'Authorization denied'
      );
    }

    if (!params.code || !params.state) {
      throw new Error('Missing authorization code or state');
    }

    const store = this.options.store;
    const session = store.loadPkceSession();
    if (!session) {
      throw new Error('OAuth session expired; please sign in again');
    }

    if (session.state !== params.state) {
      store.clearPkceSession();
      throw new Error('Invalid state (possible CSRF)');
    }

    const currentLocale = this.options.locale;
    if (
      session.locale != null &&
      currentLocale != null &&
      session.locale !== currentLocale
    ) {
      store.clearPkceSession();
      throw new Error('Locale mismatch during OAuth callback');
    }

    const config = this.options.config;
    if (!config) {
      throw new Error('OAuth is not configured');
    }

    const redirectUri = buildOAuthRedirectUri(
      config.redirectPath ?? defaultOAuthClientConfig.redirectPath!,
      { ...this.urlOptions, ...this.localeOptions }
    );

    try {
      const tokens = await this.getToken({
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: redirectUri,
        client_id: config.clientId,
        code_verifier: session.codeVerifier
      });

      const userinfo = await this.getUserInfo(tokens.access_token);
      return this.options.mapUser(
        userinfo,
        tokens.access_token,
        tokens.refresh_token
      ) as T;
    } finally {
      store.clearPkceSession();
    }
  }

  /**
   * @override
   */
  public async revokeToken(options?: { refreshToken?: string }): Promise<void> {
    const config = this.options.config;
    if (!config || !options?.refreshToken) {
      return;
    }

    const body = new URLSearchParams({
      token: options.refreshToken,
      token_type_hint: 'refresh_token',
      client_id: config.clientId
    });

    await this.postRevokeToken(body);
  }

  private async postRevokeToken(body: URLSearchParams): Promise<void> {
    const path = OAuthWrapperEndpoints.revoke;
    const headers = this.buildRequestHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const requester = this.options.requester;

    if (requester) {
      await requester.request({
        url: path,
        method: HttpMethods.POST,
        headers,
        data: body.toString()
      });
      return;
    }

    await fetch(`${this.getServerUrl()}${path}`, {
      method: HttpMethods.POST,
      headers,
      body: body.toString()
    });
  }
}
