import type {
  OAuthClientCreate,
  OAuthClientCreateResponse,
  OAuthClientDetail,
  OAuthClientListItem,
  OAuthClientSecretRotateResponse,
  OAuthClientUpdate
} from '../schema/OAuthAuthorizeSchema';

export interface OAuthClientsInterface {
  listForOwner(ownerUserId: string): Promise<OAuthClientListItem[]>;
  getByClientId(
    ownerUserId: string,
    clientId: string
  ): Promise<OAuthClientDetail>;
  create(
    ownerUserId: string,
    input: OAuthClientCreate
  ): Promise<OAuthClientCreateResponse>;

  update(
    ownerUserId: string,
    clientId: string,
    input: OAuthClientUpdate
  ): Promise<OAuthClientDetail>;

  rotateSecret(
    ownerUserId: string,
    clientId: string
  ): Promise<OAuthClientSecretRotateResponse>;

  delete(ownerUserId: string, clientId: string): Promise<void>;
}
