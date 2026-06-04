import { createHash, randomBytes } from 'crypto';
import {
  OAuthRfcCodes,
  OAuthTokenRequestSchema,
  OAuthTokenRevokeSchema
} from '../../core';
import type {
  OAuthTokenRequest,
  OAuthTokenServiceInterface,
  OAuthUserAdapterInterface,
  OAuthWrapperRepositoryInterface,
  OAuthTokenResponse
} from '../../core';
import { OAuthWrapperError } from '../utils/OAuthWrapperError';
import { verifyPkceS256 } from '../utils/pkce';
import type { EncryptorInterface } from '@qlover/fe-corekit';

function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * OAuth 2.0 token endpoint (`POST /oauth/token`).
 *
 * Significance: Exchanges authorization codes and refresh tokens for provider access tokens.
 * Core idea: Validate client + grant, consume codes, proxy user adapter token APIs.
 * Main purpose: Standard token endpoint for third-party OAuth clients.
 *
 * @example
 * const tokens = await service.exchangeToken(formFields);
 */
export class OAuthTokenService implements OAuthTokenServiceInterface {
  protected static REFRESH_TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;

  constructor(
    protected tokenEncryption: EncryptorInterface<string, string>,
    protected userAdapter: OAuthUserAdapterInterface,
    protected oauthRepo: OAuthWrapperRepositoryInterface
  ) {}

  /**
   * @override
   */
  public async exchangeToken(
    rawFields: Record<string, string>
  ): Promise<OAuthTokenResponse> {
    let request: OAuthTokenRequest;
    try {
      request = OAuthTokenRequestSchema.parse(rawFields);
    } catch {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_REQUEST,
        400,
        'Malformed token request'
      );
    }

    let client;
    try {
      client = await this.oauthRepo.verifyClientCredentials(
        request.client_id,
        request.client_secret
      );
    } catch {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_CLIENT, 401);
    }

    if (!client.grant_types.includes(request.grant_type)) {
      throw new OAuthWrapperError(OAuthRfcCodes.UNSUPPORTED_GRANT_TYPE, 400);
    }

    if (request.grant_type === 'authorization_code') {
      return await this.exchangeAuthorizationCode(request, client.client_id);
    }

    return await this.exchangeRefreshToken(request, client.client_id);
  }

  protected async exchangeAuthorizationCode(
    request: Extract<OAuthTokenRequest, { grant_type: 'authorization_code' }>,
    verifiedClientId: string
  ): Promise<OAuthTokenResponse> {
    const authCode = await this.oauthRepo.consumeCode(request.code);
    if (!authCode) {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_GRANT,
        400,
        'Authorization code is invalid, expired, or already used'
      );
    }

    if (authCode.client_id !== verifiedClientId) {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_GRANT,
        400,
        'client_id mismatch'
      );
    }

    if (authCode.redirect_uri !== request.redirect_uri) {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_GRANT,
        400,
        'redirect_uri mismatch'
      );
    }

    this.assertPkceForAuthorizationCode(request, authCode);

    const providerTokens = await this.fetchProviderAccessToken(
      authCode.user_id
    );
    const middlewareRefresh = await this.issueMiddlewareRefreshToken(
      authCode.client_id,
      authCode.user_id
    );

    return {
      access_token: providerTokens.access_token,
      token_type: 'Bearer',
      expires_in: providerTokens.expires_in,
      refresh_token: middlewareRefresh,
      scope: authCode.scope ?? undefined
    };
  }

  protected assertPkceForAuthorizationCode(
    request: Extract<OAuthTokenRequest, { grant_type: 'authorization_code' }>,
    authCode: {
      code_challenge?: string | null;
      code_challenge_method?: string | null;
    }
  ): void {
    const storedChallenge = authCode.code_challenge?.trim();

    if (storedChallenge) {
      const verifier = request.code_verifier?.trim();
      if (!verifier) {
        throw new OAuthWrapperError(
          OAuthRfcCodes.INVALID_GRANT,
          400,
          'code_verifier is required'
        );
      }
      if (authCode.code_challenge_method !== 'S256') {
        throw new OAuthWrapperError(
          OAuthRfcCodes.INVALID_GRANT,
          400,
          'Unsupported PKCE method'
        );
      }
      if (!verifyPkceS256(verifier, storedChallenge)) {
        throw new OAuthWrapperError(
          OAuthRfcCodes.INVALID_GRANT,
          400,
          'code_verifier mismatch'
        );
      }
      return;
    }

    if (!request.client_secret?.trim()) {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_CLIENT,
        401,
        'client_secret is required when PKCE is not used'
      );
    }
  }

  protected async exchangeRefreshToken(
    request: Extract<OAuthTokenRequest, { grant_type: 'refresh_token' }>,
    verifiedClientId: string
  ): Promise<OAuthTokenResponse> {
    const tokenHash = hashOpaqueToken(request.refresh_token);
    const stored = await this.oauthRepo.findByTokenHash(tokenHash);

    if (
      !stored ||
      stored.revoked ||
      stored.client_id !== verifiedClientId ||
      new Date(stored.expires_at) <= new Date()
    ) {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_GRANT,
        400,
        'Refresh token is invalid'
      );
    }

    const providerTokens = await this.fetchProviderAccessToken(stored.user_id);

    await this.oauthRepo.revokeByTokenHash(tokenHash);
    const middlewareRefresh = await this.issueMiddlewareRefreshToken(
      stored.client_id,
      stored.user_id
    );

    return {
      access_token: providerTokens.access_token,
      token_type: 'Bearer',
      expires_in: providerTokens.expires_in,
      refresh_token: middlewareRefresh
    };
  }

  protected async fetchProviderAccessToken(userId: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const credentials = await this.oauthRepo.getUserCredentials(userId);
    const sessionToken = credentials?.provider_session_token?.trim();

    if (!sessionToken) {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_GRANT,
        400,
        'User credentials expired. Re-authorization required.'
      );
    }

    try {
      const access = await this.userAdapter.exchangeAccessToken({
        token: sessionToken
      });

      if (access.refresh_token) {
        await this.oauthRepo.upsertUserCredentials(userId, {
          provider_refresh_token: this.tokenEncryption.encrypt(
            access.refresh_token
          )
        });
      }

      return {
        access_token: access.access_token,
        expires_in: access.expires_in
      };
    } catch {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_GRANT,
        400,
        'Failed to obtain access token from user provider'
      );
    }
  }

  protected async issueMiddlewareRefreshToken(
    clientId: string,
    userId: string
  ): Promise<string> {
    const plain = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      Date.now() + OAuthTokenService.REFRESH_TOKEN_TTL_MS
    ).toISOString();

    await this.oauthRepo.createRefreshToken({
      refresh_token: hashOpaqueToken(plain),
      client_id: clientId,
      user_id: userId,
      expires_at: expiresAt
    });

    return plain;
  }

  /**
   * @override
   * RFC 7009 — revoke middleware refresh tokens. Idempotent: unknown tokens are ignored.
   */
  public async revokeToken(rawFields: Record<string, string>): Promise<void> {
    let request;
    try {
      request = OAuthTokenRevokeSchema.parse(rawFields);
    } catch {
      throw new OAuthWrapperError(
        OAuthRfcCodes.INVALID_REQUEST,
        400,
        'Malformed revocation request'
      );
    }

    try {
      await this.oauthRepo.verifyClientCredentials(
        request.client_id,
        request.client_secret
      );
    } catch {
      throw new OAuthWrapperError(OAuthRfcCodes.INVALID_CLIENT, 401);
    }

    if (
      request.token_type_hint &&
      request.token_type_hint !== 'refresh_token'
    ) {
      return;
    }

    const tokenHash = hashOpaqueToken(request.token);
    const stored = await this.oauthRepo.findByTokenHash(tokenHash);
    if (!stored || stored.client_id !== request.client_id) {
      return;
    }

    await this.oauthRepo.revokeByTokenHash(tokenHash);
  }
}
