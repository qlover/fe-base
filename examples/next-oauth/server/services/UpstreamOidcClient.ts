import {
  buildAuthorizeSearchParams,
  formatOAuthAuthorizeUrl
} from '@qlover/oauth-wrapper/client';
import {
  computePkceS256Challenge,
  generatePkceVerifier,
  randomOAuthState
} from '@qlover/oauth-wrapper/core';
import { injectable } from '@shared/container';
import {
  isUpstreamOidcConfigured,
  resolveUpstreamOidcEnvConfig,
  type UpstreamOidcEnvConfigType
} from '@config/UpstreamOidcConfig';
import type {
  UpstreamOidcAuthorizeStartType,
  UpstreamOidcClientInterface,
  UpstreamOidcTokenResultType,
  UpstreamOidcUserInfoType
} from '@server/interfaces/UpstreamOidcClientInterface';

/**
 * 标准授权码 + PKCE 上游客户端（env 配置）。
 */
@injectable()
export class UpstreamOidcClient implements UpstreamOidcClientInterface {
  protected readonly config: UpstreamOidcEnvConfigType =
    resolveUpstreamOidcEnvConfig();

  /**
   * @override
   */
  public isConfigured(): boolean {
    return isUpstreamOidcConfigured(this.config);
  }

  public getLinkProvider(): string {
    return this.config.linkProvider || 'oauth-pkce';
  }

  public getRedirectPath(): string {
    return this.config.redirectPath.startsWith('/')
      ? this.config.redirectPath
      : `/${this.config.redirectPath}`;
  }

  /**
   * @override
   */
  public async buildAuthorizeStart(params: {
    readonly redirectUri: string;
  }): Promise<UpstreamOidcAuthorizeStartType> {
    this.assertConfigured();
    const state = randomOAuthState();
    const codeVerifier = generatePkceVerifier();
    const codeChallenge = await computePkceS256Challenge(codeVerifier);
    const searchParams = buildAuthorizeSearchParams({
      clientId: this.config.clientId,
      redirectUri: params.redirectUri,
      scope: this.config.scope,
      state,
      codeChallenge
    });
    const authorizeUrl = formatOAuthAuthorizeUrl(
      this.config.serverUrl,
      this.config.authorizePath,
      searchParams
    );
    return { authorizeUrl, state, codeVerifier };
  }

  /**
   * @override
   */
  public async exchangeAuthorizationCode(params: {
    readonly code: string;
    readonly codeVerifier: string;
    readonly redirectUri: string;
  }): Promise<UpstreamOidcTokenResultType> {
    this.assertConfigured();
    const tokenUrl = this.joinUrl(this.config.serverUrl, this.config.tokenPath);
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: this.config.clientId,
      code_verifier: params.codeVerifier
    });
    if (this.config.clientSecret) {
      body.set('client_secret', this.config.clientSecret);
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body
    });
    const text = await response.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(
        `Upstream token response is not JSON: ${text.slice(0, 200)}`
      );
    }
    if (!response.ok || typeof parsed.access_token !== 'string') {
      const err =
        typeof parsed.error_description === 'string'
          ? parsed.error_description
          : typeof parsed.error === 'string'
            ? parsed.error
            : text.slice(0, 200);
      throw new Error(`Upstream token exchange failed: ${err}`);
    }
    return {
      access_token: parsed.access_token,
      refresh_token:
        typeof parsed.refresh_token === 'string'
          ? parsed.refresh_token
          : undefined,
      token_type:
        typeof parsed.token_type === 'string' ? parsed.token_type : undefined,
      expires_in:
        typeof parsed.expires_in === 'number' ? parsed.expires_in : undefined,
      id_token:
        typeof parsed.id_token === 'string' ? parsed.id_token : undefined
    };
  }

  /**
   * @override
   */
  public async fetchUserInfo(
    accessToken: string
  ): Promise<UpstreamOidcUserInfoType> {
    this.assertConfigured();
    const userinfoUrl = this.joinUrl(
      this.config.serverUrl,
      this.config.userinfoPath
    );
    const response = await fetch(userinfoUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });
    const text = await response.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(
        `Upstream userinfo response is not JSON: ${text.slice(0, 200)}`
      );
    }
    if (!response.ok || typeof parsed.sub !== 'string' || !parsed.sub.trim()) {
      throw new Error(
        `Upstream userinfo failed: ${text.slice(0, 200) || response.status}`
      );
    }
    return parsed as UpstreamOidcUserInfoType;
  }

  protected assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new Error(
        'Upstream OIDC is not configured (OAUTH_UPSTREAM_OIDC_SERVER_URL / CLIENT_ID)'
      );
    }
  }

  protected joinUrl(serverUrl: string, path: string): string {
    const base = serverUrl.replace(/\/$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
  }
}
