import type { LoginParams } from '@qlover/corekit-bridge/core';
import type * as Types from '../../core';
import {
  OAuthAuthorizeQuerySchema,
  OAuthConsentBodySchema,
  OAuthRfcCodes
} from '../../core';

export type OAuthUserProfile = {
  id: string | number;
  email?: string | null;
  name?: string | null;
  roles?: string[];
  [key: string]: unknown;
};

export type OAuthUserCredentials = {
  token: string;
  [key: string]: unknown;
};

export type OAuthUserAccessToken = {
  access_token: string;
  expires_in: number;
  refresh_token?: string | null;
  [key: string]: unknown;
};
import {
  isRedirectUriAllowed,
  normalizeQuery,
  validatePkceParams
} from '../utils/authorizeUtil';
import {
  buildOAuthRedirectUrl,
  parseScopeList
} from '../utils/oauthRedirectUtils';
import { ExecutorError } from '@qlover/fe-corekit';
import { randomBytes } from 'crypto';

export abstract class OAuthAbstractProvider<
  SessionPayload extends Types.OAuthSessionPayload
> implements Types.OAuthProviderInterface<SessionPayload> {
  protected authCodeTTLMs: number = 5 * 60 * 1000;

  /**
   * @override
   */
  public abstract exchangeToken(
    _rawFields: Record<string, string> | Types.OAuthTokenRequest
  ): Promise<Types.OAuthTokenResponse>;

  /**
   * @override
   */
  public abstract revokeToken(
    _rawFields: Record<string, string>
  ): Promise<void>;

  /**
   * @override
   */
  public abstract getOAuthRepo(): Types.OAuthWrapperRepositoryInterface;

  /**
   * @override
   */
  public abstract clearSession(): Promise<void>;
  /**
   * @override
   */
  public abstract getSession(): Promise<SessionPayload | null>;

  /**
   * @override
   */
  public abstract login(params: LoginParams): Promise<SessionPayload>;

  /**
   * @override
   */
  public abstract getUserInfoWithAccessToken(
    accessToken: string
  ): Promise<Types.OAuthUserInfoResponse>;

  protected isQuery(query: unknown): query is Types.OAuthAuthorizeQuery {
    return OAuthAuthorizeQuerySchema.safeParse(query).success;
  }

  protected isValidateConsent(value: unknown): value is Types.OAuthConsentBody {
    return OAuthConsentBodySchema.safeParse(value).success;
  }

  protected generageSessionPayload(
    userInfo: OAuthUserProfile & {
      sessionToken: string;
    }
  ): SessionPayload {
    return {
      userId: String(userInfo.id),
      email: userInfo.email,
      name: userInfo.name ?? userInfo.email,
      providerSessionToken: userInfo.sessionToken
    } as SessionPayload;
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
