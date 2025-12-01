import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { RegisterInterface } from './base/RegisterInterface';

export interface RegisterServiceInterface<
  Result,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<Result>>
> extends RegisterInterface<Result> {
  getStore(): Store;
  getGateway(): RegisterInterface<Result> | null;

  getUser(): Result | null;
}
