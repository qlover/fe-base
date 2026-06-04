import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type {
  OAuthAuthorizationCallbackResult,
  OAuthProviderInterface
} from '@server/interfaces/OAuthProviderInterface';
import { ResultCotnext } from '@server/utils/NextApiHandler';
import type { LoggerInterface } from '@qlover/logger';

export type VerifyLoginParams = {
  email: string;
  password: string;
};

/**
 * Demo app login: provider credentials → session cookie → persisted provider tokens.
 */
@injectable()
export class OAuthService {
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  @inject(I.AppConfig)
  protected config!: SeedServerConfigInterface;

  constructor(
    @inject(I.OAuthProviderInterface)
    protected oauthProvider: OAuthProviderInterface
  ) {}

  public async getUser(): Promise<UserSchema | null> {
    return this.oauthProvider.getUser();
  }
  public async verifyLogin(params: VerifyLoginParams): Promise<UserSchema> {
    return this.oauthProvider.verifyLogin(params);
  }

  public async resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<ResultCotnext> {
    const result = await this.oauthProvider.authorizePKCE(rawQuery);

    return {
      redirectUrl: result.redirectAuthorizeUrl
    };
  }

  public async authorizePKCECallback(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<OAuthAuthorizationCallbackResult> {
    const result = await this.oauthProvider.authorizePKCECallback(rawQuery);

    return result;
  }
}
