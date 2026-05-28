import { inject, injectable } from '@shared/container';
import { OAuthClientsService } from '@shared/oauth-wrapper';
import type {
  OAuthClientCreate,
  OAuthClientCreateResponse,
  OAuthClientDetail,
  OAuthClientListItem,
  OAuthClientSecretRotateResponse,
  OAuthClientUpdate,
  OAuthClientsRepositoryInterface
} from '@shared/oauth-wrapper';
import { DemoOAuthRepository } from '@server/demo-oauth';
import type { ServerAuthInterface } from '@server/interfaces/ServerAuthInterface';
import { ServerAuth } from '@server/services/ServerAuth';

/**
 * Developer console OAuth clients API controller.
 *
 * Manages OAuth client applications for developers.
 */
@injectable()
export class OAuthClientsController {
  protected clientsService: OAuthClientsService;

  constructor(
    @inject(ServerAuth) protected serverAuth: ServerAuthInterface,
    @inject(DemoOAuthRepository)
    protected oauthRepo: OAuthClientsRepositoryInterface
  ) {
    this.clientsService = new OAuthClientsService(oauthRepo);
  }

  /**
   * List all OAuth clients owned by the current user
   */
  public async list(): Promise<OAuthClientListItem[]> {
    const ownerId = await this.requireOwnerUserId();
    return this.clientsService.listForOwner(ownerId);
  }

  /**
   * Create a new OAuth client
   */
  public async create(
    body: OAuthClientCreate
  ): Promise<OAuthClientCreateResponse> {
    const ownerId = await this.requireOwnerUserId();
    return this.clientsService.create(ownerId, body);
  }

  /**
   * Get detailed information about a specific OAuth client
   */
  public async get(clientId: string): Promise<OAuthClientDetail> {
    const ownerId = await this.requireOwnerUserId();
    return this.clientsService.getByClientId(ownerId, clientId);
  }

  /**
   * Update an existing OAuth client
   */
  public async update(
    clientId: string,
    body: OAuthClientUpdate
  ): Promise<OAuthClientDetail> {
    const ownerId = await this.requireOwnerUserId();
    return this.clientsService.update(ownerId, clientId, body);
  }

  /**
   * Rotate the client secret
   */
  public async rotateSecret(
    clientId: string
  ): Promise<OAuthClientSecretRotateResponse> {
    const ownerId = await this.requireOwnerUserId();
    return this.clientsService.rotateSecret(ownerId, clientId);
  }

  /**
   * Delete an OAuth client
   */
  public async remove(clientId: string): Promise<void> {
    const ownerId = await this.requireOwnerUserId();
    return this.clientsService.delete(ownerId, clientId);
  }

  /**
   * Resolves owner id from the authenticated session user.
   */
  protected async requireOwnerUserId(): Promise<number> {
    await this.serverAuth.throwIfNotAuth();
    const user = await this.serverAuth.getUser();

    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const ownerId = Number(user.id);
    if (!Number.isFinite(ownerId)) {
      throw new Error('User not authenticated');
    }

    return ownerId;
  }
}
