import { KeyStorageInterface } from '@qlover/fe-corekit';
import { StoreInterface, StoreStateInterface } from './StoreInterface';

export interface PersistentStoreStateInterface extends StoreStateInterface {
  expires?: unknown;
}

export class PersistentStoreInterface<
  T extends PersistentStoreStateInterface,
  Key
> extends StoreInterface<T> {
  constructor(
    stateFactory: () => T,
    protected readonly storage: KeyStorageInterface<Key, T>
  ) {
    super(() => this.storage.get() ?? stateFactory());
  }

  getStorage(): KeyStorageInterface<Key, T> {
    return this.storage;
  }

  override emit(state: T): void {
    super.emit(state);
    this.storage.set(state, { expires: state.expires });
  }
}
