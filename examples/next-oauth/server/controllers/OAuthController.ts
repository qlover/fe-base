import { Base64Serializer, ExecutorError } from '@qlover/fe-corekit';
import {
  OAuthTokenResponse,
  OAuthUserInfoResponse
} from '@qlover/oauth-wrapper';
import { injectable, inject } from '@shared/container';
import { StringEncryptor } from '@shared/StringEncryptor';
import { LoginValidator } from '@shared/validators/LoginValidator';
import type { ValidatorInterface } from '@shared/validators/ValidatorInterface';
import { I } from '@config/ioc-identifiter';
import { LoginSchema } from '@schemas/LoginSchema';
import { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type {
  OAuthAuthorizationCallbackResult,
  OAuthProviderInterface
} from '@server/interfaces/OAuthProviderInterface';
import { ServerConfig } from '@server/ServerConfig';
import { OAuthService } from '@server/services/OAuthService';
import { ResultCotnext } from '@server/utils/NextApiHandler';
import type {
  OAuthConsentResult,
  OAuthTokenRequest
} from '@qlover/oauth-wrapper';

@injectable()
export class OAuthController {
  protected stringEncryptor: StringEncryptor;

  constructor(
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginSchema>,
    @inject(I.OAuthProviderInterface)
    protected oauthProvider: OAuthProviderInterface,
    @inject(OAuthService)
    protected oauthService: OAuthService,
    @inject(ServerConfig) serverConfig: SeedServerConfigInterface,
    @inject(Base64Serializer) base64Serializer: Base64Serializer
  ) {
    this.stringEncryptor = new StringEncryptor(
      serverConfig.stringEncryptorKey,
      base64Serializer
    );
  }

  /**
   * Validates credentials and performs demo provider login via service layer.
   */
  public async verifyLogin(requestBody: unknown): Promise<UserSchema> {
    try {
      if ((requestBody as LoginSchema).password) {
        (requestBody as LoginSchema).password = this.stringEncryptor.decrypt(
          (requestBody as LoginSchema).password
        );
      }
    } catch {
      throw new ExecutorError(
        'encrypt_password_failed',
        'Encrypt password failed'
      );
    }
    const body = await this.loginValidator.getThrow(requestBody);

    return await this.oauthService.verifyLogin(body);
  }

  public resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<ResultCotnext> {
    return this.oauthService.resolveAuthorizePage(rawQuery);
  }

  public async authorizePKCECallback(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<OAuthAuthorizationCallbackResult> {
    return this.oauthService.authorizePKCECallback(rawQuery);
  }

  public async submitConsent(
    requestBody: unknown
  ): Promise<OAuthConsentResult> {
    return await this.oauthProvider.processConsent(requestBody);
  }

  public async exchangeToken(
    fields: Record<string, string> | OAuthTokenRequest
  ): Promise<OAuthTokenResponse> {
    return await this.oauthProvider.exchangeToken(fields);
  }

  public async revokeToken(fields: Record<string, string>): Promise<void> {
    return await this.oauthProvider.revokeToken(fields);
  }

  public async getUserInfo(
    accessToken: string
  ): Promise<OAuthUserInfoResponse> {
    return await this.oauthProvider.getUserInfo(accessToken);
  }

  public hasNeedLogged(): boolean {
    return this.oauthProvider.hasNeedLogged();
  }
}
