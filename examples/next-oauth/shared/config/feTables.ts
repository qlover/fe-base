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
  roles: 'fe_roles',
  permissions: 'fe_permissions',
  roleAssignments: 'fe_role_assignments',
  /** DB-backed locale dictionary (Admin Locales CMS). */
  locales: 'fe_locales',
  /** Runtime site settings (Admin Settings). */
  siteSettings: 'fe_site_settings'
} as const;

export type FeTableName = (typeof FeTables)[keyof typeof FeTables];
