import type { EncryptorInterface } from '@qlover/fe-corekit';
import { OAuthRfcCodes } from '../../core';
import { OAuthWrapperError } from '../utils/OAuthWrapperError';
import type * as Types from '../../core';
import {
  OAuthAbstractProvider,
  type OAuthUserAccessToken,
  type OAuthUserCredentials,
  type OAuthUserProfile
} from './OAuthAbstractProvider';
import { OAuthTokenService } from './OAuthTokenService';
import type { LoginParams } from '@qlover/corekit-bridge/core';

export type { OAuthUserAccessToken, OAuthUserCredentials, OAuthUserProfile };

export abstract class OAuthWrapperService<
  SessionPayload extends Types.OAuthSessionPayload = Types.OAuthSessionPayload
> extends OAuthAbstractProvider<SessionPayload> {
  protected tokenService: Types.OAuthTokenServiceInterface;

  constructor(
    protected oauthSession: Types.OAuthSessionInterface<SessionPayload>,
    tokenEncryption: EncryptorInterface<string, string>,
    protected oauthRepo: Types.OAuthWrapperRepositoryInterface
  ) {
    super();
    this.tokenService = new OAuthTokenService(
      tokenEncryption,
      (params) => this.providerExchangeAccessToken(params),
      oauthRepo
    );
  }

  protected abstract providerLogin(
    params: LoginParams
  ): Promise<OAuthUserCredentials>;

  protected abstract providerExchangeAccessToken(params: {
    token: string;
    lang?: string;
  }): Promise<OAuthUserAccessToken>;

  protected abstract providerGetUserInfo(
    sessionToken: string
  ): Promise<OAuthUserProfile>;

  protected abstract providerGetUserInfoByAccessToken(
    accessToken: string
  ): Promise<OAuthUserProfile>;

  /**
   * @override
   */
  public async login(params: LoginParams): Promise<SessionPayload> {
    const credentials = await this.providerLogin(params);

    const sessionToken = credentials.token;
    if (!sessionToken) {
      throw new Error('User provider login did not return a session token');
    }

    const userInfo = await this.providerGetUserInfo(sessionToken);

    const sessionPayload = this.generageSessionPayload({
      email: params.email,
      ...userInfo,
      sessionToken
    });

    this.oauthSession.setSession(sessionPayload);

    const oauthrepo = this.getOAuthRepo();
    await oauthrepo.upsertUserCredentials(sessionPayload.userId, {
      provider_session_token: sessionPayload.providerSessionToken
    });

    return sessionPayload;
  }

  /**
   * @override
   */
  public getOAuthRepo(): Types.OAuthWrapperRepositoryInterface {
    return this.oauthRepo;
  }

  /**
   * @override
   */
  public async exchangeToken(
    rawFields: Record<string, string>
  ): Promise<Types.OAuthTokenResponse> {
    return await this.tokenService.exchangeToken(rawFields);
  }

  /**
   * @override
   */
  public getSession(): Promise<SessionPayload | null> {
    return this.oauthSession.getSession();
  }

  /**
   * @override
   */
  public clearSession(): Promise<void> {
    return this.oauthSession.clearSession();
  }
  /**
   * @override
   */
  public async revokeToken(rawFields: Record<string, string>): Promise<void> {
    return await this.tokenService.revokeToken(rawFields);
  }

  public async logoutUser(userId: string): Promise<void> {
    await this.oauthRepo.revokeRefreshTokensByUserId(userId);
    await this.oauthRepo.upsertUserCredentials(userId, {
      provider_refresh_token: null,
      provider_session_token: null
    });
    await this.oauthSession.clearSession();
  }

  /**
   * @override
   */
  public async getUserInfoWithAccessToken(
    accessToken: string
  ): Promise<Types.OAuthUserInfoResponse> {
    try {
      const profile = await this.providerGetUserInfoByAccessToken(accessToken);
      return this.toUserInfoResponse(profile);
    } catch {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_TOKEN, 401);
    }
  }

  protected toUserInfoResponse(
    profile: OAuthUserProfile
  ): Types.OAuthUserInfoResponse {
    const sub = String(profile.id);
    if (!sub || sub === 'NaN') {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_TOKEN, 401);
    }

    const email = profile.email?.trim();
    if (!email) {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_TOKEN, 401);
    }

    const name = profile.name?.trim() || email;

    return {
      sub,
      email,
      name,
      ...(profile.roles?.length ? { roles: profile.roles } : {})
    };
  }
}
