export const UserRole = {
  ADMIN: 0,
  USER: 1
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export type UserSchema = {
  id: string | number;
  role: UserRoleType;
  email: string;
  password: string;
  /**
   * Encrypted token payload (token + expiry).
   */
  credential_token: string;
  email_confirmed_at?: number | null;
  created_at: string;
  updated_at?: string | null;
};

export type UserCredential = {
  token: string;
  /** OAuth middleware refresh token issued by oauth-wrapper */
  refresh_token?: string;
};

export type WebUser = Omit<UserSchema, 'password'>;

export function isWebUser(value: unknown): value is WebUser {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    (typeof user.id === 'string' || typeof user.id === 'number') &&
    (user.role === UserRole.ADMIN || user.role === UserRole.USER) &&
    typeof user.email === 'string' &&
    typeof user.credential_token === 'string' &&
    typeof user.created_at === 'string'
  );
}

export function isUserCredential(value: unknown): value is UserCredential {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const credential = value as Record<string, unknown>;

  return (
    typeof credential.token === 'string' &&
    (credential.refresh_token === undefined ||
      typeof credential.refresh_token === 'string')
  );
}
