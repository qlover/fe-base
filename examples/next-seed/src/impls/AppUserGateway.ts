import { HttpMethods, RequestExecutor } from '@qlover/fe-corekit';
import { inject, injectable } from '@shared/container';
import { UserCredential, UserSchema } from '@schemas/UserSchema';
import type {
  UserApiLoginTransaction,
  UserApiLogoutTransaction,
  UserApiRegisterTransaction
} from '@interfaces/AppUserApiInterface';
import { UserServiceGatewayInterface } from '@interfaces/UserServiceInterface';
import {
  AppApiConfig,
  AppApiRequester,
  AppApiRequesterContext
} from './appApi/AppApiRequester';
import type { LoginParams } from '@qlover/corekit-bridge';

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
  ): Promise<UserSchema> {
    throw new Error('Method not implemented.');
  }
  /**
   * @override
   */
  public async refreshUserInfo(
    _params?: unknown,
    _config?: {} | undefined
  ): Promise<UserSchema> {
    const response = await this.client.request<
      UserApiLoginTransaction['response'],
      UserApiLoginTransaction['request']
    >({
      ..._config,
      url: '/user/session',
      method: HttpMethods.GET
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data as UserSchema;
  }

  /**
   * @override
   */
  public async login(
    params: UserApiLoginTransaction['data'] & LoginParams
  ): Promise<UserCredential> {
    const response = await this.client.request<
      UserApiLoginTransaction['response'],
      UserApiLoginTransaction['request']
    >({
      url: '/user/login',
      method: HttpMethods.POST,
      data: params,
      encryptProps: 'password'
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data as UserCredential;
  }

  /**
   * @override
   */
  public async register(
    params: UserApiRegisterTransaction['data']
  ): Promise<UserSchema> {
    const response = await this.client.request<
      UserApiRegisterTransaction['response'],
      UserApiRegisterTransaction['request']
    >({
      url: '/user/register',
      method: HttpMethods.POST,
      data: params,
      encryptProps: 'password'
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data as UserSchema;
  }

  /**
   * @override
   */
  public async logout<R = void>(_params?: unknown): Promise<R> {
    await this.client.request<
      UserApiLogoutTransaction['response'],
      UserApiLogoutTransaction['request']
    >({
      url: '/user/logout',
      method: HttpMethods.POST
    });

    return undefined as R;
  }
}
