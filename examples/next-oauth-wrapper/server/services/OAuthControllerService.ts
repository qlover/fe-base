import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import { TokenEncryption } from '@server/utils/TokenEncryption';
import type { LoggerInterface } from '@qlover/logger';

export type VerifyLoginParams = {
  email: string;
  password: string;
};

export type VerifyLoginResult = {
  userId: number;
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
    const adapter = this.oauthProvider.getOAuthAdapter();
    const credentials = await adapter.login(params.email, params.password);

    this.logger.debug('User provider login successful', credentials);

    const sessionToken = credentials.token;
    if (!sessionToken) {
      throw new Error('User provider login did not return a session token');
    }

    const access = await adapter.exchangeAccessToken({
      token: sessionToken
    });

    const userInfo = await adapter.getUserInfo(sessionToken);
    const userId = Number(userInfo.id);
    if (!Number.isFinite(userId)) {
      throw new Error('User provider id is missing from profile');
    }

    const profileEmail = userInfo.email ?? params.email;
    const nameFromParts = [userInfo.first_name, userInfo.last_name]
      .filter(Boolean)
      .join(' ');
    const profileName = userInfo.name ?? (nameFromParts || profileEmail);

    await this.oauthProvider.getOAuthSession().setSession({
      userId,
      email: profileEmail,
      name: profileName,
      providerSessionToken: sessionToken
    });

    await this.oauthProvider.getOAuthRepo().upsertUserCredentials(userId, {
      provider_session_token: sessionToken,
      provider_refresh_token: access.refresh_token
        ? this.tokenEncryption.encrypt(access.refresh_token)
        : null
    });

    return { userId, email: profileEmail, name: profileName };
  }
}
