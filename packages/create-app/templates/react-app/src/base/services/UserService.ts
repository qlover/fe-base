import { ExecutorPlugin, type SyncStorageInterface } from '@qlover/fe-corekit';
import type {
  UserApiGetUserInfoTransaction,
  UserApiLoginTransaction
} from '@/base/apis/userApi/UserApiType';
import { RouteService } from './RouteService';
import {
  LoginResponseData,
  type UserAuthApiInterface,
  UserAuthService,
  UserAuthStore
} from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { AppError } from '@/base/cases/AppError';
import * as errKeys from '@config/Identifier/common.error';
import { IOCIdentifier } from '@/core/IOC';
import { AppConfig } from '../cases/AppConfig';

export type UserServiceUserInfo =
  UserApiGetUserInfoTransaction['response']['data'];

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

@injectable()
export class UserService
  extends UserAuthService<UserServiceUserInfo>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  constructor(
    @inject(RouteService) protected routerService: RouteService,
    @inject(UserApi) userApi: UserAuthApiInterface<UserServiceUserInfo>,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt)
    storage: SyncStorageInterface<string, string>
  ) {
    super({
      api: userApi,
      userStorage: {
        key: appConfig.userInfoStorageKey,
        storage: storage
      },
      credentialStorage: {
        key: appConfig.userTokenStorageKey,
        storage: storage
      }
    });

    // FIXME:
    // load credential from storage
    // this.store.setCredential(this.store.getCredentialStorage()?.get() ?? '');
  }

  /**
   * @override
   */
  override get store(): UserAuthStore<UserServiceUserInfo> {
    return super.store as UserAuthStore<UserServiceUserInfo>;
  }

  getToken(): string | null {
    return this.store.getCredential();
  }

  /**
   * @override
   */
  async onBefore(): Promise<void> {
    if (this.isAuthenticated()) {
      return;
    }

    const userToken = this.getToken();

    if (!userToken) {
      throw new AppError(errKeys.LOCAL_NO_USER_TOKEN);
    }

    if (userToken) {
      this.store.authSuccess();
    }

    await this.userInfo();
    this.store.authSuccess();
  }

  /**
   * @override
   */
  onSuccess(): void {
    // if (this.isAuthenticated()) {
    //   this.store.authSuccess();
    // } else {
    //   this.logout();
    // }
  }

  /**
   * @override
   */
  override async logout(): Promise<void> {
    await super.logout();

    this.routerService.reset();
    this.routerService.gotoLogin();
  }

  async register(params: RegisterFormData): Promise<LoginResponseData> {
    const response = (await this.api.register(
      params
    )) as UserApiLoginTransaction['response'];

    if (response.data?.token) {
      try {
        await this.userInfo({ token: response.data?.token });
        this.store.authSuccess();
      } catch (error) {
        this.store.authFailed(error);
      }
    }

    throw new AppError(errKeys.LOCAL_NO_USER_TOKEN);
  }
}
