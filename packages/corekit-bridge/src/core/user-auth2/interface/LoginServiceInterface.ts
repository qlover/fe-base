import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { LoginInterface } from './base/LoginInterface';

export interface LoginServiceInterface<
  Credential,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<Credential>>
> extends LoginInterface<Credential> {
  getStore(): Store;
  getGateway(): LoginInterface<Credential> | null;

  getCredential(): Credential | null;
}
