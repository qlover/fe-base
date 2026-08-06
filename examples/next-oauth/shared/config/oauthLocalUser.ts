/**
 * Defaults for syncing upstream IdP users into local auth.users.
 * Change `provider` / `linksTable` / domain when copying to another app.
 */
export const oauthLocalUserConfig = {
  /** Upstream IdP key stored in app_metadata.provider and links.provider */
  provider: 'brain',
  /** Public table mapping auth.users.id ↔ external id */
  linksTable: 'n_oauth_wrapper__user_links',
  /**
   * Domain for synthetic emails when upstream has no email.
   * Final address: `{externalUserId}@{provider}.{syntheticEmailDomain}`
   */
  syntheticEmailDomain: 'users.local'
} as const;

export type OAuthLocalUserConfig = typeof oauthLocalUserConfig;
