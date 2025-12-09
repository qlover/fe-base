import { SyncStorageInterface } from '@qlover/fe-corekit';
import { StoreStateInterface } from './StoreInterface';

/**
 * Persistent store interface
 *
 * - Significance: Defines the contract for stores that need to persist state to storage
 * - Core idea: Provides a unified interface for state persistence with flexible storage backends
 * - Main function: Enables state restoration from storage and state persistence to storage
 * - Main purpose: Support state persistence across page reloads and sessions
 *
 * Core features:
 * - Storage access: Get underlying storage interface for direct storage operations
 * - State restoration: Load state from storage during initialization or on demand
 * - State persistence: Save state to storage automatically or manually
 * - Flexible storage: Support any `SyncStorageInterface` implementation (localStorage, sessionStorage, cookies, etc.)
 * - Type safety: Generic type parameters ensure type safety for state and storage keys
 *
 * Design decisions:
 * - Storage is optional: `getStorage()` can return `null` to support stores without persistence
 * - Generic restore type: `restore()` supports returning a different type `R` (defaults to `T`) for flexibility
 * - Optional state parameter: `persist()` accepts optional state parameter, defaults to current state
 * - State type constraint: `persist()` state parameter must extend `T` to ensure type safety
 *
 * Implementation pattern:
 * - Typically implemented by classes that extend `StoreInterface`
 * - Storage operations should handle errors gracefully (e.g., return `null` on failure)
 * - `restore()` should not trigger persistence to avoid circular updates
 * - `persist()` should handle storage unavailability gracefully (no-op if storage is `null`)
 *
 * @since 1.8.0
 * @template T - The state type that needs to be persisted
 * @template Key - The type of keys used in storage (e.g., `string`, `number`, `symbol`, or custom types)
 * @template Opt - The type of options for storage operations (defaults to `unknown`)
 *
 * @example Basic usage
 * ```typescript
 * class MyStoreState implements StoreStateInterface {
 *   data: string = '';
 * }
 *
 * class MyStore extends StoreInterface<MyStoreState>
 *   implements PersistentStoreInterface<MyStoreState, string> {
 *   private readonly storageKey = 'my-state';
 *
 *   constructor(storage: SyncStorageInterface<string> | null = null) {
 *     super(() => new MyStoreState());
 *     this.storage = storage;
 *   }
 *
 *   private storage: SyncStorageInterface<string> | null;
 *
 *   getStorage(): SyncStorageInterface<string> | null {
 *     return this.storage;
 *   }
 *
 *   restore(): MyStoreState | null {
 *     if (!this.storage) return null;
 *     try {
 *       const value = this.storage.getItem(this.storageKey);
 *       if (value) {
 *         const restoredState = new MyStoreState();
 *         Object.assign(restoredState, value);
 *         // Update state without triggering persist
 *         this.emit(restoredState, { persist: false });
 *         return restoredState;
 *       }
 *     } catch {
 *       return null;
 *     }
 *     return null;
 *   }
 *
 *   persist(state?: MyStoreState): void {
 *     if (!this.storage) return;
 *     const stateToPersist = state ?? this.state;
 *     this.storage.setItem(this.storageKey, stateToPersist);
 *   }
 * }
 * ```
 *
 * @example With expiration support (optional)
 * ```typescript
 * // State interface defines expiration field if needed
 * class ExpiringStoreState implements StoreStateInterface {
 *   data: string = '';
 *   expires?: number | Date | null; // Optional expiration support
 * }
 *
 * class ExpiringStore extends StoreInterface<ExpiringStoreState>
 *   implements PersistentStoreInterface<ExpiringStoreState, string> {
 *   restore(): ExpiringStoreState | null {
 *     if (!this.storage) return null;
 *     try {
 *       const stored = this.storage.getItem('expiring-state');
 *       if (stored) {
 *         const state = new ExpiringStoreState();
 *         Object.assign(state, stored);
 *
 *         // Check expiration if present
 *         if (state.expires) {
 *           const expiresAt =
 *             typeof state.expires === 'number'
 *               ? state.expires
 *               : state.expires.getTime();
 *           if (Date.now() > expiresAt) {
 *             // State expired, remove from storage
 *             this.storage.removeItem('expiring-state');
 *             return null;
 *           }
 *         }
 *
 *         this.emit(state, { persist: false });
 *         return state;
 *       }
 *     } catch {
 *       return null;
 *     }
 *     return null;
 *   }
 *
 *   persist(state?: ExpiringStoreState): void {
 *     if (!this.storage) return;
 *     const stateToPersist = state ?? this.state;
 *     this.storage.setItem('expiring-state', stateToPersist);
 *   }
 * }
 * ```
 */
export interface PersistentStoreInterface<
  T extends StoreStateInterface,
  Key,
  Opt = unknown
> {
  /**
   * Get the underlying storage interface
   *
   * Returns the storage interface instance used for persistence operations.
   * This allows direct access to storage for custom operations or inspection.
   *
   * Returns `null` if:
   * - Store is configured without persistence
   * - Storage is not available (e.g., in environments without storage support)
   * - Storage has been explicitly disabled
   *
   * Use cases:
   * - Direct storage operations (e.g., checking if a key exists)
   * - Custom persistence logic
   * - Storage inspection and debugging
   * - Conditional persistence based on storage availability
   *
   * @returns The storage interface instance, or `null` if storage is not available
   *
   * @example Check storage availability
   * ```typescript
   * const storage = store.getStorage();
   * if (storage) {
   *   console.log('Storage is available');
   *   // Perform custom storage operations
   *   storage.removeItem('old-key');
   * }
   * ```
   *
   * @example Direct storage access
   * ```typescript
   * const storage = store.getStorage();
   * if (storage) {
   *   const hasKey = storage.getItem('my-key') !== null;
   *   console.log('Key exists:', hasKey);
   * }
   * ```
   */
  getStorage(): SyncStorageInterface<Key, Opt> | null;

  /**
   * Restore state from storage
   *
   * Loads state from the underlying storage and returns it. This method is typically
   * called during store initialization to restore previously persisted state.
   *
   * Behavior:
   * - Returns `null` if storage is not available or restore fails
   * - Returns `null` if no persisted state exists in storage
   * - Returns restored state object if successful
   * - Should NOT trigger persistence to avoid circular updates
   * - Should handle storage errors gracefully (catch and return `null`)
   *
   * Type flexibility:
   * - Supports returning a different type `R` (defaults to `T`)
   * - Useful when restoring partial state or transformed state
   * - Type `R` must be compatible with the expected return type
   *
   * Implementation notes:
   * - Should create a new state instance and copy properties from stored data
   * - Should validate restored data before returning (e.g., check expiration)
   * - Should handle malformed or corrupted storage data gracefully
   * - Should not modify storage during restore operation
   *
   * @template R - The return type (defaults to `T`)
   *
   * @returns Restored state object, or `null` if:
   *   - Storage is not available
   *   - No persisted state exists
   *   - Restore operation fails
   *   - State has expired (if expiration is supported)
   *
   * @example Basic restore
   * ```typescript
   * const store = new MyStore(storage);
   * const restoredState = store.restore();
   * if (restoredState) {
   *   console.log('State restored:', restoredState);
   * } else {
   *   console.log('No persisted state found');
   * }
   * ```
   *
   * @example Restore with type casting
   * ```typescript
   * interface PartialState {
   *   data?: string;
   * }
   *
   * const partialState = store.restore<PartialState>();
   * if (partialState) {
   *   console.log('Partial state restored:', partialState.data);
   * }
   * ```
   *
   * @example Restore during initialization
   * ```typescript
   * class MyStore extends StoreInterface<MyStoreState>
   *   implements PersistentStoreInterface<MyStoreState, string> {
   *   constructor(storage: SyncStorageInterface<string> | null = null) {
   *     super(() => new MyStoreState());
   *     this.storage = storage;
   *     // Restore state after initialization
   *     this.restore();
   *   }
   * }
   * ```
   */
  restore<R = T>(): R | null;

  /**
   * Persist state to storage
   *
   * Saves the current state or provided state to the underlying storage.
   * This method is typically called automatically when state changes, but can
   * also be called manually to force persistence.
   *
   * Behavior:
   * - No-op if storage is not available (`getStorage()` returns `null`)
   * - Persists provided state if given, otherwise persists current state
   * - Should handle storage errors gracefully (silently fail or log error)
   * - Should not throw errors that would prevent state updates
   *
   * Type safety:
   * - State parameter must extend `T` to ensure type compatibility
   * - TypeScript will enforce this constraint at compile time
   * - Allows persisting partial states or transformed states safely
   *
   * Implementation notes:
   * - Should serialize state appropriately for storage (JSON.stringify if needed)
   * - Should handle storage quota exceeded errors gracefully
   * - Should not block state updates if persistence fails
   * - Can be called with `undefined` to persist current state explicitly
   *
   * @template S - The type of state to persist (must extend `T`)
   *
   * @param state - Optional state to persist
   *   If provided, persists the given state object
   *   If `undefined` or omitted, persists the current state
   *   @optional
   *
   * @example Persist current state
   * ```typescript
   * // Persist current state (state parameter omitted)
   * store.persist();
   * ```
   *
   * @example Persist specific state
   * ```typescript
   * const newState = { data: 'updated' };
   * store.persist(newState);
   * ```
   *
   * @example Manual persistence after batch updates
   * ```typescript
   * // Perform multiple state updates
   * store.updateField1('value1');
   * store.updateField2('value2');
   * store.updateField3('value3');
   *
   * // Persist once after all updates
   * store.persist();
   * ```
   *
   * @example Persist with type safety
   * ```typescript
   * interface ExtendedState extends MyStoreState {
   *   extra: string;
   * }
   *
   * const extendedState: ExtendedState = {
   *   ...store.state,
   *   extra: 'additional data'
   * };
   *
   * // Type-safe persistence
   * store.persist(extendedState);
   * ```
   */
  persist<S extends T>(state?: S): void;
}
