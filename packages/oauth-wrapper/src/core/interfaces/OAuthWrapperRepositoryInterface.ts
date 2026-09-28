import type { OAuthClientsRepositoryInterface } from './OAuthClientsRepositoryInterface';
import type {
  OAuthAuthorizationCodeRow,
  OAuthConsentGrantRow
} from '../schema/OAuthAuthorizeSchema';
import type {
  OAuthUserCredentialsRow,
  OAuthRefreshTokenRow
} from '../schema/OAuthClientSchema';

export type CreateAuthorizationCodeInput = {
  code: string;
  client_id: string;
  user_id: string;
  redirect_uri: string;
  scope: string | null;
  code_challenge: string | null;
  code_challenge_method: string | null;
  expires_at: string;
};

export type UpsertOAuthConsentGrantInput = {
  user_id: string;
  client_id: string;
  device_id: string;
  scopes: string[];
  expires_at: string;
  user_agent?: string | null;
};

export type CreateOAuthRefreshTokenInput = {
  refresh_token: string;
  client_id: string;
  user_id: string;
  expires_at: string;
};

export interface OAuthWrapperRepositoryInterface extends OAuthClientsRepositoryInterface {
  create(input: CreateAuthorizationCodeInput): Promise<void>;
  consumeCode(code: string): Promise<OAuthAuthorizationCodeRow | null>;

  getUserCredentials(userId: string): Promise<OAuthUserCredentialsRow | null>;
  upsertUserCredentials(
    userId: string,
    fields: {
      provider_refresh_token?: string | null;
      provider_session_token?: string | null;
    }
  ): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<OAuthRefreshTokenRow | null>;

  upsertRefreshToken(input: {
    refresh_token: string;
    client_id: string;
    user_id: string;
    expires_at: string;
  }): Promise<void>;

  revokeRefreshToken(tokenHash: string): Promise<void>;

  findByTokenHash(tokenHash: string): Promise<OAuthRefreshTokenRow | null>;

  createRefreshToken(input: CreateOAuthRefreshTokenInput): Promise<void>;

  revokeByTokenHash(tokenHash: string): Promise<void>;

  /** Revoke all active refresh tokens issued for the given user. */
  revokeRefreshTokensByUserId(userId: string): Promise<void>;

  /**
   * Optional: remembered consent ("trust this app" on one device). Without
   * these methods, the consent page is always shown.
   */
  findConsentGrant?(
    userId: string,
    clientId: string,
    deviceId: string
  ): Promise<OAuthConsentGrantRow | null>;

  upsertConsentGrant?(input: UpsertOAuthConsentGrantInput): Promise<void>;

  /** Record an auto-consent hit (e.g. update `last_used_at`). */
  touchConsentGrant?(
    userId: string,
    clientId: string,
    deviceId: string
  ): Promise<void>;

  /** Omit `deviceId` to revoke the client on every device. */
  revokeConsentGrant?(
    userId: string,
    clientId: string,
    deviceId?: string
  ): Promise<void>;
}
