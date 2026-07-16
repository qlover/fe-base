import { OAuthClient, OAuthUserInfo } from '@qlover/oauth-wrapper/client';
import {
  UserCredential,
  UserRole,
  UserSchema
} from '@/interfaces/schema/UserSchema';
import { I } from '@config/ioc-identifier';
import { routerPrefix } from '@config/seed.config';
import { inject, injectable } from './Container';
import type { ReactSeedConfig } from './ReactSeedConfig';
import type { LoggerInterface } from '@qlover/logger';

export type OAuthSeedUser = Omit<UserSchema, 'password'>;

export type OAuthLoginResult = {
  user: OAuthSeedUser;
  credential: UserCredential;
};

export function mapOAuthUserToSeed(
  userinfo: OAuthUserInfo,
  accessToken: string,
  refreshToken?: string
): OAuthLoginResult {
  const now = new Date().toISOString();
  return {
    user: {
      id: userinfo.sub,
      role: UserRole.USER,
      email: userinfo.email,
      credential_token: accessToken,
      created_at: now,
      updated_at: null,
      email_confirmed_at: Math.floor(Date.now() / 1000)
    },
    credential: {
      token: accessToken,
      ...(refreshToken ? { refresh_token: refreshToken } : {})
    }
  } as OAuthLoginResult;
}

@injectable()
export class SeedOAuthClient extends OAuthClient {
  constructor(
    @inject(I.Config) config: ReactSeedConfig,
    @inject(I.Logger) logger: LoggerInterface
  ) {
    super({
      serviceName: 'SeedOAuthClient',
      logger,
      config: {
        serverUrl: config.oauthWrapperURL,
        clientId: config.oauthWrapperClientId,
        scope: config.oauthWrapperScope,
        redirectPath: config.oauthWrapperRedirectPath,
        routerPrefix
      },
      mapUser: mapOAuthUserToSeed
    });
  }

  /**
   * @override
   */
  public isConfigured(): boolean {
    return false;
  }
}
