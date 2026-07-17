import type { UserSchema } from '@schemas/UserSchema';
import type {
  SignOtpResult,
  SignWithOtpParams,
  VerifyOtpParams
} from './AuthTypes';
import type { Session } from '@supabase/supabase-js';

/**
 * Auth provider abstraction consumed by {@link AuthUserService}.
 *
 * Wraps a concrete upstream identity provider (e.g. Supabase Auth) so the
 * rest of the app never depends on provider-specific APIs.
 */
export interface AuthProviderInterface {
  /**
   * Authenticate with email/password and establish the app session.
   */
  login(params: { email: string; password: string }): Promise<void>;

  /**
   * Read the current app session and resolve it to a {@link UserSchema}.
   */
  getUserSchema(): Promise<UserSchema | null>;

  /**
   * Refresh the app session from the stored provider refresh token.
   */
  refreshUser(): Promise<{ user: UserSchema | null }>;

  /**
   * Clear the app session.
   */
  clearSession(): Promise<void>;

  signWithOtp(params: SignWithOtpParams): Promise<SignOtpResult>;

  verifyOtp(params: VerifyOtpParams): Promise<SignOtpResult>;

  /**
   * Establish app session from an already-authenticated external provider
   * session (e.g. Supabase magic link / OAuth callback).
   * Providers that do not support this flow should not implement it.
   */
  loginWithSession?(session: Session): Promise<void>;
}
