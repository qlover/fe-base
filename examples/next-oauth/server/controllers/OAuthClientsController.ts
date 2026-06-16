import { OAuthClientsService } from '@qlover/oauth-wrapper';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { ServerAuthInterface } from '@server/interfaces/ServerAuthInterface';
import { OAuthUserService } from '@server/services/OAuthUserService';
import type {
  OAuthClientCreate,
  OAuthClientCreateResponse,
  OAuthClientDetail,
  OAuthClientListItem,
  OAuthClientSecretRotateResponse,
  OAuthClientUpdate
} from '@qlover/oauth-wrapper';

/**
 * Developer console OAuth clients API controller.
 *
 * Manages OAuth client applications for developers.
 */
@injectable()
export class OAuthClientsController {
  protected clientsService: OAuthClientsService;

  constructor(
    @inject(OAuthUserService) protected userService: ServerAuthInterface,
    @inject(I.OAuthWrapperProviderInterface)
    oauthProvider: OAuthWrapperProviderInterface
  ) {
    this.clientsService = new OAuthClientsService(oauthProvider.getOAuthRepo());
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
  protected async requireOwnerUserId(): Promise<string> {
    await this.userService.throwIfNotAuth();
    const user = await this.userService.getUser();

    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const ownerId = String(user.id).trim();
    if (!ownerId) {
      throw new Error('User not authenticated');
    }

    return ownerId;
  }
}
