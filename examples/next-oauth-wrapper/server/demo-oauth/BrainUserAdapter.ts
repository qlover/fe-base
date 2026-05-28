import {
  BrainUserGateway,
  createAdapter,
  defaultBrainUserOptions,
  GATEWAY_BRAIN_USERLY_ENDPOINTS
} from '@brain-toolkit/brain-user';
import { inject, injectable } from '@shared/container';
import type {
  OAuthProviderAccessToken,
  OAuthUserAdapterInterface,
  OAuthUserCredentials,
  OAuthUserProfile
} from '@shared/oauth-wrapper';
import { ProxyFetchAdapter } from '../adapters/ProxyFetchAdapter';
import { OAuthWrapperConfig } from './oauthWrapperConfig';
import {
  extractBrainSessionToken,
  formatBrainLoginError
} from './utils/brainLoginResponse';

/**
 * Demo reference provider: Brain User API (`@brain-toolkit/brain-user`).
 */
@injectable()
export class BrainUserAdapter implements OAuthUserAdapterInterface {
  protected gateway: BrainUserGateway;

  constructor(@inject(OAuthWrapperConfig) oauthWrapperConfig: OAuthWrapperConfig) {
    const { endpoints: _defaultEndpoints, ...providerFetchDefaults } =
      defaultBrainUserOptions;

    const adapter = createAdapter(
      new ProxyFetchAdapter({
        ...providerFetchDefaults,
        baseURL: oauthWrapperConfig.oauthWrapperApiBase,
        timeout: oauthWrapperConfig.oauthWrapperApiTimeout,
        endpoints: {
          login: 'POST /auth/token.json',
          register: 'POST /users/signup.json',
          getUserInfo: 'GET /users/me.json',
          loginWithGoogle: 'POST /auth/google/imagica/token',
          logout: 'POST /users/signout',
          accessToken: GATEWAY_BRAIN_USERLY_ENDPOINTS.accessToken
        }
      })
    );
    this.gateway = new BrainUserGateway(adapter);
  }

  public async login(
    email: string,
    password: string
  ): Promise<OAuthUserCredentials> {
    const result = await this.gateway.login({ email, password });
    const token = extractBrainSessionToken(result);
    if (!token) {
      throw new Error(formatBrainLoginError(result));
    }
    return { ...result, token };
  }

  public async exchangeAccessToken(params: {
    token: string;
    lang?: string;
  }): Promise<OAuthProviderAccessToken> {
    const access = await this.gateway.getAccessToken({
      token: params.token,
      lang: params.lang ?? 'en'
    });
    return { ...access };
  }

  public async getUserInfo(token: string): Promise<OAuthUserProfile> {
    const profile = await this.gateway.getUserInfo({ token });
    return { ...profile };
  }

  public async getUserInfoByAccessToken(
    accessToken: string
  ): Promise<OAuthUserProfile> {
    const profile = await this.gateway.getUserInfo(
      { token: accessToken },
      { tokenPrefix: 'Bearer' }
    );
    return { ...profile };
  }
}
