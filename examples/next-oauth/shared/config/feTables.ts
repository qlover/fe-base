/**
 * Central table names for next-oauth (all `fe_` prefixed).
 * Keep in sync with `makes/sql/001-fe-schema.sql`.
 */

export const FeTables = {
  users: 'fe_users',
  requestLogs: 'fe_request_logs',
  oauthClients: 'fe_oauth_clients',
  oauthAuthorizationCodes: 'fe_oauth_authorization_codes',
  oauthRefreshTokens: 'fe_oauth_refresh_tokens',
  oauthUserCredentials: 'fe_oauth_user_credentials',
  oauthUserLinks: 'fe_oauth_user_links',
  /** Remembered "trust this app" consent per user + client. */
  oauthConsentGrants: 'fe_oauth_consent_grants',
  roles: 'fe_roles',
  permissions: 'fe_permissions',
  roleAssignments: 'fe_role_assignments',
  /** DB-backed locale dictionary (Admin Locales CMS). */
  locales: 'fe_locales',
  /** Runtime site settings (Admin Settings). */
  siteSettings: 'fe_site_settings',
  /** Phone OTP send/verify audit (memory shows code_plain). */
  phoneOtps: 'fe_phone_otps',
  /** Transactional mail audit (memory | resend). */
  mailLogs: 'fe_mail_logs',
  /** Forgot-password reset links (hashed token, single use). */
  passwordResetTokens: 'fe_password_reset_tokens',
  /** User feedback (admin list + account submit). */
  userFeedback: 'fe_user_feedback'
} as const;

export type FeTableName = (typeof FeTables)[keyof typeof FeTables];
