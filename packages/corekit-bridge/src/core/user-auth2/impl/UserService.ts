import { ExecutorPlugin } from '@qlover/fe-corekit';
import { AsyncStore } from '../../store-state';
import { LoginInterface, LoginParams } from '../interface/base/LoginInterface';
import { RegisterInterface } from '../interface/base/RegisterInterface';
import { UserInfoInterface } from '../interface/base/UserInfoInterface';
import { LoginServiceInterface } from '../interface/LoginServiceInterface';
import { RegisterServiceInterface } from '../interface/RegisterServiceInterface';
import { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';
import { GatewayExecutorOptions } from './GatewayExecutor';
import { GatewayService, GatewayServiceOptions } from './GatewayService';
import { ServiceActionType } from './ServiceAction';
import { GatewayBasePluginType } from './GatewayBasePlguin';

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
  > {}

export type UserServicePlugin<
  Credential,
  User,
  Actions extends readonly ServiceActionType[] = readonly ServiceActionType[]
> = ExecutorPlugin<
  GatewayExecutorOptions<
    unknown,
    Credential,
    UserServiceGateway<Credential, User>
  >
> &
  GatewayBasePluginType<
    Actions,
    unknown,
    Credential,
    UserServiceGateway<Credential, User>
  >;

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
    options?: Omit<
      GatewayServiceOptions<
        Credential,
        UserServiceGateway<Credential, User>,
        string
      >,
      'store'
    >
  ) {
    super(serviceName, options);
  }

  override use(
    plugin:
      | UserServicePlugin<Credential, User>
      | UserServicePlugin<Credential, User>[]
  ): this {
    return super.use(plugin);
  }

  /**
   * Get the user info store
   * @override
   */
  public getUserInfoStore(): AsyncStore<User, string> {
    return this.userInfoService.getStore();
  }

  /**
   * Get the user from the user info service
   * @override
   */
  public getUser(): User | null {
    return this.userInfoService.getUser();
  }

  /**
   * Logout the user
   * @override
   */
  public logout<LogoutParams, LogoutResult = void>(
    params?: LogoutParams
  ): Promise<LogoutResult> {
    return this.loginService.logout(params);
  }

  /**
   * Refresh the user info
   * @override
   */
  public refreshUserInfo<Params>(
    params?: Params | undefined
  ): Promise<User | null> {
    return this.userInfoService.refreshUserInfo(params);
  }

  /**
   * Login the user
   * @override
   */
  public login<Params extends LoginParams>(
    params: Params
  ): Promise<Credential | null> {
    return this.loginService.login(params);
  }

  /**
   * Register the user
   * @override
   */
  public register<Params>(params: Params): Promise<User | null> {
    return this.registerService.register(params);
  }

  /**
   * Get the user info
   * @override
   */
  public getUserInfo<Params>(params: Params): Promise<User | null> {
    return this.userInfoService.getUserInfo(params);
  }

  /**
   * Check if the user is authenticated
   * @override
   */
  public isAuthenticated(): boolean {
    const loginStore = this.getStore();
    const userInfoStore = this.getUserInfoStore();
    return (
      loginStore.isSuccess() &&
      userInfoStore.isSuccess() &&
      // check result
      loginStore.getResult() !== null &&
      userInfoStore.getResult() !== null
    );
  }
}
