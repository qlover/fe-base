import type { SyncStorageInterface } from '@qlover/fe-corekit';
import { StoreInterface, type StoreStateInterface } from './StoreInterface';

/**
 * Persistent store state interface
 *
 * Extends StoreStateInterface with optional expiration support for persistent storage
 */
export interface PersistentStoreStateInterface extends StoreStateInterface {
  /**
   * Optional expiration timestamp for the stored state
   * Used by storage implementations to determine if the state should be considered expired
   */
  expires?: unknown;
}

/**
 * Abstract persistent store interface
 *
 * Significance: Provides a base class for stores that need to persist state to storage
 * Core idea: Extend StoreInterface with storage synchronization capabilities
 * Main function: Automatically sync state changes to storage and load state from storage
 * Main purpose: Enable state persistence with flexible storage backends
 *
 * @template T - The state type that extends PersistentStoreStateInterface
 * @template Key - The type of keys used in storage (defaults to string)
 * @template Opt - The type of options for storage operations (defaults to unknown)
 *
 * @example
 * ```typescript
 * class MyStoreState implements PersistentStoreStateInterface {
 *   data: string = '';
 * }
 *
 * class MyStore extends PersistentStoreInterface<MyStoreState> {
 *   constructor() {
 *     const storage = new ObjectStorage<string>();
 *     super(() => new MyStoreState(), storage);
 *   }
 *
 *   restore(): MyStoreState | null {
 *     if (!this.storage) return null;
 *     const value = this.storage.getItem('my-state');
 *     return value ? new MyStoreState(value) : null;
 *   }
 *
 *   persist(state?: MyStoreState): void {
 *     if (!this.storage) return;
 *     const stateToPersist = state ?? this.state;
 *     this.storage.setItem('my-state', stateToPersist);
 *   }
 * }
 * ```
 */
export abstract class PersistentStoreInterface<
  T extends PersistentStoreStateInterface,
  Key,
  Opt = unknown
> extends StoreInterface<T> {
  constructor(
    stateFactory: () => T,
    protected readonly storage: SyncStorageInterface<Key, Opt> | null = null
  ) {
    super(stateFactory);
  }

  /**
   * Get the storage instance
   *
   * @returns The storage instance or null if not configured
   */
  public getStorage(): SyncStorageInterface<Key, Opt> | null {
    return this.storage;
  }

  /**
   * Emit state changes and automatically sync to storage
   *
   * @override
   * @param state - The new state to emit
   */
  override emit(state: T): void {
    super.emit(state);
    if (this.storage) {
      this.persist(state);
    }
  }

  /**
   * Restore state from storage and merge with current state
   *
   * This method should be implemented by subclasses to define how state is restored from storage.
   * It will be called when the store needs to restore state from persistent storage.
   *
   * If storage is not configured, this method should return null.
   *
   */
  abstract restore<R = unknown>(): R | void;

  /**
   * Persist current state to storage
   *
   * This method should be implemented by subclasses to define how state is persisted to storage.
   * It will be called automatically when state changes via emit() (only if storage is configured).
   *
   * If storage is not configured, this method should do nothing.
   *
   * @param state - optional state to persist, defaults to current state
   * @returns void - persisting is a side effect operation
   */
  abstract persist(state?: T): void;
}
