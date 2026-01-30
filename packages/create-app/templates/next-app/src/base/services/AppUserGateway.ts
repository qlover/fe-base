import { HttpMethods, RequestExecutor } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type {
  UserApiLoginTransaction,
  UserApiLogoutTransaction,
  UserApiRegisterTransaction
} from '@/base/port/AppUserApiInterface';
import { UserCredential, UserSchema } from '@migrations/schema/UserSchema';
import {
  AppApiConfig,
  AppApiRequester,
  AppApiRequesterContext
} from './AppApiRequester';
import { UserServiceGatewayInterface } from '../port/UserServiceInterface';
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
  ): Promise<UserSchema | null> {
    throw new Error('Method not implemented.');
  }
  /**
   * @override
   */
  public refreshUserInfo(
    _params?: unknown,
    _config?: {} | undefined
  ): Promise<UserSchema | null> {
    throw new Error('Method not implemented.');
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
