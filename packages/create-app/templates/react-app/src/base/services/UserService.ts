import { I } from '@config/IOCIdentifier';
import {
  UserService as CorekitBridgeUserService,
  GatewayExecutor
} from '@qlover/corekit-bridge';
import { inject, injectable } from 'inversify';
import { isObject, isString } from 'lodash';
import { UserApi } from '@/base/apis/userApi/UserApi';
import type { UserInfo, UserCredential } from '@/base/apis/userApi/UserApiType';
import { AppConfig } from '../cases/AppConfig';
import { UserServiceInterface } from '../port/UserServiceInterface';
import type { UserServiceGateway } from '@qlover/corekit-bridge';
import type { SyncStorageInterface } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class UserService
  extends CorekitBridgeUserService<UserInfo, UserCredential>
  implements UserServiceInterface
{
  constructor(
    @inject(UserApi)
    userApi: UserServiceGateway<UserInfo, UserCredential>,
    @inject(I.AppConfig) appConfig: AppConfig,
    @inject(I.LocalStorageEncrypt)
    storage: SyncStorageInterface<string>,
    @inject(I.Logger)
    logger: LoggerInterface
  ) {
    super({
      executor: new GatewayExecutor(),
      gateway: userApi,
      logger: logger,
      store: {
        storageKey: appConfig.userInfoStorageKey,
        credentialStorageKey: appConfig.userTokenStorageKey,
        // Not production environment persists user information, for testing and development
        persistUserInfo: !appConfig.isProduction,
        storage: storage
      }
    });
  }

  /**
   * @override
   * @returns
   */
  getToken(): string {
    return this.getCredential()?.token ?? '';
  }

  isUserInfo(value: unknown): value is UserInfo {
    return (
      isObject(value) &&
      'name' in value &&
      isString(value.name) &&
      'email' in value &&
      isString(value.email) &&
      'picture' in value &&
      isString(value.picture)
    );
  }

  isUserCredential(value: unknown): value is UserCredential {
    return isObject(value) && 'token' in value && isString(value.token);
  }

  override isAuthenticated(): boolean {
    if (!super.isAuthenticated()) {
      return false;
    }

    if (!this.isUserInfo(this.getUser())) {
      return false;
    }

    if (!this.isUserCredential(this.getCredential())) {
      return false;
    }

    return true;
  }
}
