import type { OAuthClientsRepositoryInterface } from './OAuthClientsRepositoryInterface';
import type { OAuthAuthorizationCodeRow } from '../schema/OAuthAuthorizeSchema';
import type {
  OAuthUserCredentialsRow,
  OAuthRefreshTokenRow
} from '../schema/OAuthClientSchema';

export type CreateAuthorizationCodeInput = {
  code: string;
  client_id: string;
  user_id: number;
  redirect_uri: string;
  scope: string | null;
  code_challenge: string | null;
  code_challenge_method: string | null;
  expires_at: string;
};

export type CreateOAuthRefreshTokenInput = {
  refresh_token: string;
  client_id: string;
  user_id: number;
  expires_at: string;
};

export interface OAuthWrapperRepositoryInterface extends OAuthClientsRepositoryInterface {
  create(input: CreateAuthorizationCodeInput): Promise<void>;
  consumeCode(code: string): Promise<OAuthAuthorizationCodeRow | null>;

  getUserCredentials(userId: number): Promise<OAuthUserCredentialsRow | null>;
  upsertUserCredentials(
    userId: number,
    fields: {
      provider_refresh_token?: string | null;
      provider_session_token?: string | null;
    }
  ): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<OAuthRefreshTokenRow | null>;

  upsertRefreshToken(input: {
    refresh_token: string;
    client_id: string;
    user_id: number;
    expires_at: string;
  }): Promise<void>;

  revokeRefreshToken(tokenHash: string): Promise<void>;

  findByTokenHash(tokenHash: string): Promise<OAuthRefreshTokenRow | null>;

  createRefreshToken(input: CreateOAuthRefreshTokenInput): Promise<void>;

  revokeByTokenHash(tokenHash: string): Promise<void>;

  /** Revoke all active refresh tokens issued for the given user. */
  revokeRefreshTokensByUserId(userId: number): Promise<void>;
}
