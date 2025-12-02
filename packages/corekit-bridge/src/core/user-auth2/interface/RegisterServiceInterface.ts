import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { RegisterInterface } from './base/RegisterInterface';
import { BaseServiceInterface } from './BaseServiceInterface';
import { UserInfoGetter } from './UserInfoServiceInterface';

export interface RegisterServiceInterface<
  User,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<User>>
> extends RegisterInterface<User>,
    BaseServiceInterface<Store, RegisterInterface<User>>,
    UserInfoGetter<User> {}
