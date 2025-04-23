import { ExecutorPlugin } from '@qlover/fe-corekit';
import type {
  UserApiGetUserInfoTransaction,
  UserApiLoginTransaction
} from '@/base/apis/userApi/UserApiType';
import { RouterController } from './RouterController';
import { ThreadUtil, type StorageTokenInterface } from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { IOCIdentifier } from '@/core/IOC';
import { LoginInterface } from '@/base/port/LoginInterface';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { AppError } from '@/base/cases/appError/AppError';
import { LOCAL_NO_USER_TOKEN } from '@config/ErrorIdentifier';
import { SliceStore } from '@qlover/slice-store-react';

class UserControllerState {
  success: boolean = false;
  userInfo: UserApiGetUserInfoTransaction['response']['data'] = {
    name: '',
    email: '',
    picture: ''
  };
}

@injectable()
export class UserController
  extends SliceStore<UserControllerState>
  implements ExecutorPlugin, LoginInterface
{
  readonly pluginName = 'UserController';

  constructor(
    @inject(UserApi) private userApi: UserApi,
    @inject(RouterController) private routerController: RouterController,
    @inject(IOCIdentifier.FeApiToken)
    private userToken: StorageTokenInterface<string>
  ) {
    super(() => new UserControllerState());
  }

  setState(state: Partial<UserControllerState>): void {
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
