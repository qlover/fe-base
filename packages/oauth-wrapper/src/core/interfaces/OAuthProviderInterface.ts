import type { OAuthSessionPayload } from './OAuthSessionInterface';
import type { OAuthTokenRequest } from '../schema/OAuthTokenSchema';
import type { OAuthWrapperRepositoryInterface } from './OAuthWrapperRepositoryInterface';
import type { OAuthTokenResponse } from '../schema/OAuthClientSchema';
import type { OAuthUserInfoResponse } from '../schema/OAuthUserInfoSchema';
import type { LoginParams } from '@qlover/corekit-bridge/core';

/**
 * OAuth authorize page data shared by server rendering and client UI.
 *
 * Significance: Prevents UI components from importing server-only services for types.
 * Core idea: Keep the authorize page view model in the shared contract layer.
 * Main function: Describe client metadata and request parameters for consent rendering.
 * Main purpose: Let OAuth server modules move independently from UI code.
 *
 * @example
 * const clientId = data.clientId;
 */
export interface OAuthAuthorizePageData {
  clientId: string;
  clientName: string;
  clientUri: string | null;
  logoUri: string | null;
  redirectUri: string;
  scopes: string[];
  state?: string;
  responseType: 'code';
  codeChallenge?: string;
  codeChallengeMethod?: 'S256';
  confidential: boolean;
}

export type OAuthAuthorizeValidationError = {
  errorKey: string;
  message: string;
};

export type OAuthConsentResult = {
  redirectUrl: string;
};

export interface OAuthTokenServiceInterface {
  exchangeToken(
    rawFields: Record<string, string> | OAuthTokenRequest
  ): Promise<OAuthTokenResponse>;

  /**
   * RFC 7009 token revocation. Revokes middleware refresh tokens when present.
   * Always resolves (idempotent) per RFC guidance.
   */
  revokeToken(rawFields: Record<string, string>): Promise<void>;
}

export type ResolveAuthorizePageResult =
  | { ok: true; data: OAuthAuthorizePageData }
  | { ok: false; error: OAuthAuthorizeValidationError };

export interface OAuthProviderInterface<
  SessionPayload extends OAuthSessionPayload
> extends OAuthTokenServiceInterface {
  login(params: LoginParams): Promise<SessionPayload>;

  /**
   * Get the OAuth repository
   */
  getOAuthRepo(): OAuthWrapperRepositoryInterface;

  /**
   * Clear the session
   */
  clearSession(): Promise<void>;

  /**
   * Get the session
   */
  getSession(): Promise<SessionPayload | null>;

  /**
   * Logout the user
   */
  logout(userId: string): Promise<void>;

  /**
   * Resolve the authorize page
   */
  resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<ResolveAuthorizePageResult>;

  /**
   * Process the consent
   */
  processConsent(requestBody: unknown): Promise<OAuthConsentResult>;

  getUserInfoWithAccessToken(
    accessToken: string
  ): Promise<OAuthUserInfoResponse>;
}
