import { LoggerInterface } from '@qlover/logger';
import {
  AsyncStoreInterface,
  AsyncStoreOptions,
  AsyncStoreStateInterface
} from '../../store-state';
import {
  BaseServiceInterface,
  ServiceGatewayType
} from '../interface/base/BaseServiceInterface';
import { ExecutorServiceOptions } from '../interface/base/ExecutorServiceInterface';
import { createAsyncStore } from '../../store-state/impl/createAsyncStore';

export interface BaseServiceOptions<T, Gateway, Key = string>
  extends ExecutorServiceOptions<T, Gateway>,
    AsyncStoreOptions<AsyncStoreStateInterface<T>, Key> {}

export class BaseService<
  T,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<T>>,
  Gateway extends ServiceGatewayType
> implements BaseServiceInterface<Store, Gateway>
{
  readonly serviceName: string | symbol;
  protected readonly gateway?: Gateway;
  protected readonly logger?: LoggerInterface;
  protected readonly store: Store;

  constructor(options: BaseServiceOptions<T, Gateway, string>) {
    this.serviceName = options.serviceName;
    this.gateway = options.gateway;
    this.logger = options.logger;
    this.store = createAsyncStore(options.store) as Store;
  }

  getStore(): Store {
    return this.store;
  }

  getGateway(): Gateway | undefined {
    return this.gateway;
  }

  getLogger(): LoggerInterface | undefined {
    return this.logger;
  }
}
