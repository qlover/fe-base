import type {
  OAuthSessionPayload,
  WithUserSession
} from './OAuthSessionInterface';
import type { OAuthTokenRequest } from '../schema/OAuthTokenSchema';
import type { OAuthWrapperRepositoryInterface } from './OAuthWrapperRepositoryInterface';
import type { OAuthTokenResponse } from '../schema/OAuthClientSchema';
import type { LoginParams } from '@qlover/corekit-bridge/gateway-service';
import type { SignWithOtpSchema } from '../schema/OAuthAuthorizeSchema';

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
  User,
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

  /**
   * 使用 access_token 获取用户信息
   * @param accessToken
   */
  getUserInfoWithAccessToken(accessToken: string): Promise<User>;

  /**
   * 刷新会话数据
   * @param params
   */
  refreshUser(params?: {
    refresh_token: string;
  }): Promise<WithUserSession<SessionPayload, User>>;
}

export type SignWithOtpParams =
  | {
      email: string;
    }
  | {
      phone: string;
    };

export interface VerifyMobileOtpParams {
  /** The user's phone number. */
  phone: string;
  /** The otp sent to the user's phone number. */
  token: string;
}
export interface VerifyEmailOtpParams {
  /** The user's email address. */
  email: string;
  /** The otp sent to the user's email address. */
  token: string;
}

export type VerifyOtpParams = SignWithOtpSchema;

export type SignOtpResult = {
  expired: number;
  messageId?: string;
};

/**
 * Interface for OAuth providers that support OTP-based authentication.
 *
 * This interface extends the base OAuthProviderInterface with methods specific to OTP flows.
 * It allows for signing in with OTP and verifying OTP tokens to establish sessions.
 *
 * The generic SessionPayload type parameter allows implementations to define their own session data structure.
 */
export interface OAuthOTPProviderInterface {
  /**
   * Sign in using OTP. The params can be either email-based or phone-based.
   * The implementation should handle sending the OTP to the user.
   *
   * @param params - Parameters for signing in with OTP, either email or phone.
   * @returns A promise that resolves to the session payload after successful OTP initiation.
   */
  signWithOtp(params: SignWithOtpParams): Promise<SignOtpResult>;

  /**
   * Verify the OTP token provided by the user. This method should validate the OTP and establish a session if valid.
   *
   * @param params - Parameters for verifying the OTP, including the identifier (email or phone) and the OTP token.
   * @returns A promise that resolves to the session payload after successful OTP verification.
   */
  verifyOtp(params: VerifyOtpParams): Promise<SignOtpResult>;
}
