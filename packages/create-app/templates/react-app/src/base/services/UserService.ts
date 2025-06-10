import { ExecutorPlugin } from '@qlover/fe-corekit';
import type {
  UserApiGetUserInfoTransaction,
  UserApiLoginTransaction
} from '@/base/apis/userApi/UserApiType';
import { RouteService } from './RouteService';
import { ThreadUtil, type StorageTokenInterface } from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { IOCIdentifier } from '@/core/IOC';
import { LoginInterface, RegisterFormData } from '@/base/port/LoginInterface';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { AppError } from '@/base/cases/AppError';
import { StoreInterface, StoreStateInterface } from '../port/StoreInterface';
import * as errKeys from '@config/Identifier/Error';

class UserServiceState implements StoreStateInterface {
  success: boolean = false;
  userInfo: UserApiGetUserInfoTransaction['response']['data'] = {
    name: '',
    email: '',
    picture: ''
  };
}

@injectable()
export class UserService
  extends StoreInterface<UserServiceState>
  implements ExecutorPlugin, LoginInterface
{
  readonly pluginName = 'UserService';

  constructor(
    @inject(UserApi) private userApi: UserApi,
    @inject(RouteService) private routerController: RouteService,
    @inject(IOCIdentifier.FeApiToken)
    private userToken: StorageTokenInterface<string>
  ) {
    super(() => new UserServiceState());
  }

  setState(state: Partial<UserServiceState>): void {
    this.emit({ ...this.state, ...state });
  }

  /**
   * @override
   */
  async onBefore(): Promise<void> {
    await ThreadUtil.sleep(1000);

    const userToken = this.userToken.getToken();

    if (!userToken) {
      throw new AppError(errKeys.LOCAL_NO_USER_TOKEN);
    }

    const userInfo = await this.userApi.getUserInfo();

    this.setState({
      success: true,
      userInfo: userInfo.data
    });
  }

  /**
   * @override
   */
  async onError(): Promise<void> {
    this.logout();

    this.routerController.gotoLogin();
  }

  /**
   * @override
   */
  async login(
    params: UserApiLoginTransaction['data']
  ): Promise<UserApiGetUserInfoTransaction['response']> {
    const response = await this.userApi.login(params);

    if (response.apiCatchResult) {
      throw response.apiCatchResult;
    }

    if (!response.data.token) {
      throw new AppError(errKeys.RES_NO_TOKEN);
    }

    this.userToken.setToken(response.data.token);

    const userInfo = await this.userApi.getUserInfo();

    this.setState({
      success: true,
      userInfo: userInfo.data
    });

    return userInfo;
  }

  /**
   * @override
   */
  logout(): void {
    this.reset();
  }

  /**
   * @override
   */
  reset(): void {
    this.userToken.removeToken();
    super.reset();
  }

  isAuthenticated(): boolean {
    return this.state.success;
  }

  /**
   * @override
   */
  async register(params: RegisterFormData): Promise<unknown> {
    return this.login({
      username: params.username,
      password: params.password
    });
  }
}
