import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { parseOAuthAppSessionCookie } from '@server/utils/OAuthWrapperProxy';
import type {
  OAuthSessionInterface,
  OAuthSessionPayload
} from '@qlover/oauth-wrapper';

/**
 * HttpOnly session cookie for authenticated users during OAuth authorize.
 */
@injectable()
export class OAuthSessionService implements OAuthSessionInterface<OAuthSessionPayload> {
  constructor(
    @inject(I.AppConfig) protected config: SeedServerConfigInterface
  ) {}

  /**
   * @override
   */
  public async setSession(payload: OAuthSessionPayload): Promise<void> {
    const secret = this.requireSecret();
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    const cookieStore = await cookies();
    cookieStore.set(this.config.oauthSessionKey, token, {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
  }

  /**
   * @override
   */
  public async hasSession(): Promise<boolean> {
    return (await this.getSession()) != null;
  }

  /**
   * @override
   */
  public async getSession(): Promise<OAuthSessionPayload | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(this.config.oauthSessionKey)?.value;
    return parseOAuthAppSessionCookie(raw, this.requireSecret());
  }

  /**
   * @override
   */
  public async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.config.oauthSessionKey);
  }

  protected requireSecret(): string {
    if (!this.config.sessionSecret) {
      throw new Error(
        'SESSION_SECRET is required for Next OAuth Wrapper session'
      );
    }
    return this.config.sessionSecret;
  }
}
