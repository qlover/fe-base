import { ExecutorPlugin } from '@qlover/fe-corekit';
import type {
  UserApiGetUserInfoTransaction,
  UserApiLoginTransaction
} from '@/base/apis/userApi/UserApiType';
import { RouteService } from './RouteService';
import { ThreadUtil, type StorageTokenInterface } from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { IOCIdentifier } from '@/core/IOC';
import { LoginInterface } from '@/base/port/LoginInterface';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { AppError } from '@/base/cases/AppError';
import { LOCAL_NO_USER_TOKEN } from '@config/Identifier.Error';
import { SliceStore } from '@qlover/slice-store-react';

class UserServiceState {
  success: boolean = false;
  userInfo: UserApiGetUserInfoTransaction['response']['data'] = {
    name: '',
    email: '',
    picture: ''
  };
}

@injectable()
export class UserService
  extends SliceStore<UserServiceState>
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

    if (!this.userToken.getToken()) {
      throw new AppError(LOCAL_NO_USER_TOKEN);
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
}
