/**
 * Local auth contract types for this app (replaces `@qlover/oauth-wrapper` types).
 * Kept intentionally small: only what AuthUserService / AuthProviderInterface /
 * SessionService actually need.
 */
import type { UserSchema } from '@schemas/UserSchema';

export interface SessionPayload {
  userId: string;
  providerRefreshToken: string;
  user?: UserSchema;
}

export interface SignOtpResult {
  message?: string;
  user?: UserSchema;
}

export type SignWithOtpParams =
  | {
      email: string;
      options?: { emailRedirectTo?: string; shouldCreateUser?: boolean };
    }
  | { phone: string; options?: { shouldCreateUser?: boolean } };

export type VerifyOtpParams =
  | { email: string; token: string; type?: string }
  | { phone: string; token: string; type?: string };

export type SignWithOtpSchema = SignWithOtpParams & { token?: string };

export interface WithUserSession {
  user: UserSchema;
  session: SessionPayload;
}
