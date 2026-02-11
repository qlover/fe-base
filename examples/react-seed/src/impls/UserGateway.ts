import { toEndpointObject } from '@config/endpoints/_endpoint';
import {
  EP_USER_INFO,
  EP_USER_LOGIN,
  EP_USER_LOGOUT,
  EP_USER_REGISTER
} from '@config/endpoints/user';
import { RequestExecutor } from '@qlover/fe-corekit';
import { isUndefined, omitBy } from 'lodash-es';
import { inject, injectable } from '@/impls/Container';
import { AppApiRequester } from './AppApiRequester';
import type { AppApiConfig, AppApiRequesterContext } from './AppApiRequester';
import type { UserGatewayConfig } from './UserService';
import type { UserGatewayLoginData } from '@/interfaces/schema/UserGateway';
import type {
  UserCredential,
  UserSchema
} from '@/interfaces/schema/UserSchema';
import type { LoginParams, UserServiceGateway } from '@qlover/corekit-bridge';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class UserGateway implements UserServiceGateway<
  UserSchema,
  UserCredential,
  UserGatewayConfig
> {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestExecutor<AppApiConfig, AppApiRequesterContext>
  ) {}

  /**
   * @override
   */
  public async getUserInfo(
    data?: UserCredential,
    config?: AppApiConfig
  ): Promise<UserSchema | null> {
    const response = await this.client.request(
      // 去掉值为 undeinfed 的属性,这样在扩展值的时候不会用undefined覆盖默认值,比如这里的data.token
      omitBy(
        {
          ...toEndpointObject(EP_USER_INFO),
          token: data?.token,
          encryptProps: 'password',
          ...config
        },
        isUndefined
      )
    );

    return response.data as UserSchema;
  }
  /**
   * @override
   */
  public refreshUserInfo(
    data?: UserCredential,
    config?: UserGatewayConfig
  ): Promise<UserSchema | null> {
    return this.getUserInfo(data, config);
  }

  /**
   * @override
   */
  public async login(
    params: UserGatewayLoginData & LoginParams
  ): Promise<UserCredential> {
    const response = await this.client.request({
      ...toEndpointObject(EP_USER_LOGIN),
      data: params,
      encryptProps: 'password'
    });

    return response.data as UserCredential;
  }

  /**
   * @override
   */
  public async register(params: UserGatewayLoginData): Promise<UserSchema> {
    const response = await this.client.request({
      ...toEndpointObject(EP_USER_REGISTER),
      data: params,
      encryptProps: 'password'
    });

    return response.data as UserSchema;
  }

  /**
   * @override
   */
  public async logout<R = void>(_params?: unknown): Promise<R> {
    await this.client.request(toEndpointObject(EP_USER_LOGOUT));

    return undefined as R;
  }
}
