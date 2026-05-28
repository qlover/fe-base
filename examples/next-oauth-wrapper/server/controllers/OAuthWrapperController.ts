import { ExecutorError } from '@qlover/fe-corekit';
import { injectable, inject } from '@shared/container';
import type {
  OAuthAuthorizePageData,
  OAuthAuthorizeValidationError,
  OAuthConsentResult,
  OAuthTokenRequest
} from '@shared/oauth-wrapper';
import {
  OAuthTokenResponse,
  OAuthUserInfoResponse
} from '@shared/oauth-wrapper';
import { LoginValidator } from '@shared/validators/LoginValidator';
import type { ValidatorInterface } from '@shared/validators/ValidatorInterface';
import { API_OAUTH_WRAPPER_AUTH_FAILED } from '@config/i18n-identifier/api';
import { LoginSchema } from '@schemas/LoginSchema';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import {
  OAuthControllerService,
  VerifyLoginResult
} from '@server/services/OAuthControllerService';
import { I } from '@config/ioc-identifiter';

@injectable()
export class OAuthWrapperController {
  constructor(
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginSchema>,
    @inject(I.OAuthWrapperProviderInterface)
    protected oauthProvider: OAuthWrapperProviderInterface,
    @inject(OAuthControllerService)
    protected demoAuthService: OAuthControllerService
  ) {}

  /**
   * Validates credentials and performs demo provider login via service layer.
   */
  public async verifyLogin(requestBody: unknown): Promise<VerifyLoginResult> {
    const body = await this.loginValidator.getThrow(requestBody);

    try {
      return await this.demoAuthService.verifyLogin({
        email: body.email,
        password: body.password
      });
    } catch (err) {
      throw new ExecutorError(
        API_OAUTH_WRAPPER_AUTH_FAILED,
        err instanceof Error ? err.message : 'Login failed'
      );
    }
  }

  public resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<
    | { ok: true; data: OAuthAuthorizePageData }
    | { ok: false; error: OAuthAuthorizeValidationError }
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

  public async getUserInfo(
    accessToken: string
  ): Promise<OAuthUserInfoResponse> {
    return await this.oauthProvider.getUserInfo(accessToken);
  }
}
