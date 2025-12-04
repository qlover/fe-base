import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { LoginInterface } from './LoginInterface';
import { BaseServiceInterface } from './BaseServiceInterface';

export interface LoginServiceInterface<
  Credential,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<Credential>>
> extends LoginInterface<Credential>,
    BaseServiceInterface<Store, LoginInterface<Credential>> {
  getCredential(): Credential | null;
}
