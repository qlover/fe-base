/**
 * Minimal login-context metadata extracted from HTTP requests.
 * Apps may extend this type for richer audit fields.
 */
export type UserLoginContext = {
  userAgent?: string | null;
  ipAddress?: string | null;
};
