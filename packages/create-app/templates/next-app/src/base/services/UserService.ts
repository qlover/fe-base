import { UserService as CorekitBridgeUserService } from '@qlover/corekit-bridge';
import { injectable, inject } from 'inversify';
import { isObject, isString } from 'lodash';
import {
  userSchema,
  type UserCredential,
  type UserSchema
} from '@migrations/schema/UserSchema';
import { AppUserGateway } from './AppUserGateway';
import type {
  UserServiceGatewayInterface,
  UserServiceInterface
} from '../port/UserServiceInterface';
import type {
  StoreInterface,
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
    super(userApi);
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

  public getUIStore(): StoreInterface<
    UserStateInterface<UserSchema, UserCredential>
  > {
    return this.getStore().getStore();
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
}
