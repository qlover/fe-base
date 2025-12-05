import { LoggerInterface } from '@qlover/logger';
import { AsyncStore, AsyncStoreOptions } from '../../store-state';
import {
  BaseServiceInterface,
  ServiceGatewayType
} from '../interface/base/BaseServiceInterface';
import { ExecutorServiceOptions } from '../interface/base/ExecutorServiceInterface';
import { createStore } from '../../store-state/impl/createStore';

export interface BaseServiceOptions<T, Gateway, Key = string>
  extends ExecutorServiceOptions<T, Gateway>,
    AsyncStoreOptions<T, Key> {}

export class BaseService<
  T,
  Gateway extends ServiceGatewayType,
  Store extends AsyncStore<T, string>
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
    this.store = createStore(options) as Store;
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
