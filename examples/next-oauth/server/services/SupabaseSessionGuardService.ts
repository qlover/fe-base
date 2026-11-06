import { ExecutorError } from '@qlover/fe-corekit/executor';
import { SupabaseRepo } from '@qlover/next-kit/server';
import jwt from 'jsonwebtoken';
import { inject, injectable } from '@shared/container';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { SupabaseSessionGuardInterface } from '@server/interfaces/SupabaseSessionGuardInterface';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import type { LoggerInterface } from '@qlover/logger';
import type { UserSchema } from '@qlover/next-kit/common';
import type { OAuthSessionPayload } from '@qlover/oauth-wrapper';
import type { Session } from '@supabase/supabase-js';

type AppSessionPayloadType = OAuthSessionPayload & {
  user?: UserSchema;
  iat?: number;
  exp?: number;
};

/**
 * @see SupabaseSessionGuardInterface
 */
@injectable()
export class SupabaseSessionGuardService implements SupabaseSessionGuardInterface {
  protected readonly oauthSession: OAuthSessionService;

  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(SupabaseRepo) protected supabaseRepo: SupabaseRepo<unknown>,
    @inject(I.Logger) protected logger: LoggerInterface
  ) {
    this.oauthSession = new OAuthSessionService(config);
  }

  /**
   * @override
   */
  public async ensureForCurrentUser(): Promise<void> {
    const payload =
      (await this.oauthSession.getSession()) as AppSessionPayloadType | null;
    const appUserId = payload?.user?.id;
    if (payload == null || typeof appUserId !== 'string' || !appUserId) {
      return;
    }

    const live = await this.readCookieSession(appUserId);
    if (live != null) {
      await this.persistIfRotated(payload, live);
      return;
    }

    const recovered = await this.recoverWithAppToken(payload, appUserId);
    await this.persistIfRotated(payload, recovered);
  }

  /**
   * @override
   */
  public async resolveLiveRefreshToken(
    appUserId: string,
    fallback: string
  ): Promise<string> {
    const live = await this.readCookieSession(appUserId);
    return live?.refresh_token?.trim() || fallback;
  }

  /**
   * Read the request cookie Supabase session. `@supabase/ssr` may refresh and
   * rewrite cookies when the access token is expired.
   */
  protected async readCookieSession(
    appUserId: string
  ): Promise<Session | null> {
    const supabase = await this.supabaseRepo.getSupabase();
    const { data, error } = await supabase.auth.getSession();
    const session = data.session;
    if (error != null || session == null) {
      return null;
    }
    if (!session.access_token || !session.refresh_token?.trim()) {
      return null;
    }
    if (this.readTokenSubject(session.access_token) !== appUserId) {
      return null;
    }
    if (session.expires_at != null && session.expires_at * 1000 <= Date.now()) {
      return null;
    }
    return session;
  }

  protected async recoverWithAppToken(
    payload: AppSessionPayloadType,
    appUserId: string
  ): Promise<Session> {
    const refreshToken = payload.providerRefreshToken?.trim();
    if (refreshToken) {
      const supabase = await this.supabaseRepo.getSupabase();
      const result = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });
      const session = result.data.session;
      if (
        result.error == null &&
        session != null &&
        this.readTokenSubject(session.access_token) === appUserId
      ) {
        return session;
      }
      this.logger.warn('Supabase session recovery failed', {
        userId: appUserId,
        code: result.error?.code ?? null
      });
    }

    await this.oauthSession.clearSession();
    throw new ExecutorError(API_NOT_AUTHORIZED, 'Supabase session expired');
  }

  /**
   * Write rotated tokens back so the app session and Supabase cookies stay
   * on the same generation.
   */
  protected async persistIfRotated(
    payload: AppSessionPayloadType,
    session: Session
  ): Promise<void> {
    const user = payload.user;
    if (user == null) {
      return;
    }
    if (
      payload.providerRefreshToken === session.refresh_token &&
      user.credential_token === session.access_token
    ) {
      return;
    }

    const { iat: _iat, exp: _exp, ...rest } = payload;
    await this.oauthSession.setSession({
      ...rest,
      user: { ...user, credential_token: session.access_token },
      providerRefreshToken: session.refresh_token
    } as OAuthSessionPayload);
  }

  protected readTokenSubject(accessToken: string): string | null {
    try {
      const decoded = jwt.decode(accessToken) as { sub?: unknown } | null;
      return typeof decoded?.sub === 'string' ? decoded.sub : null;
    } catch {
      return null;
    }
  }
}
