/**
 * Defaults for syncing upstream IdP users into local auth.users.
 * Change `provider` / `linksTable` / domain when copying to another app.
 */
import { FeTables } from './feTables';

export const oauthLocalUserConfig = {
  /** Upstream IdP key stored in app_metadata.provider and links.provider */
  provider: 'brain',
  /** Public table mapping auth.users.id ↔ external id */
  linksTable: FeTables.oauthUserLinks,
  /**
   * Domain for synthetic emails when upstream has no email.
   * Final address: `{externalUserId}@{provider}.{syntheticEmailDomain}`
   */
  syntheticEmailDomain: 'users.local'
} as const;

export type OAuthLocalUserConfig = typeof oauthLocalUserConfig;
