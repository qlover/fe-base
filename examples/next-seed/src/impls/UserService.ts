import { UserService as CorekitBridgeUserService } from '@qlover/corekit-bridge';
import { isObject, isString } from 'lodash';
import { inject, injectable } from '@shared/container';
import { API_REFRESH_USER_INFO_FAILED } from '@config/i18n-identifier/api';
import {
  userSchema,
  type UserCredential,
  type UserSchema
} from '@schemas/UserSchema';
import type {
  UserServiceGatewayInterface,
  UserServiceInterface
} from '@interfaces/UserServiceInterface';
import { AppUserGateway } from './AppUserGateway';
import type { AppApiConfig } from './appApi/AppApiRequester';
import type {
  SliceStoreAdapter,
  UserStateInterface
} from '@qlover/corekit-bridge';

@injectable()
export class UserService
  extends CorekitBridgeUserService<UserSchema, UserCredential>
  implements UserServiceInterface
{
  constructor(
    @inject(AppUserGateway)
    userApi: UserServiceGatewayInterface
  ) {
    super(userApi, {
      pullUserWithLogin: false
    });
  }

  /**
   * @override
   */
  public override get gateway(): UserServiceGatewayInterface {
    return super.gateway as UserServiceGatewayInterface;
  }

  /**
   * @override
   */
  public getToken(): string {
    return this.getStore().getCredential()?.credential_token ?? '';
  }

  /**
   * Get the UI store instance
   *
   * UserStore 默认使用 SliceStoreAdapter 实现，所以需要返回 SliceStoreAdapter 实例
   *
   * 如果需要使用其他实现，可以重写这个方法
   *
   * @returns The UI store instance
   */
  public getUIStore(): SliceStoreAdapter<
    UserStateInterface<UserSchema, UserCredential>
  > {
    return this.getStore().getStore() as SliceStoreAdapter<
      UserStateInterface<UserSchema, UserCredential>
    >;
  }

  /**
   * @override
   */
  public isUser(value: unknown): value is UserSchema {
    return userSchema.safeParse(value).success;
  }

  /**
   * @override
   */
  public isCredential(value: unknown): value is UserCredential {
    return (
      isObject(value) &&
      'credential_token' in value &&
      isString(value.credential_token)
    );
  }

  public refreshUser(params?: AppApiConfig): Promise<boolean> {
    // TODO: 验证是否有 token 有才进行刷新

    if (this.isAuthenticated()) {
      return Promise.resolve(true);
    }

    this.getStore().start();

    return this.refreshUserInfo(null, params)
      .then((result) => {
        if (result && this.isUser(result)) {
          this.getStore().success(result, {
            credential_token: result.credential_token
          });

          return true;
        }

        this.getStore().failed(API_REFRESH_USER_INFO_FAILED);
        return false;
      })
      .catch((error) => {
        this.getStore().failed(error);
        return false;
      });
  }
}
