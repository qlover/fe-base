import { HttpMethods, RequestExecutor } from '@qlover/fe-corekit';
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
    _config?: UserGatewayConfig
  ): Promise<UserSchema | null> {
    throw new Error('Method not implemented.');
  }

  /**
   * @override
   */
  public async login(
    params: UserGatewayLoginData & LoginParams
  ): Promise<UserCredential> {
    const response = await this.client.request({
      url: '/user/login',
      method: HttpMethods.POST,
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
      url: '/user/register',
      method: HttpMethods.POST,
      data: params,
      encryptProps: 'password'
    });

    return response.data as UserSchema;
  }

  /**
   * @override
   */
  public async logout<R = void>(_params?: unknown): Promise<R> {
    await this.client.request({
      url: '/user/logout',
      method: HttpMethods.POST
    });

    return undefined as R;
  }
}
