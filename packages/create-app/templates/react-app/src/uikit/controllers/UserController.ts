import { ExecutorPlugin } from '@qlover/fe-utils';
import { FeController } from '@lib/fe-react-controller';
import { FeApiGetUserInfo, FeApiLogin } from '@/base/apis/feApi/FeApiType';
import { RouterController } from './RouterController';
import { Thread } from '@/uikit/utils/thread';
import { inject, injectable } from 'inversify';
import { UserToken } from '@/base/cases/UserToken';
import { IOCIdentifier } from '@/core/IOC';
import { LoginInterface } from '@/base/port/LoginInterface';
import { ApiCatchPlugin } from '@/base/cases/apisPlugins/ApiCatchPlugin';
import { UserApi } from '@/base/apis/userApi/UserApi';

class UserControllerState {
  success: boolean = false;
  userInfo: FeApiGetUserInfo['response']['data'] = {
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
      throw new Error('User not logged in');
    }

    const userInfo = await this.userApi.getUserInfo();

    if (ApiCatchPlugin.is(userInfo.data)) {
      throw new Error('User login failed');
    }

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
    params: FeApiLogin['request']
  ): Promise<FeApiGetUserInfo['response']['data']> {
    const result = await this.userApi.login(params);

    if (ApiCatchPlugin.is(result.data)) {
      throw new Error('Login failed');
    }

    this.userToken.setToken(result.data.token);

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
