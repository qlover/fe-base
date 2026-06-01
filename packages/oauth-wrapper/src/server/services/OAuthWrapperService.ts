import { randomBytes } from 'crypto';
import { ExecutorError } from '@qlover/fe-corekit';
import {
  OAuthRfcCodes,
  OAuthAuthorizeQuerySchema,
  OAuthConsentBodySchema
} from '../../core';
import {
  isRedirectUriAllowed,
  normalizeQuery,
  validatePkceParams
} from '../utils/authorizeUtil';
import {
  buildOAuthRedirectUrl,
  parseScopeList
} from '../utils/oauthRedirectUtils';
import { OAuthWrapperError } from '../utils/OAuthWrapperError';
import type {
  OAuthAuthorizePageData,
  OAuthAuthorizeValidationError,
  OAuthConsentResult,
  OAuthServiceInterface,
  OAuthTokenServiceInterface,
  OAuthSessionPayload,
  OAuthSessionInterface,
  OAuthUserProfile,
  OAuthUserAdapterInterface,
  OAuthWrapperRepositoryInterface,
  OAuthAuthorizeQuery,
  OAuthConsentBody,
  OAuthTokenResponse,
  OAuthUserInfoResponse
} from '../../core';

const AUTH_CODE_TTL_MS = 5 * 60 * 1000;

export class OAuthWrapperService<
  SessionPayload extends OAuthSessionPayload = OAuthSessionPayload
> implements OAuthServiceInterface<SessionPayload> {
  constructor(
    protected oauthSession: OAuthSessionInterface<SessionPayload>,
    protected userAdapter: OAuthUserAdapterInterface,
    protected tokenService: OAuthTokenServiceInterface,
    protected oauthRepo: OAuthWrapperRepositoryInterface
  ) {}

  /**
   * @override
   */
  public getOAuthSession(): OAuthSessionInterface<SessionPayload> {
    return this.oauthSession;
  }
  /**
   * @override
   */
  public getOAuthAdapter(): OAuthUserAdapterInterface {
    return this.userAdapter;
  }
  /**
   * @override
   */
  public getOAuthTokenService(): OAuthTokenServiceInterface {
    return this.tokenService;
  }
  /**
   * @override
   */
  public getOAuthRepo(): OAuthWrapperRepositoryInterface {
    return this.oauthRepo;
  }

  protected isQuery(query: unknown): query is OAuthAuthorizeQuery {
    return OAuthAuthorizeQuerySchema.safeParse(query).success;
  }

  protected isValidateConsent(value: unknown): value is OAuthConsentBody {
    return OAuthConsentBodySchema.safeParse(value).success;
  }

  /**
   * @override
   */
  public async resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<
    | { ok: true; data: OAuthAuthorizePageData }
    | { ok: false; error: OAuthAuthorizeValidationError }
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

    const client = await this.oauthRepo.findClientById(query.client_id);
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
  ): Promise<OAuthConsentResult> {
    if (!this.isValidateConsent(requestBody)) {
      throw new ExecutorError(
        OAuthRfcCodes.INVALID_REQUEST,
        'Invalid consent request body'
      );
    }

    const session = await this.oauthSession.getSession();
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
    const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_MS).toISOString();

    await this.oauthRepo.create({
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
  /**
   * @override
   */
  public async exchangeToken(
    rawFields: Record<string, string>
  ): Promise<OAuthTokenResponse> {
    return await this.tokenService.exchangeToken(rawFields);
  }

  /**
   * @override
   */
  public async revokeToken(rawFields: Record<string, string>): Promise<void> {
    return await this.tokenService.revokeToken(rawFields);
  }

  /**
   * @override
   */
  public async logoutUser(userId: number): Promise<void> {
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
  public async getUserInfo(
    accessToken: string
  ): Promise<OAuthUserInfoResponse> {
    try {
      const profile =
        await this.userAdapter.getUserInfoByAccessToken(accessToken);
      return this.toUserInfoResponse(profile);
    } catch {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_TOKEN, 401);
    }
  }

  protected toUserInfoResponse(
    profile: OAuthUserProfile
  ): OAuthUserInfoResponse {
    const sub = String(profile.id);
    if (!sub || sub === 'NaN') {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_TOKEN, 401);
    }

    const email = profile.email?.trim();
    if (!email) {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_TOKEN, 401);
    }

    const nameFromParts = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(' ');
    const name = profile.name?.trim() || nameFromParts || email;

    return {
      sub,
      email,
      name,
      ...(profile.roles?.length ? { roles: profile.roles } : {})
    };
  }
}
