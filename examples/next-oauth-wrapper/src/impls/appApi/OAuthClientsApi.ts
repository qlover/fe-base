import { inject } from '@shared/container';
import type {
  OAuthClientListItem,
  OAuthClientDetail,
  OAuthClientCreate,
  OAuthClientUpdate,
  OAuthClientCreateResponse,
  OAuthClientSecretRotateResponse
} from '@qlover/oauth-wrapper';
import type { AppApiSuccessInterface } from '@interfaces/AppApiInterface';
import { AppApiRequester } from './AppApiRequester';

export class OAuthClientsApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  /**
   * List all OAuth clients for current user
   */
  public async list(): Promise<OAuthClientListItem[]> {
    const response = await this.appApiRequester.get('/api/clients');
    const envelope = response.data as AppApiSuccessInterface<
      OAuthClientListItem[]
    >;
    return envelope.data ?? [];
  }

  /**
   * Get OAuth client details
   */
  public async get(clientId: string): Promise<OAuthClientDetail> {
    const response = await this.appApiRequester.get(`/api/clients/${clientId}`);
    const envelope = response.data as AppApiSuccessInterface<OAuthClientDetail>;
    return envelope.data!;
  }

  /**
   * Create a new OAuth client
   */
  public async create(
    input: OAuthClientCreate
  ): Promise<OAuthClientCreateResponse> {
    const response = await this.appApiRequester.post('/api/clients', input);
    const envelope =
      response.data as AppApiSuccessInterface<OAuthClientCreateResponse>;
    return envelope.data!;
  }

  /**
   * Update an OAuth client
   */
  public async update(
    clientId: string,
    input: OAuthClientUpdate
  ): Promise<OAuthClientDetail> {
    const response = await this.appApiRequester.put(
      `/api/clients/${clientId}`,
      input
    );
    const envelope = response.data as AppApiSuccessInterface<OAuthClientDetail>;
    return envelope.data!;
  }

  /**
   * Delete an OAuth client
   */
  public async delete(clientId: string): Promise<void> {
    await this.appApiRequester.delete(`/api/clients/${clientId}`);
  }

  /**
   * Rotate client secret
   */
  public async rotateSecret(
    clientId: string
  ): Promise<OAuthClientSecretRotateResponse> {
    const response = await this.appApiRequester.post(
      `/api/clients/${clientId}/rotate-secret`
    );
    const envelope =
      response.data as AppApiSuccessInterface<OAuthClientSecretRotateResponse>;
    return envelope.data!;
  }
}
