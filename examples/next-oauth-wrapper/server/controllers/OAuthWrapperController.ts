import { ExecutorError } from '@qlover/fe-corekit';
import { injectable, inject } from '@shared/container';
import type {
  OAuthAuthorizePageData,
  OAuthAuthorizeValidationError,
  OAuthConsentResult,
  OAuthServiceInterface,
  OAuthSessionInterface,
  OAuthTokenRequest,
  OAuthUserAdapterInterface,
  OAuthWrapperRepositoryInterface
} from '@shared/oauth-wrapper';
import {
  OAuthWrapperService,
  OAuthTokenService,
  OAuthTokenResponse,
  OAuthUserInfoResponse
} from '@shared/oauth-wrapper';
import { LoginValidator } from '@shared/validators/LoginValidator';
import type { ValidatorInterface } from '@shared/validators/ValidatorInterface';
import { API_OAUTH_WRAPPER_AUTH_FAILED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { LoginSchema } from '@schemas/LoginSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import {
  DemoAuthService,
  DemoOAuthRepository,
  OAuthAppSessionPayload,
  OAuthAppSessionService,
  type DemoAuthServiceInterface,
  type DemoVerifyLoginResult
} from '@server/demo-oauth';
import { TokenEncryption } from '@server/utils/TokenEncryption';

@injectable()
export class OAuthWrapperController {
  protected oauthService: OAuthServiceInterface;
  constructor(
    @inject(I.AppConfig) config: SeedServerConfigInterface,
    @inject(I.OAuthUserAdapterInterface)
    userAdapter: OAuthUserAdapterInterface,
    @inject(OAuthAppSessionService)
    appSession: OAuthSessionInterface<OAuthAppSessionPayload>,
    @inject(DemoOAuthRepository)
    oauthRepo: OAuthWrapperRepositoryInterface,
    @inject(LoginValidator)
    protected loginValidator: ValidatorInterface<LoginSchema>,
    @inject(DemoAuthService)
    protected demoAuthService: DemoAuthServiceInterface
  ) {
    this.oauthService = new OAuthWrapperService(
      appSession,
      userAdapter,
      new OAuthTokenService(
        new TokenEncryption(config.encryptionKey),
        userAdapter,
        oauthRepo
      ),
      oauthRepo
    );
  }

  public getService(): OAuthServiceInterface {
    return this.oauthService;
  }

  /**
   * Validates credentials and performs demo provider login via service layer.
   */
  public async verifyLogin(
    requestBody: unknown
  ): Promise<DemoVerifyLoginResult> {
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
    return this.oauthService.resolveAuthorizePage(rawQuery);
  }

  public async submitConsent(
    requestBody: unknown
  ): Promise<OAuthConsentResult> {
    return await this.oauthService.processConsent(requestBody);
  }

  public async exchangeToken(
    fields: Record<string, string> | OAuthTokenRequest
  ): Promise<OAuthTokenResponse> {
    return await this.oauthService.exchangeToken(fields);
  }

  public async getUserInfo(
    accessToken: string
  ): Promise<OAuthUserInfoResponse> {
    return await this.oauthService.getUserInfo(accessToken);
  }
}
