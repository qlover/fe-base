import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import { TokenEncryption } from '@server/utils/TokenEncryption';
import type { LoggerInterface } from '@qlover/logger';
import type { ResolveAuthorizePageResult } from '@qlover/oauth-wrapper';

export type VerifyLoginParams = {
  email: string;
  password: string;
};

export type VerifyLoginResult = {
  userId: string;
  email: string;
  name: string;
};

/**
 * Demo app login: provider credentials → session cookie → persisted provider tokens.
 */
@injectable()
export class OAuthControllerService {
  protected tokenEncryption: TokenEncryption;

  @inject(I.Logger)
  protected logger!: LoggerInterface;

  @inject(I.AppConfig)
  protected config!: SeedServerConfigInterface;

  constructor(
    @inject(I.OAuthWrapperProviderInterface)
    protected oauthProvider: OAuthWrapperProviderInterface,
    @inject(I.AppConfig) config: SeedServerConfigInterface
  ) {
    this.tokenEncryption = new TokenEncryption(config.encryptionKey);
  }

  public async verifyLogin(
    params: VerifyLoginParams
  ): Promise<VerifyLoginResult> {
    return await this.oauthProvider.login(params);
  }

  public async resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<ResolveAuthorizePageResult> {
    const result = await this.oauthProvider.resolveAuthorizePage(rawQuery);

    return result;
  }

  public async getUser(): Promise<UserSchema | null> {
    return this.oauthProvider.getUserSchema();
  }

  public async clearSession(): Promise<void> {
    return this.oauthProvider.clearSession();
  }
}
