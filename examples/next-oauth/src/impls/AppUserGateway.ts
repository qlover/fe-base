import { HttpMethods, RequestExecutor } from '@qlover/fe-corekit';
import { SignOtpResult, SignWithOtpParams } from '@qlover/oauth-wrapper';
import { inject, injectable } from '@shared/container';
import { LoginProviderType } from '@config/common';
import * as apiRoutes from '@config/route';
import { UserCredential, UserSchema } from '@schemas/UserSchema';
import { AppApiResult } from '@interfaces/AppApiInterface';
import type {
  UserApiLoginTransaction,
  UserApiLogoutTransaction,
  UserApiRegisterTransaction,
  UserSubmitOAuthConsentTransaction
} from '@interfaces/AppUserApiInterface';
import {
  LoginProviderResult,
  UserServiceGatewayInterface
} from '@interfaces/UserServiceInterface';
import {
  AppApiConfig,
  AppApiRequester,
  AppApiRequesterContext
} from './appApi/AppApiRequester';
import type { GatewayResult, LoginParams } from '@qlover/corekit-bridge';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class AppUserGateway implements UserServiceGatewayInterface {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestExecutor<AppApiConfig, AppApiRequesterContext>
  ) {}

  /**
   * @override
   */
  public getUserInfo(
    _params?: unknown,
    _config?: unknown
  ): Promise<GatewayResult<UserSchema>> {
    throw new Error('Method not implemented.');
  }
  /**
   * @override
   */
  public async refreshUserInfo(
    _params?: unknown,
    _config?: {} | undefined
  ): Promise<GatewayResult<UserSchema>> {
    const response = await this.client.request<
      UserApiLoginTransaction['response'],
      UserApiLoginTransaction['request']
    >({
      ..._config,
      url: apiRoutes.API_USER_SESSION,
      method: HttpMethods.GET
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      data: response.data.data as UserSchema,
      error: null
    };
  }

  /**
   * @override
   */
  public async login(
    params: UserApiLoginTransaction['data'] & LoginParams,
    url?: string
  ): Promise<GatewayResult<UserCredential>> {
    const response = await this.client.request<
      UserApiLoginTransaction['response'],
      UserApiLoginTransaction['request']
    >({
      url: url ?? apiRoutes.API_USER_LOGIN,
      method: HttpMethods.POST,
      data: params,
      encryptProps: 'password'
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      data: response.data.data as UserSchema,
      error: null
    };
  }

  /**
   * @override
   */
  public async register(
    params: UserApiRegisterTransaction['data']
  ): Promise<GatewayResult<UserSchema>> {
    const response = await this.client.request<
      UserApiRegisterTransaction['response'],
      UserApiRegisterTransaction['request']
    >({
      url: apiRoutes.API_USER_REGISTER,
      method: HttpMethods.POST,
      data: params,
      encryptProps: 'password'
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      data: response.data.data as UserSchema,
      error: null
    };
  }

  /**
   * @override
   */
  public async logout<R = void>(_params?: unknown): Promise<R> {
    await this.client.request<
      UserApiLogoutTransaction['response'],
      UserApiLogoutTransaction['request']
    >({
      url: apiRoutes.API_USER_LOGOUT,
      method: HttpMethods.POST
    });

    return undefined as R;
  }

  /**
   * @override
   */
  public async verify(
    params: UserApiLoginTransaction['data'] & LoginParams
  ): Promise<GatewayResult<UserCredential>> {
    return this.login(params, apiRoutes.API_OAUTH_VERIFY);
  }

  /**
   * @override
   */
  public async submitOAuthConsent(
    payload: UserSubmitOAuthConsentTransaction['request']
  ): Promise<string> {
    const response = await this.client.request<
      UserSubmitOAuthConsentTransaction['response'],
      UserSubmitOAuthConsentTransaction['request']
    >({
      url: apiRoutes.API_OAUTH_CONSENT,
      method: HttpMethods.POST,
      data: payload
    });

    if (!response.data.success) {
      throw new Error(response.data.message ?? 'Consent submission failed');
    }

    return response.data.data!.redirectUrl;
  }

  /**
   * Send OTP (step 1) — supports both phone and email
   * @override
   */
  public async sendOtp(params: SignWithOtpParams): Promise<SignOtpResult> {
    const response = await this.client.request<
      AppApiResult<SignOtpResult>,
      SignWithOtpParams
    >({
      url: apiRoutes.API_USER_OTP_LOGIN,
      method: HttpMethods.POST,
      data: params
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(
        (response.data.data as { message?: string }).message ??
          'Send OTP failed'
      );
    }

    return response.data.data;
  }

  /**
   * Verify OTP code (step 2) — supports both phone and email
   * @override
   */
  public async verifyOtp(
    params: { phone: string; token: string } | { email: string; token: string }
  ): Promise<SignOtpResult> {
    const response = await this.client.request<
      AppApiResult<SignOtpResult>,
      typeof params
    >({
      url: apiRoutes.API_USER_OTP_VERIFY,
      method: HttpMethods.POST,
      data: params
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(
        (response.data.data as { message?: string }).message ??
          'OTP verification failed'
      );
    }

    return response.data.data;
  }

  /**
   * @override
   */
  public async loginWithProvider(params: {
    provider: LoginProviderType;
  }): Promise<LoginProviderResult> {
    const response = await this.client.request<
      AppApiResult<LoginProviderResult>,
      { provider: LoginProviderType }
    >({
      url: apiRoutes.API_USER_LOGIN_PROVIDER,
      method: HttpMethods.GET,
      params: params
    });

    return response.data.data! as LoginProviderResult;
  }
}
