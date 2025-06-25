import type { ExecutorPlugin } from '@qlover/fe-corekit';
import type {
  UserApiGetUserInfoTransaction,
  UserApiLoginTransaction
} from '@/base/apis/userApi/UserApiType';
import { RouteService } from './RouteService';
import {
  StoreInterface,
  StoreStateInterface,
  type StorageTokenInterface
} from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { IOCIdentifier } from '@/core/IOC';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { AppError } from '@/base/cases/AppError';
import * as errKeys from '@config/Identifier/error';

export type UserServiceUserInfo =
  UserApiGetUserInfoTransaction['response']['data'];

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

class UserServiceState implements StoreStateInterface {
  success: boolean = false;
  userInfo: UserServiceUserInfo = {
    name: '',
    email: '',
    picture: ''
  };
}

@injectable()
export class UserService
  extends StoreInterface<UserServiceState>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  constructor(
    @inject(UserApi) private userApi: UserApi,
    @inject(RouteService) private routerService: RouteService,
    @inject(IOCIdentifier.FeApiToken)
    private userToken: StorageTokenInterface<string>
  ) {
    super(() => new UserServiceState());
  }

  selector = {
    success: (state: UserServiceState) => state.success
  };

  /**
   * @override
   */
  async onBefore(): Promise<void> {
    if (this.isAuthenticated()) {
      return;
    }

    const userToken = this.userToken.getToken();

    if (!userToken) {
      throw new AppError(errKeys.LOCAL_NO_USER_TOKEN);
    }

    const userInfo = await this.userApi.getUserInfo();

    this.emit({
      success: true,
      userInfo: userInfo.data
    });
  }

  onSuccess(): void | Promise<void> {
    if (this.isAuthenticated()) {
      this.emit({ ...this.state, success: true });
    } else {
      this.logout();
    }
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

    this.emit({
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
    this.routerService.reset();
    this.routerService.gotoLogin();
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
