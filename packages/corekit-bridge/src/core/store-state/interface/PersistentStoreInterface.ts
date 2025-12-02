import { KeyStorageInterface } from '@qlover/fe-corekit';
import { clone } from '../clone';
import { StoreInterface, StoreStateInterface } from './StoreInterface';

export interface PersistentStoreStateInterface extends StoreStateInterface {
  expires?: unknown;
}

export abstract class PersistentStoreInterface<
  T extends PersistentStoreStateInterface,
  Key
> extends StoreInterface<T> {
  constructor(
    stateFactory: () => T,
    protected readonly storage: KeyStorageInterface<Key, T> | null = null
  ) {
    super(stateFactory);
  }

  /**
   * Load state from storage and merge with current state
   *
   * @returns T - the current state after loading from storage
   */
  storage2store(): T {
    if (!this.storage) {
      return this.state;
    }

    const storedValue = this.storage.get();
    if (storedValue == null) {
      return this.state;
    }

    // Clone current state and merge with stored value
    const mergedState = Object.assign(clone(this.state), storedValue);
    this.emit(mergedState);
    return this.state;
  }

  /**
   * Save current state to storage (synchronous version, kept for backward compatibility)
   *
   * @param state - optional state to save, defaults to current state
   */
  store2storage(state?: T): void {
    if (!this.storage) {
      return;
    }

    const stateToSave = state ?? this.state;
    this.storage.set(stateToSave, { expires: stateToSave.expires });
  }

  getStorage(): KeyStorageInterface<Key, T> | null {
    return this.storage;
  }

  override emit(state: T): void {
    super.emit(state);
    this.store2storage(state);
  }
}
