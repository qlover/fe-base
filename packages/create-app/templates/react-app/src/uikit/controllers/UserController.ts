import { ExecutorPlugin } from '@qlover/fe-utils';
import { FeController } from '@lib/fe-react-controller';
import type {
  UserApiGetUserInfo,
  UserApiLogin
} from '@/base/apis/userApi/UserApiType';
import { RouterController } from './RouterController';
import { Thread } from '@/uikit/utils/thread';
import { inject, injectable } from 'inversify';
import { UserToken } from '@/base/cases/UserToken';
import { IOCIdentifier } from '@/core/IOC';
import { LoginInterface } from '@/base/port/LoginInterface';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { AppError } from '@/base/cases/appError/AppError';
import { LOCAL_NO_USER_TOKEN } from '@config/ErrorIdentifier';

class UserControllerState {
  success: boolean = false;
  userInfo: UserApiGetUserInfo['response']['data'] = {
    name: '',
    email: '',
    picture: ''
  };
}

@injectable()
export class UserController
  extends FeController<UserControllerState>
  implements ExecutorPlugin, LoginInterface
{
  readonly pluginName = 'UserController';

  constructor(
    @inject(UserApi) private userApi: UserApi,
    @inject(RouterController) private routerController: RouterController,
    @inject(IOCIdentifier.FeApiToken) private userToken: UserToken
  ) {
    super(() => new UserControllerState());
  }

  /**
   * @override
   */
  async onBefore(): Promise<void> {
    await Thread.sleep(1000);

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
    params: UserApiLogin['request']
  ): Promise<UserApiGetUserInfo['response']['data']> {
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

    return userInfo.data;
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
