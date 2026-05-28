import type { OAuthClientsInterface } from '../interfaces/OAuthClientsInterface';
import type { OAuthClientsRepositoryInterface } from '../interfaces/OAuthClientsRepositoryInterface';
import type {
  OAuthClientListItem,
  OAuthClientDetail,
  OAuthClientRow,
  OAuthClientCreate,
  OAuthClientUpdate,
  OAuthClientCreateResponse,
  OAuthClientSecretRotateResponse
} from '../schema/OAuthAuthorizeSchema';

/**
 * Business logic for OAuth client management in developer console.
 */
export class OAuthClientsService implements OAuthClientsInterface {
  constructor(protected clientsRepo: OAuthClientsRepositoryInterface) {}

  /**
   * List all OAuth clients owned by a user
   * @override
   */
  public async listForOwner(
    ownerUserId: number
  ): Promise<OAuthClientListItem[]> {
    return this.clientsRepo.listClientByOwner(ownerUserId);
  }

  /**
   * Get detailed information about a specific OAuth client
   * @override
   */
  public async getByClientId(
    ownerUserId: number,
    clientId: string
  ): Promise<OAuthClientDetail> {
    const client = await this.clientsRepo.findClientById(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    if (client.owner_user_id !== ownerUserId) {
      throw new Error('Access denied');
    }

    return this.mapToDetail(client);
  }

  /**
   * Create a new OAuth client
   * @override
   */
  public async create(
    ownerUserId: number,
    input: OAuthClientCreate
  ): Promise<OAuthClientCreateResponse> {
    const result = await this.clientsRepo.createClient(ownerUserId, input);

    return {
      client_id: result.client.client_id,
      client_secret: result.clientSecret,
      confidential: result.client.confidential,
      client_name: result.client.client_name,
      client_uri: result.client.client_uri,
      redirect_uris: result.client.redirect_uris,
      created_at: result.client.created_at
    };
  }

  /**
   * Update an existing OAuth client
   * @override
   */
  public async update(
    ownerUserId: number,
    clientId: string,
    input: OAuthClientUpdate
  ): Promise<OAuthClientDetail> {
    // Verify ownership first
    const existing = await this.clientsRepo.findClientById(clientId);
    if (!existing) {
      throw new Error('Client not found');
    }
    if (existing.owner_user_id !== ownerUserId) {
      throw new Error('Access denied');
    }

    return this.clientsRepo.updateClient(ownerUserId, clientId, input);
  }

  /**
   * Rotate the client secret
   * @override
   */
  public async rotateSecret(
    ownerUserId: number,
    clientId: string
  ): Promise<OAuthClientSecretRotateResponse> {
    // Verify ownership first
    const existing = await this.clientsRepo.findClientById(clientId);
    if (!existing) {
      throw new Error('Client not found');
    }
    if (existing.owner_user_id !== ownerUserId) {
      throw new Error('Access denied');
    }
    if (!existing.confidential) {
      throw new Error('Public clients do not have a client_secret');
    }

    const result = await this.clientsRepo.rotateClientSecret(
      ownerUserId,
      clientId
    );

    return {
      client_id: clientId,
      client_secret: result.clientSecret
    };
  }

  /**
   * Delete an OAuth client
   * @override
   */
  public async delete(ownerUserId: number, clientId: string): Promise<void> {
    // Verify ownership first
    const existing = await this.clientsRepo.findClientById(clientId);
    if (!existing) {
      throw new Error('Client not found');
    }
    if (existing.owner_user_id !== ownerUserId) {
      throw new Error('Access denied');
    }

    await this.clientsRepo.deleteClient(ownerUserId, clientId);
  }

  private mapToDetail(row: OAuthClientRow): OAuthClientDetail {
    return {
      client_id: row.client_id,
      client_name: row.client_name,
      client_uri: row.client_uri,
      logo_uri: row.logo_uri,
      redirect_uris: row.redirect_uris,
      grant_types: row.grant_types,
      scopes: row.scopes,
      confidential: row.confidential,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
