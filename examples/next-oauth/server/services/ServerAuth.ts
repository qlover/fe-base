import { ExecutorError } from '@qlover/fe-corekit';
import { cookies } from 'next/headers';
import { inject, injectable } from '@shared/container';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthProviderInterface } from '@server/interfaces/OAuthProviderInterface';
import type { ServerAuthInterface } from '../interfaces/ServerAuthInterface';

@injectable()
export class ServerAuth implements ServerAuthInterface {
  constructor(
    @inject(I.OAuthProviderInterface)
    protected oauthProvider: OAuthProviderInterface,
    @inject(I.AppConfig) protected config: SeedServerConfigInterface
  ) {}

  /**
   * @override
   * Session is established by {@link OAuthAppSessionService.setSession} during provider login.
   */
  public async setAuth(_credential_token: string): Promise<void> {
    // no-op: n_oauth_wrapper__session is the single source of truth
  }

  /**
   * @override
   */
  public async hasAuth(): Promise<boolean> {
    return !!(await this.getUser());
  }

  /**
   * @override
   */
  public async getAuth(): Promise<string> {
    const user = await this.oauthProvider.getUser();
    return user?.credential_token ?? '';
  }

  /**
   * @override
   */
  public async clear(): Promise<void> {
    await this.oauthProvider.clearSession();

    const legacyKey = this.config.userTokenKey;
    if (legacyKey) {
      const cookieStore = await cookies();
      cookieStore.delete(legacyKey);
    }
  }

  /**
   * @override
   */
  public async throwIfNotAuth(): Promise<void> {
    if (!(await this.hasAuth())) {
      throw new ExecutorError(API_NOT_AUTHORIZED, 'Not authorized');
    }
  }

  /**
   * @override
   */
  public async getUser(): Promise<UserSchema | null> {
    const user = await this.oauthProvider.getUser();
    if (!user) {
      return null;
    }

    return user;
  }
}
