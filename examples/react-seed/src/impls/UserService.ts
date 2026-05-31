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
import { SeedOAuthClient } from './SeedOAuthClient';
import type { OAuthLoginResult } from './SeedOAuthClient';
import type { ReactSeedConfig } from './ReactSeedConfig';
import type { RouteServiceInterface } from '@/interfaces/RouteServiceInterface';
import type { UserServiceGateway } from '@qlover/corekit-bridge';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
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
      try {
        const parsed = JSON.parse(valueFromPrevious) as unknown;
        if (userCredentialSchema.safeParse(parsed).success) {
          return parsed as UserCredential;
        }
      } catch {
        /* legacy plain token string */
      }
      return { token: valueFromPrevious };
    }
  },
  set(_, value) {
    if (userCredentialSchema.safeParse(value).success) {
      const credential = value as UserCredential;
      return credential.refresh_token
        ? JSON.stringify(credential)
        : credential.token;
    }
  }
};

export class UserService extends BridgeUserService<
  UserSchema,
  UserCredential,
  UserGatewayConfig
> {
  private readonly oauthRevokeOnLogout: boolean;

  constructor(
    @inject(UserGateway)
    userGateway: UserServiceGateway<
      UserSchema,
      UserCredential,
      UserGatewayConfig
    >,
    @inject(RouteService) readonly routeService: RouteServiceInterface,
    @inject('Logger') logger: LoggerInterface,
    @inject(I.Config) config: SeedConfigInterface & ReactSeedConfig,
    @inject(SeedOAuthClient) private readonly oauthClient: SeedOAuthClient
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
    this.oauthRevokeOnLogout = config.oauthRevokeOnLogout ?? false;
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

    const credential = this.getCredential();
    if (!credential?.token) {
      return Promise.resolve(false);
    }

    if (this.oauthClient.isConfigured()) {
      return this.oauthClient
        .fetchUserInfo(credential.token, credential.refresh_token)
        .then((result: unknown) => {
          const loginResult = result as OAuthLoginResult;
          if (loginResult?.user && this.isUser(loginResult.user)) {
            this.getStore().success(
              loginResult.user,
              loginResult.credential ?? credential
            );
            return true;
          }
          return false;
        })
        .catch(() => false);
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

  /**
   * @override
   * Clears local app session; optionally revokes OAuth refresh token when configured.
   */
  public override async logout<R = void>(
    params?: unknown,
    config?: unknown
  ): Promise<R> {
    const credential = this.getCredential();

    if (this.oauthRevokeOnLogout) {
      try {
        await this.oauthClient.revokeToken(credential?.refresh_token);
      } catch {
        /* best-effort; local logout continues */
      }
    }

    try {
      return await super.logout<R>(params, config as UserGatewayConfig);
    } catch {
      this.getStore().reset();
      return undefined as R;
    } finally {
      this.getStore().setCredential(null);
    }
  }
}
