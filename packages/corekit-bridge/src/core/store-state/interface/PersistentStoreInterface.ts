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
   *
   * - number: Unix timestamp in milliseconds
   * - Date: Date object representing expiration time
   * - null: Explicitly no expiration
   */
  expires?: number | Date | null;
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
 * @template Key - The type of keys used in storage (e.g., string, number, symbol, or custom types)
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
 *     try {
 *       const value = this.storage.getItem('my-state');
 *       return value ? new MyStoreState(value) : null;
 *     } catch {
 *       return null;
 *     }
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
    protected readonly storage: SyncStorageInterface<Key, Opt> | null = null,
    initRestore: boolean = true
  ) {
    super(stateFactory);

    if (initRestore) {
      this.restore();
    }
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
   * @param options - Optional configuration for emit behavior
   * @param options.persist - Whether to persist state to storage (default: true)
   *                          Set to false to skip persistence, useful during restore operations
   *
   * Note: If persist fails (e.g., storage quota exceeded, permission denied),
   * the state update will still succeed, but the persistence will be silently ignored.
   * Subclasses can override this behavior if needed.
   *
   * @example
   * ```typescript
   * // Normal emit with automatic persistence
   * this.emit(newState);
   *
   * // Emit without persistence (e.g., during restore)
   * this.emit(restoredState, { persist: false });
   * ```
   */
  override emit(state: T, options?: { persist?: boolean }): void {
    super.emit(state);

    const shouldPersist = options?.persist !== false && this.storage;
    if (!shouldPersist) {
      return;
    }

    try {
      this.persist(state);
    } catch {
      // Silently ignore persistence errors to prevent state update failures
      // Subclasses can override this method to handle errors differently if needed
    }
  }

  /**
   * Restore state from storage and merge with current state
   *
   * This method should be implemented by subclasses to define how state is restored from storage.
   * It will be called when the store needs to restore state from persistent storage.
   *
   * If storage is not configured or no state is found, this method should return null.
   * If restoration succeeds, return the restored state of type R.
   *
   * Note: If you need to update the state during restore, you can call emit() with
   * { persist: false } option to update state without triggering automatic persistence.
   *
   * @template R - The type of restored state (defaults to T)
   * @returns The restored state or null if not available
   *
   * @example
   * ```typescript
   * restore(): MyStoreState | null {
   *   if (!this.storage) return null;
   *   try {
   *     const value = this.storage.getItem('my-state');
   *     if (value) {
   *       const restoredState = new MyStoreState(value);
   *       // Update state without triggering persist
   *       this.emit(restoredState, { persist: false });
   *       return restoredState;
   *     }
   *   } catch {
   *     return null;
   *   }
   *   return null;
   * }
   * ```
   */
  abstract restore<R = T>(): R | null;

  /**
   * Persist current state to storage
   *
   * This method should be implemented by subclasses to define how state is persisted to storage.
   * It will be called automatically when state changes via emit() (only if storage is configured).
   *
   * If storage is not configured, this method should do nothing.
   *
   * Note: This method may throw errors (e.g., storage quota exceeded, permission denied).
   * The emit() method will catch these errors to prevent state update failures, but subclasses
   * can override emit() to handle errors differently if needed.
   *
   * @param state - optional state to persist, defaults to current state
   * @returns void - persisting is a side effect operation
   * @throws May throw errors if storage operations fail
   */
  abstract persist(state?: T): void;
}
