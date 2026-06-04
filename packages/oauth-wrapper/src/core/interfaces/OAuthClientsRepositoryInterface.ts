import type {
  OAuthClientRow,
  OAuthClientListItem,
  OAuthClientDetail,
  OAuthClientCreate,
  OAuthClientUpdate
} from '../schema/OAuthAuthorizeSchema';

/**
 * Reads and manages registered OAuth clients from Supabase (service role).
 */
export interface OAuthClientsRepositoryInterface {
  findClientById(clientId: string): Promise<OAuthClientRow | null>;

  listClientByOwner(ownerUserId: string): Promise<OAuthClientListItem[]>;

  createClient(
    ownerUserId: string,
    input: OAuthClientCreate
  ): Promise<{ client: OAuthClientRow; clientSecret?: string }>;

  updateClient(
    ownerUserId: string,
    clientId: string,
    input: OAuthClientUpdate
  ): Promise<OAuthClientDetail>;

  rotateClientSecret(
    ownerUserId: string,
    clientId: string
  ): Promise<{ clientSecret: string }>;

  deleteClient(ownerUserId: string, clientId: string): Promise<void>;

  verifyClientCredentials(
    clientId: string,
    clientSecret: string | undefined
  ): Promise<OAuthClientRow>;
}
