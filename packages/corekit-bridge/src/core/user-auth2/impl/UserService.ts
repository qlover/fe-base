import { AsyncStore, AsyncStoreStatus } from '../../store-state';
import { LoginInterface, LoginParams } from '../interface/base/LoginInterface';
import { RegisterInterface } from '../interface/base/RegisterInterface';
import { UserInfoInterface } from '../interface/base/UserInfoInterface';
import { LoginServiceInterface } from '../interface/LoginServiceInterface';
import { RegisterServiceInterface } from '../interface/RegisterServiceInterface';
import { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';
import { GatewayService, GatewayServiceOptions } from './GatewayService';

export interface UserServiceGateway<Credential, User>
  extends LoginInterface<Credential>,
    RegisterInterface<User>,
    UserInfoInterface<User> {}

export interface UserServiceInterface<Credential, User>
  extends UserServiceGateway<Credential, User> {
  getStore(): AsyncStore<Credential, string>;

  getUserInfoStore(): AsyncStore<User, string>;

  isAuthenticated(): boolean;
}

/**
 * UserServiceConfig is the configuration for the UserService
 *
 * - getStore() will return the loginService's store instance
 * - getUserInfoStore() will return the userInfoService's store instance
 */
export interface UserServiceConfig<Credential, User>
  extends Omit<
    GatewayServiceOptions<Credential, UserServiceGateway<Credential, User>>,
    'store'
  > {
  loginService: LoginServiceInterface<
    Credential,
    AsyncStore<Credential, string>
  >;
  userInfoService: UserInfoServiceInterface<User, AsyncStore<User, string>>;
  registerService: RegisterServiceInterface<User, AsyncStore<User, string>>;
}

export class UserService<Credential, User>
  extends GatewayService<
    Credential,
    UserServiceGateway<Credential, User>,
    AsyncStore<Credential, string>
  >
  implements UserServiceInterface<Credential, User>
{
  constructor(
    serviceName: string,
    protected readonly loginService: LoginServiceInterface<
      Credential,
      AsyncStore<Credential, string>
    >,
    protected readonly userInfoService: UserInfoServiceInterface<
      User,
      AsyncStore<User, string>
    >,
    protected readonly registerService: RegisterServiceInterface<
      User,
      AsyncStore<User, string>
    >,
    config: Partial<UserServiceConfig<Credential, User>>
  ) {
    super(serviceName, config);
  }

  /**
   * Get the user info store
   * @override
   */
  getUserInfoStore(): AsyncStore<User, string> {
    return this.userInfoService.getStore();
  }

  /**
   * Get the user from the user info service
   * @override
   */
  getUser(): User | null {
    return this.userInfoService.getUser();
  }

  /**
   * Logout the user
   * @override
   */
  logout<LogoutParams, LogoutResult = void>(
    params?: LogoutParams
  ): Promise<LogoutResult> {
    return this.loginService.logout(params);
  }

  /**
   * Refresh the user info
   * @override
   */
  refreshUserInfo<Params>(params?: Params | undefined): Promise<User | null> {
    return this.userInfoService.refreshUserInfo(params);
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
  register<Params>(params: Params): Promise<User | null> {
    return this.registerService.register(params);
  }

  /**
   * Get the user info
   * @override
   */
  getUserInfo<Params>(params: Params): Promise<User | null> {
    return this.userInfoService.getUserInfo(params);
  }

  /**
   * Check if the user is authenticated
   * @override
   */
  isAuthenticated(): boolean {
    const loginStore = this.getStore();
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
