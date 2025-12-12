import { UserService as CorekitBridgeUserService } from '@qlover/corekit-bridge';
import { injectable, inject } from 'inversify';
import { isObject, isString } from 'lodash';
import {
  userSchema,
  type UserCredential,
  type UserSchema
} from '@migrations/schema/UserSchema';
import { UserServiceApi } from '../cases/UserServiceApi';
import type { UserServiceInterface } from '../port/UserServiceInterface';
import type { UserServiceGateway } from '@qlover/corekit-bridge';

@injectable()
export class UserService
  extends CorekitBridgeUserService<UserSchema, UserCredential>
  implements UserServiceInterface
{
  constructor(
    @inject(UserServiceApi)
    userApi: UserServiceGateway<UserSchema, UserCredential>
  ) {
    super({
      gateway: userApi
      // next-js ssr 将 credential 存储在 cookie 中无需存储用户信息到本地
      // store: {
      //   storageKey: appConfig.userInfoKey,
      //   credentialStorageKey: appConfig.userTokenKey,
      //   persistUserInfo: true,
      // }
    });
  }

  public getToken(): string {
    return this.store.getCredential()?.credential_token ?? '';
  }

  public isUserInfo(value: unknown): value is UserSchema {
    return userSchema.safeParse(value).success;
  }

  public isUserCredential(value: unknown): value is UserCredential {
    return (
      isObject(value) &&
      'credential_token' in value &&
      isString(value.credential_token)
    );
  }
}
