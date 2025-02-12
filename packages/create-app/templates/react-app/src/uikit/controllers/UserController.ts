import { ExecutorPlugin, JSONStorage } from '@qlover/fe-utils';
import { sleep } from '@/uikit/utils/thread';
import { FeController } from '@lib/fe-react-controller';
import { FeApi } from '@/base/apis/feApi';
import { FeApiGetUserInfo, FeApiLogin } from '@/base/apis/feApi/FeApiType';
import { adjustExpirationTime } from '@/uikit/utils/datetime';
import { RouterController } from './RouterController';

export interface UserControllerState {
  success: boolean;
  userInfo: FeApiGetUserInfo['response']['data'];
}

export interface UserControllerOptions {
  /**
   * @default `month`
   */
  expiresIn?: number | 'day' | 'week' | 'month' | 'year';
  storageKey: string;
  storage: JSONStorage;
  feApi: FeApi;
  routerController: RouterController;
}

interface LoginInterface {
  login(
    params: FeApiLogin['request']
  ): Promise<FeApiGetUserInfo['response']['data']>;
  logout(): void;
}

function restoreUserSession(options: UserControllerOptions): {
  state: UserControllerState;
  token: string;
} {
  const { storageKey, storage } = options;
  const token = storage.getItem(storageKey, '') as string;

  return {
    state: {
      success: !!token,
      userInfo: {
        name: '',
        email: '',
        picture: ''
      }
    },
    token
  };
}

export class UserController
  extends FeController<UserControllerState>
  implements ExecutorPlugin, LoginInterface
{
  readonly pluginName = 'UserController';

  private token = '';

  constructor(private options: UserControllerOptions) {
    const restoreSession = restoreUserSession(options);
    super(restoreSession.state);

    this.token = restoreSession.token;
  }

  selectorSuccess = (state: UserControllerState): boolean => state.success;

  /**
   * @override
   */
  async onBefore(): Promise<void> {
    await sleep(1000);

    if (!this.token) {
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

    this.setToken(result.data.token);

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

  setToken(token: string): void {
    this.token = token;

    const { storageKey, storage } = this.options;

    storage.setItem(
      storageKey,
      this.token,
      adjustExpirationTime(Date.now(), this.options.expiresIn ?? 'month')
    );
  }

  reset(): void {
    this.token = '';
    this.options.storage.removeItem(this.options.storageKey);
    this.setState({ success: false });
  }

  isAuthenticated(): boolean {
    return this.state.success;
  }
}
