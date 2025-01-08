import { ExecutorPlugin, JSONStorage } from '@qlover/fe-utils';
import { sleep } from '@/utils/thread';
import { FeController } from '@lib/fe-react-controller';
import { FeApi } from '@/services';
import { FeApiGetUserInfo, FeApiLogin } from '@/services/feApi/FeApiType';
import { adjustExpirationTime } from '@/utils/datetime';
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

export class UserController
  extends FeController<UserControllerState>
  implements ExecutorPlugin, LoginInterface
{
  readonly pluginName = 'UserController';

  private token = '';

  constructor(private options: UserControllerOptions) {
    super({
      success: false,
      userInfo: {
        name: '',
        email: '',
        picture: ''
      }
    });

    const { storageKey, storage } = this.options;

    this.token = storage.getItem(storageKey) || '';
  }

  get feApi(): FeApi {
    return this.options.feApi;
  }

  /**
   * @override
   */
  async onBefore(): Promise<void> {
    await sleep(1000);

    if (!this.token) {
      throw new Error('User not logged in');
    }

    const userInfo = await this.feApi.getUserInfo(this.token);

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
    const result = await this.feApi.login(params);
    this.token = result.data.token;

    const userInfo = await this.feApi.getUserInfo(this.token);

    this.setState({
      success: true,
      userInfo: userInfo.data
    });
    this.setToken(result.data.token);

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
