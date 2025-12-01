import {
  AsyncStore,
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';

export interface BaseGatewayServiceOptions<T, Gateway> {
  /**
   * Store instance for the service
   *
   * @default `AsyncStore<T, string>`
   */
  store?: AsyncStoreInterface<AsyncStoreStateInterface<T>>;

  /**
   * Gateway instance for the service
   * @default `null`
   */
  gateway?: Gateway;
}

export abstract class BaseGatewayService<
  T,
  Gateway,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<T>> = AsyncStore<
    T,
    string
  >
> {
  protected readonly store: Store;
  protected readonly gateway: Gateway | null = null;

  constructor(options?: BaseGatewayServiceOptions<T, Gateway>) {
    const targetStore = options?.store ?? new AsyncStore<T, string>();
    this.store = targetStore as Store;
    this.gateway = options?.gateway ?? null;
  }

  getStore(): typeof this.store {
    return this.store;
  }

  getResult(): T | null {
    return this.store.getState().result;
  }

  getGateway(): Gateway | null {
    return this.gateway;
  }

  executeGateway<Params, Result>(
    task: () => Promise<Result>
  ): Promise<Result> {}
}
