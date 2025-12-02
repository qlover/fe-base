import { LoggerInterface } from '@qlover/logger';
import {
  AsyncStore,
  AsyncStoreStatus,
  CreateAsyncStoreType
} from '../../store-state';
import { LoginInterface, LoginParams } from '../interface/base/LoginInterface';
import { RegisterInterface } from '../interface/base/RegisterInterface';
import { UserInfoInterface } from '../interface/base/UserInfoInterface';
import { LoginServiceInterface } from '../interface/LoginServiceInterface';
import { RegisterServiceInterface } from '../interface/RegisterServiceInterface';
import { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';
import { BaseGatewayService } from './BaseGatewayService';
import { mergeUserServiceConfig } from './mergeUserServiceConfig';

export interface UserServiceGateway<Credential, User>
  extends LoginInterface<Credential>,
    RegisterInterface<User>,
    UserInfoInterface<User> {}

export interface UserServiceInterface<Credential, User>
  extends UserServiceGateway<Credential, User> {
  getUserInfoStore(): AsyncStore<User, string>;

  isAuthenticated(): boolean;
}

export interface UserServiceConfig<Credential, User> {
  logger?: LoggerInterface;
  gateway: UserServiceGateway<Credential, User>;
  loginService: LoginServiceInterface<
    Credential,
    AsyncStore<Credential, string>
  >;
  userInfoService: UserInfoServiceInterface<User, AsyncStore<User, string>>;
  registerService: RegisterServiceInterface<User, AsyncStore<User, string>>;

  loginStore?: CreateAsyncStoreType<Credential, string>;

  userInfoStore?: CreateAsyncStoreType<User, string>;
}

export class UserService<Credential, User>
  extends BaseGatewayService<
    Credential,
    UserServiceGateway<Credential, User>,
    AsyncStore<Credential, string>
  >
  implements UserServiceInterface<Credential, User>
{
  protected config: UserServiceConfig<Credential, User>;

  constructor(
    serviceName: string,
    config?: Partial<UserServiceConfig<Credential, User>>
  ) {
    const mergedConfig = mergeUserServiceConfig(config);

    super(serviceName, {
      gateway: mergedConfig.gateway,
      store: mergedConfig.loginService.getStore(),
      logger: mergedConfig.logger
    });

    this.config = mergedConfig;
  }

  getUserInfoStore(): AsyncStore<User, string> {
    return this.config.userInfoService.getStore();
  }

  /**
   * Get the user from the user info service
   * @override
   */
  getUser(): User | null {
    return this.config.userInfoService.getUser();
  }

  /**
   * Logout the user
   * @override
   */
  logout<LogoutParams, LogoutResult = void>(
    params?: LogoutParams
  ): Promise<LogoutResult> {
    return this.config.loginService.logout(params);
  }
  /**
   * Refresh the user info
   * @override
   */
  refreshUserInfo<Params>(params?: Params | undefined): Promise<User | null> {
    return this.config.userInfoService.refreshUserInfo(params);
  }

  /**
   * Login the user
   * @override
   */
  login<Params extends LoginParams>(
    params: Params
  ): Promise<Credential | null> {
    return this.loginService.login(params);
  }

  /**
   * Register the user
   * @override
   */
  register(params: RegisterParams): Promise<User> {
    return this.registerService.register(params);
  }

  /**
   * Get the user info
   * @override
   */
  getUserInfo(params: UserInfoParams): Promise<User> {
    return this.userInfoService.getUserInfo(params);
  }

  isAuthenticated(): boolean {
    const loginStore = this.getLoginStore();
    const userInfoStore = this.getUserInfoStore();
    return (
      // check loading status
      !loginStore.getLoading() &&
      !userInfoStore.getLoading() &&
      // check status
      loginStore.getStatus() === AsyncStoreStatus.SUCCESS &&
      userInfoStore.getStatus() === AsyncStoreStatus.SUCCESS &&
      // check result
      loginStore.getResult() !== null &&
      userInfoStore.getResult() !== null
    );
  }
}
