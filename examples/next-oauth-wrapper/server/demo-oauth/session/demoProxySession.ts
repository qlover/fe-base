import jwt from 'jsonwebtoken';
import { UserRole, type UserSchema } from '@schemas/UserSchema';

/** HttpOnly cookie storing the signed OAuth app session JWT. */
export const OAUTH_APP_SESSION_COOKIE = 'n_oauth_wrapper__session';

export type OAuthAppSessionPayload = {
  userId: number;
  email: string;
  name: string;
  providerSessionToken: string;
};

export function parseOAuthAppSessionCookie(
  raw: string | undefined,
  secret: string | undefined
): OAuthAppSessionPayload | null {
  if (!raw || !secret) {
    return null;
  }
  try {
    return jwt.verify(raw, secret) as OAuthAppSessionPayload;
  } catch {
    return null;
  }
}

export function oauthAppSessionToUserSchema(
  session: OAuthAppSessionPayload,
  adminUserIds: number[] = []
): UserSchema {
  return {
    id: String(session.userId),
    email: session.email,
    role: adminUserIds.includes(session.userId)
      ? UserRole.ADMIN
      : UserRole.USER,
    password: '',
    credential_token: session.providerSessionToken,
    created_at: new Date().toISOString(),
    updated_at: null
  };
}
