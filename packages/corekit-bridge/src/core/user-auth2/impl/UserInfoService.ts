import {
  AsyncStore,
  type AsyncStoreInterface,
  type AsyncStoreStateInterface
} from '../../store-state';
import { AsyncStoreState } from '../../store-state/impl/AsyncStoreState';
import type { UserInfoInterface } from '../interface/base/UserInfoInterface';
import type { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';

export class UserInfoService<
  User,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<User>>
> implements UserInfoServiceInterface<User, Store>
{
  protected readonly store: Store;
  constructor(
    store?: Store,
    protected readonly gateway: UserInfoInterface<User> | null = null
  ) {
    const targetStore: AsyncStoreInterface<AsyncStoreStateInterface<User>> =
      store ??
      // use default store if no store is provided
      new AsyncStore<User, string>(() => new AsyncStoreState<User>());

    this.store = targetStore as Store;
  }

  getStore(): Store {
    return this.store;
  }

  getGateway(): UserInfoInterface<User> | null {
    return this.gateway;
  }

  getUser(): User | null {
    return this.store.getState().result;
  }

  async getUserInfo<Params>(params?: Params): Promise<User> {
    if (!this.gateway) {
      return Promise.resolve({} as User);
    }

    this.store.start();

    try {
      const result = await this.gateway.getUserInfo(params);
      this.store.success(result);

      return result;
    } catch (error) {
      this.store.failed(error);
      throw error;
    }
  }

  async refreshUserInfo<Params>(params?: Params): Promise<User> {
    return this.getUserInfo(params);
  }
}
