import type {
  OAuthClientRow,
  OAuthClientListItem,
  OAuthClientDetail,
  OAuthClientCreate,
  OAuthClientUpdate,
  OAuthAuthorizationCodeRow,
  OAuthRefreshTokenRow,
  OAuthUserCredentialsRow
} from '../../core';
import type {
  CreateAuthorizationCodeInput,
  CreateOAuthRefreshTokenInput,
  OAuthWrapperRepositoryInterface
} from '../../core/interfaces/OAuthWrapperRepositoryInterface';

export type NoOpOAuthWrapperRepositoryOptions = {
  /** Called when credential upsert is skipped (debug only). */
  onSkipUpsertUserCredentials?: (userId: string) => void;
};

/**
 * No-op repository for apps that use oauth-wrapper only as a login consumer,
 * not as an OAuth authorization server.
 */
export class NoOpOAuthWrapperRepository
  implements OAuthWrapperRepositoryInterface
{
  protected readonly onSkipUpsertUserCredentials?: (userId: string) => void;

  constructor(options?: NoOpOAuthWrapperRepositoryOptions) {
    this.onSkipUpsertUserCredentials = options?.onSkipUpsertUserCredentials;
  }

  /**
   * @override
   */
  public async create(_input: CreateAuthorizationCodeInput): Promise<void> {
    throw new Error('OAuth IdP authorization codes are disabled');
  }

  /**
   * @override
   */
  public async consumeCode(
    _code: string
  ): Promise<OAuthAuthorizationCodeRow | null> {
    throw new Error('OAuth IdP authorization codes are disabled');
  }

  /**
   * @override
   */
  public async getUserCredentials(
    _userId: string
  ): Promise<OAuthUserCredentialsRow | null> {
    return null;
  }

  /**
   * @override
   */
  public async upsertUserCredentials(
    userId: string,
    _fields: {
      provider_refresh_token?: string | null;
      provider_session_token?: string | null;
    }
  ): Promise<void> {
    this.onSkipUpsertUserCredentials?.(userId);
  }

  /**
   * @override
   */
  public async findRefreshToken(
    _tokenHash: string
  ): Promise<OAuthRefreshTokenRow | null> {
    return null;
  }

  /**
   * @override
   */
  public async upsertRefreshToken(_input: {
    refresh_token: string;
    client_id: string;
    user_id: string;
    expires_at: string;
  }): Promise<void> {
    throw new Error('OAuth IdP refresh tokens are disabled');
  }

  /**
   * @override
   */
  public async revokeRefreshToken(_tokenHash: string): Promise<void> {
    // no-op
  }

  /**
   * @override
   */
  public async findByTokenHash(
    _tokenHash: string
  ): Promise<OAuthRefreshTokenRow | null> {
    return null;
  }

  /**
   * @override
   */
  public async createRefreshToken(
    _input: CreateOAuthRefreshTokenInput
  ): Promise<void> {
    throw new Error('OAuth IdP refresh tokens are disabled');
  }

  /**
   * @override
   */
  public async revokeByTokenHash(_tokenHash: string): Promise<void> {
    // no-op
  }

  /**
   * @override
   */
  public async revokeRefreshTokensByUserId(_userId: string): Promise<void> {
    // no-op
  }

  /**
   * @override
   */
  public async findClientById(
    _clientId: string
  ): Promise<OAuthClientRow | null> {
    return null;
  }

  /**
   * @override
   */
  public async listClientByOwner(
    _ownerUserId: string
  ): Promise<OAuthClientListItem[]> {
    return [];
  }

  /**
   * @override
   */
  public async createClient(
    _ownerUserId: string,
    _input: OAuthClientCreate
  ): Promise<{ client: OAuthClientRow; clientSecret?: string }> {
    throw new Error('OAuth IdP clients are disabled');
  }

  /**
   * @override
   */
  public async updateClient(
    _ownerUserId: string,
    _clientId: string,
    _input: OAuthClientUpdate
  ): Promise<OAuthClientDetail> {
    throw new Error('OAuth IdP clients are disabled');
  }

  /**
   * @override
   */
  public async rotateClientSecret(
    _ownerUserId: string,
    _clientId: string
  ): Promise<{ clientSecret: string }> {
    throw new Error('OAuth IdP clients are disabled');
  }

  /**
   * @override
   */
  public async deleteClient(
    _ownerUserId: string,
    _clientId: string
  ): Promise<void> {
    throw new Error('OAuth IdP clients are disabled');
  }

  /**
   * @override
   */
  public async verifyClientCredentials(
    _clientId: string,
    _clientSecret: string | undefined
  ): Promise<OAuthClientRow> {
    throw new Error('invalid_client');
  }
}
