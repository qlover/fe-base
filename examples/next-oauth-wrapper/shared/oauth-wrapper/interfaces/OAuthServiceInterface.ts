import type {
  OAuthSessionInterface,
  OAuthSessionPayload
} from './OAuthSessionInterface';
import type { OAuthTokenRequest } from '../schema';
import type { OAuthUserAdapterInterface } from './OAuthUserAdapterInterface';
import type { OAuthWrapperRepositoryInterface } from './OAuthWrapperRepositoryInterface';
import type { OAuthTokenResponse } from '../schema/OAuthClientSchema';
import type { OAuthUserInfoResponse } from '../schema/OAuthUserInfoSchema';

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
}

export interface OAuthServiceInterface<
  SessionPayload extends OAuthSessionPayload
> extends OAuthTokenServiceInterface {
  resolveAuthorizePage(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<
    | { ok: true; data: OAuthAuthorizePageData }
    | { ok: false; error: OAuthAuthorizeValidationError }
  >;

  processConsent(requestBody: unknown): Promise<OAuthConsentResult>;

  getUserInfo(accessToken: string): Promise<OAuthUserInfoResponse>;

  getOAuthSession(): OAuthSessionInterface<SessionPayload>;
  getOAuthAdapter(): OAuthUserAdapterInterface;
  getOAuthTokenService(): OAuthTokenServiceInterface;
  getOAuthRepo(): OAuthWrapperRepositoryInterface;
}
