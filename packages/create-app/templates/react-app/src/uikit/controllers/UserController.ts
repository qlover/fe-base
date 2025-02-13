import { ExecutorPlugin } from '@qlover/fe-utils';
import { sleep } from '@/uikit/utils/thread';
import { FeController } from '@lib/fe-react-controller';
import { FeApi } from '@/base/apis/feApi';
import { FeApiGetUserInfo, FeApiLogin } from '@/base/apis/feApi/FeApiType';
import { RouterController } from './RouterController';
import { StorageTokenInterface } from '@/base/port/StorageTokenInterface';

export interface UserControllerState {
  success: boolean;
  userInfo: FeApiGetUserInfo['response']['data'];
}

export interface UserControllerOptions {
  userToken: StorageTokenInterface;
  feApi: FeApi;
  routerController: RouterController;
}

interface LoginInterface {
  login(
    params: FeApiLogin['request']
  ): Promise<FeApiGetUserInfo['response']['data']>;
  logout(): void;
}

function createDefaultState(
  options: UserControllerOptions
): UserControllerState {
  const { userToken } = options;
  const token = userToken.getToken();

  return {
    success: !!token,
    userInfo: {
      name: '',
      email: '',
      picture: ''
    }
  };
}

export class UserController
  extends FeController<UserControllerState>
  implements ExecutorPlugin, LoginInterface
{
  readonly pluginName = 'UserController';

  constructor(private options: UserControllerOptions) {
    super(() => createDefaultState(options));
  }

  /**
   * @override
   */
  async onBefore(): Promise<void> {
    await sleep(1000);

    if (!this.options.userToken.getToken()) {
      throw new Error('User not logged in');
    }

    const userInfo = await this.options.feApi.getUserInfo();

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

    this.options.routerController.gotoLogin();
  }

  /**
   * @override
   */
  async login(
    params: FeApiLogin['request']
  ): Promise<FeApiGetUserInfo['response']['data']> {
    const { feApi } = this.options;

    const result = await feApi.login(params);

    this.options.userToken.setToken(result.data.token);

    const userInfo = await feApi.getUserInfo();

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
    this.options.userToken.removeToken();
    super.reset();
  }

  isAuthenticated(): boolean {
    return this.state.success;
  }
}
