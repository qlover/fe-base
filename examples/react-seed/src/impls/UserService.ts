import { I } from '@config/ioc-identifier';
import { UserService as BridgeUserService } from '@qlover/corekit-bridge';
import { CookieStorage } from '@qlover/corekit-bridge';
import { StorageExecutor } from '@qlover/fe-corekit';
import { isString } from 'lodash-es';
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
import type { SeedConfigInterface } from '@/interfaces/SeedConfigInterface';
import type { UserServiceGateway } from '@qlover/corekit-bridge';
import type { StorageExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

// TODO:
export type UserGatewayConfig = {
  [key: string]: unknown;
};

const userStoragePlugin: StorageExecutorPlugin<
  string,
  UserCredential,
  unknown
> = {
  get(_, valueFromPrevious) {
    if (isString(valueFromPrevious)) {
      return { token: valueFromPrevious };
    }
  },
  set(_, value) {
    if (userCredentialSchema.safeParse(value).success) {
      return (value as UserCredential).token;
    }
  }
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
    @inject(RouteService) readonly routeService: RouteServiceInterface,
    @inject('Logger') logger: LoggerInterface,
    @inject(I.Config) config: SeedConfigInterface
  ) {
    super(userGateway, {
      logger: logger,
      store: {
        storageKey: config.userCredentialKey,
        storage: new StorageExecutor<string, UserSchema | UserCredential>([
          userStoragePlugin,
          new CookieStorage()
        ])
      }
    });
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

    return this.getUserInfo().then((result) => {
      if (result && this.isUser(result)) {
        this.getStore().success(result, {
          token: result.credential_token
        });

        return true;
      }

      return false;
    });
  }
}
