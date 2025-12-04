import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';

export interface BaseServiceInterface<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<any>>,
  Gateway
> {
  readonly serviceName: string;

  getStore(): Store;
  getGateway(): Gateway | null;
}
