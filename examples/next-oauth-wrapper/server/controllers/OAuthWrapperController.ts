import { Base64Serializer, ExecutorError } from '@qlover/fe-corekit';
import {
  OAuthTokenResponse,
  OAuthUserInfoResponse
} from '@qlover/oauth-wrapper';
import { injectable, inject } from '@shared/container';
import { StringEncryptor } from '@shared/StringEncryptor';
import { LoginValidator } from '@shared/validators/LoginValidator';
import type { ValidatorInterface } from '@shared/validators/ValidatorInterface';
import { API_OAUTH_WRAPPER_AUTH_FAILED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { LoginSchema } from '@schemas/LoginSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import { ServerConfig } from '@server/ServerConfig';
import {
  OAuthControllerService,
  VerifyLoginResult
} from '@server/services/OAuthControllerService';
import type {
  OAuthAuthorizePageData,
  OAuthAuthorizeValidationError,
  OAuthConsentResult,
  OAuthTokenRequest
} from '@qlover/oauth-wrapper';

@injectable()
export class OAuthWrapperController {
  protected stringEncryptor: StringEncryptor;

  constructor(
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginSchema>,
    @inject(I.OAuthWrapperProviderInterface)
    protected oauthProvider: OAuthWrapperProviderInterface,
    @inject(OAuthControllerService)
    protected oauthService: OAuthControllerService,
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
  public async verifyLogin(requestBody: unknown): Promise<VerifyLoginResult> {
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

    try {
      return await this.oauthService.verifyLogin({
        email: body.email,
        password: body.password
      });
    } catch (err) {
      if (err instanceof ExecutorError) {
        throw err;
      }

      throw new ExecutorError(API_OAUTH_WRAPPER_AUTH_FAILED, err);
    }
  }

  public resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<
    | { ok: true; data: OAuthAuthorizePageData }
    | { ok: false; error: OAuthAuthorizeValidationError; redirectUrl?: string }
  > {
    return this.oauthProvider.resolveAuthorizePage(rawQuery);
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
    return await this.oauthProvider.getUserInfoWithAccessToken(accessToken);
  }

  public hasNeedLogged(): boolean {
    return this.oauthProvider.hasNeedLogged();
  }
}
