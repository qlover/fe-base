import type {
  OAuthClientCreate,
  OAuthClientCreateResponse,
  OAuthClientDetail,
  OAuthClientListItem,
  OAuthClientSecretRotateResponse,
  OAuthClientUpdate
} from '../schema/OAuthAuthorizeSchema';

export interface OAuthClientsInterface {
  listForOwner(ownerUserId: number): Promise<OAuthClientListItem[]>;
  getByClientId(
    ownerUserId: number,
    clientId: string
  ): Promise<OAuthClientDetail>;
  create(
    ownerUserId: number,
    input: OAuthClientCreate
  ): Promise<OAuthClientCreateResponse>;

  update(
    ownerUserId: number,
    clientId: string,
    input: OAuthClientUpdate
  ): Promise<OAuthClientDetail>;

  rotateSecret(
    ownerUserId: number,
    clientId: string
  ): Promise<OAuthClientSecretRotateResponse>;

  delete(ownerUserId: number, clientId: string): Promise<void>;
}
