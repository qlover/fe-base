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

  listClientByOwner(ownerUserId: number): Promise<OAuthClientListItem[]>;

  createClient(
    ownerUserId: number,
    input: OAuthClientCreate
  ): Promise<{ client: OAuthClientRow; clientSecret?: string }>;

  updateClient(
    ownerUserId: number,
    clientId: string,
    input: OAuthClientUpdate
  ): Promise<OAuthClientDetail>;

  rotateClientSecret(
    ownerUserId: number,
    clientId: string
  ): Promise<{ clientSecret: string }>;

  deleteClient(ownerUserId: number, clientId: string): Promise<void>;

  verifyClientCredentials(
    clientId: string,
    clientSecret: string | undefined
  ): Promise<OAuthClientRow>;
}
