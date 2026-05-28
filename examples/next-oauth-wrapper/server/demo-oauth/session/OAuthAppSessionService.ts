import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import {
  OAUTH_APP_SESSION_COOKIE,
  parseOAuthAppSessionCookie,
  type OAuthAppSessionPayload
} from './demoProxySession';

export type { OAuthAppSessionPayload };

/**
 * HttpOnly session cookie for authenticated users during OAuth authorize.
 */
@injectable()
export class OAuthAppSessionService {
  constructor(
    @inject(I.AppConfig) protected config: SeedServerConfigInterface
  ) {}

  public async setSession(payload: OAuthAppSessionPayload): Promise<void> {
    const secret = this.requireSecret();
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    const cookieStore = await cookies();
    cookieStore.set(OAUTH_APP_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
  }

  public async hasSession(): Promise<boolean> {
    return (await this.getSession()) != null;
  }

  public async getSession(): Promise<OAuthAppSessionPayload | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(OAUTH_APP_SESSION_COOKIE)?.value;
    return parseOAuthAppSessionCookie(raw, this.requireSecret());
  }

  public async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(OAUTH_APP_SESSION_COOKIE);
  }

  protected requireSecret(): string {
    if (!this.config.sessionSecret) {
      throw new Error('SESSION_SECRET is required for Next OAuth Wrapper session');
    }
    return this.config.sessionSecret;
  }
}
