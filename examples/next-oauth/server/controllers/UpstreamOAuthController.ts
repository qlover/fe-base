import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { ROUTE_HOME, ROUTE_LOGIN } from '@config/route';
import { UPSTREAM_OIDC_PKCE_COOKIE } from '@config/UpstreamOidcConfig';
import { API_SERVER_ERROR } from '@config/i18n-identifier/api';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { I } from '@config/ioc-identifiter';
import { GenericUpstreamOAuthProvider } from '@server/providers/GenericUpstreamOAuthProvider';
import { UpstreamOidcClient } from '@server/services/UpstreamOidcClient';
import { cookies } from 'next/headers';
import type { LoggerInterface } from '@qlover/logger';

type PkceCookiePayloadType = {
  readonly state: string;
  readonly codeVerifier: string;
  readonly redirectUri: string;
};

/**
 * 上游 OAuth/PKCE：发起授权与回调换票。
 */
@injectable()
export class UpstreamOAuthController {
  constructor(
    @inject(I.AppConfig)
    protected readonly serverConfig: SeedServerConfigInterface,
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(UpstreamOidcClient)
    protected readonly oidcClient: UpstreamOidcClient,
    @inject(GenericUpstreamOAuthProvider)
    protected readonly provider: GenericUpstreamOAuthProvider
  ) {}

  /**
   * 开始授权：写 PKCE cookie，返回 IdP authorize URL（供 302）。
   */
  public async startAuthorization(): Promise<{ readonly redirectUrl: string }> {
    if (!this.oidcClient.isConfigured()) {
      throw new ExecutorError(
        API_SERVER_ERROR,
        'Upstream OIDC is not configured'
      );
    }

    const redirectUri = new URL(
      this.oidcClient.getRedirectPath(),
      this.serverConfig.siteUrl
    ).toString();

    const started = await this.oidcClient.buildAuthorizeStart({ redirectUri });
    const jar = await cookies();
    const payload: PkceCookiePayloadType = {
      state: started.state,
      codeVerifier: started.codeVerifier,
      redirectUri
    };
    jar.set(UPSTREAM_OIDC_PKCE_COOKIE, JSON.stringify(payload), {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.serverConfig.isProduction,
      path: '/',
      maxAge: 10 * 60
    });

    return { redirectUrl: started.authorizeUrl };
  }

  protected toSiteUrl(pathname: string, search?: string): string {
    const base = this.serverConfig.siteUrl.replace(/\/$/, '');
    const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const url = new URL(`${base}${path}`);
    if (search) {
      url.search = search.startsWith('?') ? search.slice(1) : search;
    }
    return url.toString();
  }

  /**
   * 回调：校验 state，换票建会话，返回落地页。
   */
  public async completeCallback(query: Record<string, string>): Promise<{
    readonly redirectUrl: string;
  }> {
    const error = query.error?.trim();
    if (error) {
      this.logger.warn('Upstream OIDC callback error', {
        error,
        description: query.error_description
      });
      return {
        redirectUrl: this.toSiteUrl(
          ROUTE_LOGIN,
          `oauth_error=${encodeURIComponent(error)}`
        )
      };
    }

    const code = query.code?.trim() ?? '';
    const state = query.state?.trim() ?? '';
    if (!code || !state) {
      return {
        redirectUrl: this.toSiteUrl(ROUTE_LOGIN, 'oauth_error=missing_code')
      };
    }

    const jar = await cookies();
    const raw = jar.get(UPSTREAM_OIDC_PKCE_COOKIE)?.value;
    jar.delete(UPSTREAM_OIDC_PKCE_COOKIE);

    let payload: PkceCookiePayloadType | null = null;
    try {
      payload = raw ? (JSON.parse(raw) as PkceCookiePayloadType) : null;
    } catch {
      payload = null;
    }

    if (!payload || payload.state !== state || !payload.codeVerifier) {
      return {
        redirectUrl: this.toSiteUrl(ROUTE_LOGIN, 'oauth_error=invalid_state')
      };
    }

    try {
      await this.provider.completeAuthorizationCode({
        code,
        codeVerifier: payload.codeVerifier,
        redirectUri: payload.redirectUri
      });
    } catch (err: unknown) {
      this.logger.error('Upstream OIDC complete failed', { error: err });
      return {
        redirectUrl: this.toSiteUrl(ROUTE_LOGIN, 'oauth_error=exchange_failed')
      };
    }

    return { redirectUrl: this.toSiteUrl(ROUTE_HOME) };
  }
}
