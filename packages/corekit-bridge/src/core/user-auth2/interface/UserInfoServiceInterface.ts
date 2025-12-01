import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { UserInfoInterface } from './base/UserInfoInterface';

export interface UserInfoServiceInterface<
  User,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<User>>
> extends UserInfoInterface<User> {
  getStore(): Store;
  getGateway(): UserInfoInterface<User> | null;
  getUser(): User | null;
}
