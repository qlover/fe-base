import {
  UserRole,
  type UserCredential,
  type UserSchema
} from '@/interfaces/schema/UserSchema';
import type { OAuthUserInfo } from './types';

export type OAuthSeedUser = Omit<UserSchema, 'password'>;

export function mapOAuthUserToSeed(
  userinfo: OAuthUserInfo,
  accessToken: string
): { user: OAuthSeedUser; credential: UserCredential } {
  const now = new Date().toISOString();
  return {
    user: {
      id: userinfo.sub,
      role: UserRole.USER,
      email: userinfo.email,
      credential_token: accessToken,
      created_at: now,
      updated_at: null,
      email_confirmed_at: Math.floor(Date.now() / 1000)
    },
    credential: { token: accessToken }
  };
}
