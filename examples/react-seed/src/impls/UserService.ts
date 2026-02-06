import { UserService as BridgeUserService } from '@qlover/corekit-bridge';
import {
  isWebUserSchema,
  UserCredential,
  userCredentialSchema,
  UserSchema
} from '@/interfaces/schema/UserSchema';
import { inject } from './Container';
import { RouteService } from './RouteService';
import { UserGateway } from './UserGateway';
import type { RouteServiceInterface } from '@/interfaces/RouteServiceInterface';
import type { UserServiceGateway } from '@qlover/corekit-bridge';

// TODO:
export type UserGatewayConfig = {
  [key: string]: unknown;
};

export class UserService extends BridgeUserService<
  UserSchema,
  UserCredential,
  UserGatewayConfig
> {
  constructor(
    @inject(UserGateway)
    userGateway: UserServiceGateway<
      UserSchema,
      UserCredential,
      UserGatewayConfig
    >,
    @inject(RouteService) readonly routeService: RouteServiceInterface
  ) {
    super(userGateway);
  }

  /**
   * @override
   * @param value
   * @returns
   */
  public isUser(value: unknown): value is UserSchema {
    return isWebUserSchema(value).success;
  }

  /**
   * @override
   * @param value
   * @returns
   */
  public isCredential(value: unknown): value is UserCredential {
    return userCredentialSchema.safeParse(value).success;
  }

  public refreshUser(): Promise<boolean> {
    if (this.isAuthenticated()) {
      return Promise.resolve(true);
    }

    return this.refreshUserInfo().then((result) => {
      if (this.isAuthenticated() && this.isUser(result)) {
        return true;
      }

      return false;
    });
  }
}
