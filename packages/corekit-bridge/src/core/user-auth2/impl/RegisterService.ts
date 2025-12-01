import {
  AsyncStore,
  type AsyncStoreInterface,
  type AsyncStoreStateInterface
} from '../../store-state';
import type { RegisterInterface } from '../interface/base/RegisterInterface';
import type { RegisterServiceInterface } from '../interface/RegisterServiceInterface';

export class RegisterService<
  Result,
  Store extends AsyncStoreInterface<
    AsyncStoreStateInterface<Result>
  > = AsyncStore<Result, string>
> implements RegisterServiceInterface<Result, Store>
{
  protected readonly store: Store;
  constructor(
    store?: Store,
    protected readonly gateway: RegisterInterface<Result> | null = null
  ) {
    const targetStore: AsyncStoreInterface<AsyncStoreStateInterface<Result>> =
      store ??
      // use default store if no store is provided
      new AsyncStore<Result, string>();

    this.store = targetStore as Store;
  }

  getStore(): Store {
    return this.store;
  }

  getGateway(): RegisterInterface<Result> | null {
    return this.gateway;
  }

  getUser(): Result | null {
    return this.store.getState().result;
  }

  async register<Params>(params: Params): Promise<Result> {
    if (!this.gateway) {
      return Promise.resolve({} as Result);
    }

    this.store.start();

    try {
      const result = await this.gateway.register(params);
      this.store.success(result);

      return result;
    } catch (error) {
      this.store.failed(error);
      throw error;
    }
  }
}
