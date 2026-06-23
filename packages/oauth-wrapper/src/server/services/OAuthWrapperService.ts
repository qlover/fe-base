import { ExecutorError, type EncryptorInterface } from '@qlover/fe-corekit';
import {
  OAuthAuthorizeQuerySchema,
  OAuthConsentBodySchema,
  OAuthRfcCodes
} from '../../core';
import { OAuthWrapperError } from '../utils/OAuthWrapperError';
import type * as Types from '../../core';
import type { OAuthWrapperAccessToken } from './OAuthTokenService';
import { OAuthTokenService } from './OAuthTokenService';
import type { LoginParams } from '@qlover/corekit-bridge/core';
import {
  isRedirectUriAllowed,
  normalizeQuery,
  validatePkceParams
} from '../utils/authorizeUtil';
import {
  buildOAuthRedirectUrl,
  parseScopeList
} from '../utils/oauthRedirectUtils';
import { randomBytes } from 'node:crypto';

export abstract class OAuthWrapperService<
  User,
  SessionPayload extends Types.OAuthSessionPayload = Types.OAuthSessionPayload
> implements Types.OAuthProviderInterface<User, SessionPayload> {
  protected authCodeTTLMs: number = 5 * 60 * 1000;

  protected tokenService: Types.OAuthTokenServiceInterface;

  constructor(
    protected oauthSession: Types.OAuthSessionInterface<SessionPayload, User>,
    tokenEncryption: EncryptorInterface<string, string>,
    protected oauthRepo: Types.OAuthWrapperRepositoryInterface
  ) {
    this.tokenService = new OAuthTokenService(
      tokenEncryption,
      (params) => this.providerExchangeAccessToken(params as SessionPayload),
      oauthRepo
    );
  }

  protected abstract providerLogin(
    params: LoginParams
  ): Promise<Types.WithUserSession<SessionPayload, User>>;

  protected abstract providerExchangeAccessToken(
    params: SessionPayload
  ): Promise<OAuthWrapperAccessToken>;

  protected abstract providerGetUserInfo(sessionToken: string): Promise<User>;

  protected abstract providerGetUserInfoByAccessToken(
    accessToken: string
  ): Promise<User>;

  /**
   * @override
   */
  public abstract refreshUser(params?: {
    refresh_token: string;
  }): Promise<Types.WithUserSession<SessionPayload, User>>;

  /**
   * @override
   */
  public async login(params: LoginParams): Promise<SessionPayload> {
    const session = await this.providerLogin(params);

    const sessionToken = session.providerRefreshToken;
    if (!sessionToken) {
      throw new Error('User provider login did not return a session token');
    }

    const userInfo = await this.providerGetUserInfo(sessionToken);

    const sessionPayload = {
      ...session,
      user: {
        ...session.user,
        ...userInfo
      }
    };

    this.oauthSession.setSession(sessionPayload);

    const oauthrepo = this.getOAuthRepo();

    await oauthrepo.upsertUserCredentials(sessionPayload.userId, {
      provider_session_token: sessionPayload.providerRefreshToken
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
  public async getUserInfoWithAccessToken(accessToken: string): Promise<User> {
    try {
      const profile = await this.providerGetUserInfoByAccessToken(accessToken);

      return this.toUser(profile);
    } catch {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_TOKEN, 401);
    }
  }

  protected toUser(profile: unknown): User {
    return profile as User;
  }

  protected isQuery(query: unknown): query is Types.OAuthAuthorizeQuery {
    return OAuthAuthorizeQuerySchema.safeParse(query).success;
  }

  protected isValidateConsent(value: unknown): value is Types.OAuthConsentBody {
    return OAuthConsentBodySchema.safeParse(value).success;
  }

  /**
   * @override
   */
  public async logout(userId: string): Promise<void> {
    const oauthRepo = this.getOAuthRepo();
    await oauthRepo.revokeRefreshTokensByUserId(userId);
    await oauthRepo.upsertUserCredentials(userId, {
      provider_refresh_token: null,
      provider_session_token: null
    });
    await this.clearSession();
  }

  /**
   * @override
   */
  public async resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<
    | { ok: true; data: Types.OAuthAuthorizePageData }
    | { ok: false; error: Types.OAuthAuthorizeValidationError }
  > {
    const query = normalizeQuery(rawQuery);

    if (!this.isQuery(query)) {
      return {
        ok: false,
        error: {
          errorKey: OAuthRfcCodes.INVALID_REQUEST,
          message: 'Missing or invalid authorization request parameters.'
        }
      };
    }

    if (query.response_type !== 'code') {
      return {
        ok: false,
        error: {
          errorKey: OAuthRfcCodes.UNSUPPORTED_RESPONSE_TYPE,
          message: 'Only response_type=code is supported.'
        }
      };
    }
    const oauthRepo = this.getOAuthRepo();

    const client = await oauthRepo.findClientById(query.client_id);
    if (!client) {
      return {
        ok: false,
        error: {
          errorKey: OAuthRfcCodes.UNAUTHORIZED_CLIENT,
          message: 'Unknown client_id.'
        }
      };
    }

    if (!isRedirectUriAllowed(query.redirect_uri, client)) {
      return {
        ok: false,
        error: {
          errorKey: OAuthRfcCodes.UNAUTHORIZED_CLIENT,
          message: 'redirect_uri is not registered for this client.'
        }
      };
    }

    const requestedScopes = parseScopeList(query.scope);
    const invalidScope = requestedScopes.find(
      (scope) => !client.scopes.includes(scope)
    );
    if (invalidScope) {
      return {
        ok: false,
        error: {
          errorKey: OAuthRfcCodes.INVALID_SCOPE,
          message: `Scope "${invalidScope}" is not allowed for this client.`
        }
      };
    }

    const pkceError = validatePkceParams(query, client.confidential);
    if (pkceError) {
      return { ok: false, error: pkceError };
    }

    return {
      ok: true,
      data: {
        clientId: client.client_id,
        clientName: client.client_name,
        clientUri: client.client_uri ?? null,
        logoUri: client.logo_uri ?? null,
        redirectUri: query.redirect_uri,
        scopes: requestedScopes,
        state: query.state,
        responseType: 'code',
        codeChallenge: query.code_challenge,
        codeChallengeMethod: query.code_challenge_method,
        confidential: client.confidential
      }
    };
  }

  /**
   * @override
   */
  public async processConsent(
    requestBody: unknown
  ): Promise<Types.OAuthConsentResult> {
    if (!this.isValidateConsent(requestBody)) {
      throw new ExecutorError(
        OAuthRfcCodes.INVALID_REQUEST,
        'Invalid consent request body'
      );
    }

    const session = await this.getSession();
    if (!session) {
      throw new ExecutorError(
        OAuthRfcCodes.ACCESS_DENIED,
        'User session expired. Please sign in again.'
      );
    }

    const pageResult = await this.resolveAuthorizePage({
      response_type: 'code',
      client_id: requestBody.client_id,
      redirect_uri: requestBody.redirect_uri,
      scope: requestBody.scope,
      state: requestBody.state,
      code_challenge: requestBody.code_challenge,
      code_challenge_method: requestBody.code_challenge_method
    });

    if (!pageResult.ok) {
      throw new ExecutorError(
        pageResult.error.errorKey,
        pageResult.error.message
      );
    }

    const { data } = pageResult;

    if (requestBody.action === 'deny') {
      return {
        redirectUrl: buildOAuthRedirectUrl(data.redirectUri, {
          error: OAuthRfcCodes.ACCESS_DENIED,
          error_description: 'The resource owner denied the request',
          state: data.state
        })
      };
    }

    const code = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.authCodeTTLMs).toISOString();

    const oauthRepo = this.getOAuthRepo();
    await oauthRepo.create({
      code,
      client_id: data.clientId,
      user_id: session.userId,
      redirect_uri: data.redirectUri,
      scope: data.scopes.join(' ') || null,
      code_challenge: data.codeChallenge ?? null,
      code_challenge_method: data.codeChallengeMethod ?? null,
      expires_at: expiresAt
    });

    // trust flag reserved for future auto-consent storage
    void requestBody.trust;

    return {
      redirectUrl: buildOAuthRedirectUrl(data.redirectUri, {
        code,
        state: data.state
      })
    };
  }
}
