import { inject, injectable } from '@shared/container';
import type {
  OAuthUserAdapterInterface,
  OAuthWrapperRepositoryInterface
} from '@shared/oauth-wrapper';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { TokenEncryption } from '@server/utils/TokenEncryption';
import { DemoOAuthRepository } from '../repository/DemoOAuthRepository';
import { OAuthAppSessionService } from '../session/OAuthAppSessionService';
import type {
  DemoAuthServiceInterface,
  DemoVerifyLoginParams,
  DemoVerifyLoginResult
} from './DemoAuthServiceInterface';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Demo app login: provider credentials → session cookie → persisted provider tokens.
 */
@injectable()
export class DemoAuthService implements DemoAuthServiceInterface {
  protected tokenEncryption: TokenEncryption;

  @inject(I.Logger)
  protected logger!: LoggerInterface;

  constructor(
    @inject(OAuthAppSessionService)
    protected appSession: OAuthAppSessionService,
    @inject(I.OAuthUserAdapterInterface)
    protected userAdapter: OAuthUserAdapterInterface,
    @inject(DemoOAuthRepository)
    protected credentialsRepo: OAuthWrapperRepositoryInterface,
    @inject(I.AppConfig) config: SeedServerConfigInterface
  ) {
    this.tokenEncryption = new TokenEncryption(config.encryptionKey);
  }

  /**
   * @override
   */
  public async verifyLogin(
    params: DemoVerifyLoginParams
  ): Promise<DemoVerifyLoginResult> {
    const credentials = await this.userAdapter.login(
      params.email,
      params.password
    );

    this.logger.debug('User provider login successful', credentials);

    const sessionToken = credentials.token;
    if (!sessionToken) {
      throw new Error('User provider login did not return a session token');
    }

    const access = await this.userAdapter.exchangeAccessToken({
      token: sessionToken
    });

    const userInfo = await this.userAdapter.getUserInfo(sessionToken);
    const userId = Number(userInfo.id);
    if (!Number.isFinite(userId)) {
      throw new Error('User provider id is missing from profile');
    }

    const profileEmail = userInfo.email ?? params.email;
    const nameFromParts = [userInfo.first_name, userInfo.last_name]
      .filter(Boolean)
      .join(' ');
    const profileName = userInfo.name ?? (nameFromParts || profileEmail);

    await this.appSession.setSession({
      userId,
      email: profileEmail,
      name: profileName,
      providerSessionToken: sessionToken
    });

    await this.credentialsRepo.upsertUserCredentials(userId, {
      provider_session_token: sessionToken,
      provider_refresh_token: access.refresh_token
        ? this.tokenEncryption.encrypt(access.refresh_token)
        : null
    });

    return { userId, email: profileEmail, name: profileName };
  }
}
