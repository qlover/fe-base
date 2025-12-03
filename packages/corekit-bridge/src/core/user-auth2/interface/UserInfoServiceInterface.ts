import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { UserInfoInterface } from './UserInfoInterface';
import { BaseServiceInterface } from './BaseServiceInterface';

export interface UserInfoGetter<User> {
  getUser(): User | null;
}

export interface UserInfoServiceInterface<
  User,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<User>>
> extends UserInfoInterface<User>,
    BaseServiceInterface<Store, UserInfoInterface<User>>,
    UserInfoGetter<User> {}
