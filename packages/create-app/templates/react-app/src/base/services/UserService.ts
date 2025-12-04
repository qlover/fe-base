import * as errKeys from '@config/Identifier/common/common.error';
import { IOCIdentifier } from '@config/IOCIdentifier';
import {
  GatewayBasePlguin,
  LoginService,
  RegisterService,
  UserInfoService,
  UserServiceConfig,
  type UserServiceGateway
} from '@qlover/corekit-bridge';
import { type SyncStorageInterface } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { UserApi } from '@/base/apis/userApi/UserApi';
import type {
  UserInfo,
  UserCredential,
  RegisterFormData
} from '@/base/apis/userApi/UserApiType';
import { AppError } from '@/base/cases/AppError';
import { AppConfig } from '../cases/AppConfig';
import { RouteServiceInterface } from '../port/RouteServiceInterface';
import { UserServiceInterface } from '../port/UserServiceInterface';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class UserService extends UserServiceInterface {
  constructor(
    @inject(IOCIdentifier.RouteServiceInterface)
    protected routerService: RouteServiceInterface,
    @inject(UserApi)
    userApi: UserServiceGateway<UserCredential, UserInfo>,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt)
    storage: SyncStorageInterface<string, string>,
    @inject(IOCIdentifier.Logger)
    logger: LoggerInterface
  ) {
    const options: UserServiceConfig<UserCredential, UserInfo> = {
      gateway: userApi,
      logger: logger
    };

    const loginService = new LoginService('LoginService', {
      ...options,
      storage: storage,
      storageKey: appConfig.userTokenStorageKey
    });

    const userService = new UserInfoService('UserInfoService', options);
    const registerService = new RegisterService('RegisterService', options);

    super('UserService', loginService, userService, registerService);

    this.init();
  }

  override getToken(): string | null {
    return this.getStore().getResult()?.token ?? null;
  }

  init(): void {
    this.use(new GatewayBasePlguin());
    // restore login state
    this.getStore().restore();
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

    // if (userToken) {
    //   this.store.authSuccess();
    // }

    // await this.userInfo();
    // this.store.authSuccess();
  }

  override async logout<Params = unknown, Result = void>(
    _params?: Params
  ): Promise<Result> {
    await super.logout();

    this.routerService.reset();
    this.routerService.gotoLogin();

    return undefined as Result;
  }
}
