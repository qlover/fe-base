import type { StorageInterface } from '@qlover/fe-corekit';
import type {
  StoreStateInterface,
  StoreUpdateValue
} from '../interface/StoreInterface';
import type { PersistentInterface } from '../interface/PersistentInterface';

/**
 * Abstract persistent store interface
 *
 * - Significance: Provides a base class for stores that need to persist state to storage
 * - Core idea: Pair persistence hooks (`restore` / `persist`) with a subclass-defined `update()` path
 *   (see {@link AsyncStore}, which forwards to a composed {@link StoreInterface})
 * - Main function: Automatically sync state changes to storage and load state from storage
 * - Main purpose: Enable state persistence with flexible storage backends
 *
 * Core features:
 * - Automatic persistence: State changes via `emit()` call `update()` then persist (when enabled)
 * - Storage restoration: Load state from storage during initialization
 * - Flexible storage backends: Support any `StorageInterface` implementation (localStorage, sessionStorage, cookies, etc.)
 * - Error resilience: Persistence failures don't prevent state updates
 * - Optional persistence: Can skip persistence during restore operations to prevent circular updates
 *
 * Design decisions:
 * - Persistence errors are silently ignored to prevent state update failures
 * - Storage is optional (can be `null`) to support stores that don't need persistence
 * - `restore()` is NOT called automatically by default (`initRestore` defaults to `false`)
 *   to avoid initialization order issues with subclass fields (e.g., storageKey)
 * - Subclasses should call `restore()` manually in their constructors after fields are initialized
 * - Subclasses must implement `restore()` and `persist()` to define storage-specific logic
 * - Expiration support: If a state needs expiration functionality, it can define an `expires` field
 *   in its own state interface (e.g., `expires?: number | Date | null`). The base interface
 *   doesn't enforce this, allowing subclasses to decide whether expiration is needed.
 *
 * @since `1.8.0`
 * @template T - The state type that extends `StoreStateInterface`
 * @template Key - The type of keys used in storage (e.g., `string`, `number`, `symbol`, or custom types)
 * @template Opt - The type of options for storage operations (defaults to `unknown`)
 *
 * @example Prefer {@link AsyncStore}
 * For async lifecycle + reactive updates, use {@link AsyncStore}: it extends this class,
 * implements `restore` / `persist`, and forwards mutations through a composed {@link StoreInterface}.
 *
 * @example Subclass sketch (advanced)
 * The constructor is `super(storage, initRestore)` — there is **no** state factory parameter
 * on `PersistentStore`.
 * 
 * ```typescript
 * class MyStoreState implements StoreStateInterface {
 *   data = '';
 * }
 *
 * class MyStore extends PersistentStore<MyStoreState, string> {
 *   private readonly storageKey = 'my-state';
 *   private current = new MyStoreState();
 *
 *   constructor(storage: StorageInterface<string, MyStoreState> | null = null) {
 *     super(storage, false);
 *     this.restore();
 *   }
 *
 *   protected override update(state: MyStoreState | StoreUpdateValue<MyStoreState>): void {
 *     if (state instanceof MyStoreState) {
 *       this.current = state;
 *     } else {
 *       Object.assign(this.current, state);
 *     }
 *   }
 *
 *   restore(): MyStoreState | null {
 *     if (!this.storage) return null;
 *     try {
 *       const value = this.storage.getItem(this.storageKey);
 *       if (value) {
 *         const restored = new MyStoreState();
 *         Object.assign(restored, value);
 *         this.emit(restored, { persist: false });
 *         return restored;
 *       }
 *     } catch {
 *       return null;
 *     }
 *     return null;
 *   }
 *
 *   persist(state?: MyStoreState): void {
 *     if (!this.storage) return;
 *     const snapshot = state ?? this.current;
 *     this.storage.setItem(this.storageKey, snapshot);
 *   }
 * }
 * ```
 */
export abstract class PersistentStore<
  T extends StoreStateInterface,
  Key,
  Opt = unknown
> implements PersistentInterface<T, Key, Opt> {
  /**
   * Constructor for persistent store interface
   *
   * By default, `initRestore` is `false` to avoid initialization order issues with subclass fields.
   * Subclasses should call `restore()` manually in their constructors after fields are initialized.
   *
   * @param storage - Storage implementation for persisting state, or `null` if persistence is not needed
   *   When `null`, `restore()` / `persist()` typically no-op (depending on subclass)
   *   @default `null`
   * @param initRestore - Whether to automatically restore state from storage during construction
   *   Set to `true` only if `restore()` does not read subclass fields initialized after `super()`
   *   @default `false` — call `restore()` manually after subclass fields are ready
   *
   * @example Subclass implementation (recommended)
   * ```typescript
   * class MyStore extends PersistentStore<MyStoreState, string> {
   *   private readonly storageKey = 'my-state';
   *
   *   constructor(storage: StorageInterface<string, MyStoreState> | null = null) {
   *     super(storage, false);
   *     this.restore();
   *   }
   * }
   * ```
   *
   * @example With auto-restore (only if no subclass fields needed)
   * ```typescript
   * class SimpleStore extends PersistentStore<MyStoreState, string> {
   *   constructor(storage: StorageInterface<string, MyStoreState> | null = null) {
   *     super(storage, true);
   *   }
   *
   *   restore(): MyStoreState | null {
   *     return this.storage?.getItem('hardcoded-key') ?? null;
   *   }
   * }
   * ```
   *
   * @example Without storage
   * ```typescript
   * class MyStore extends PersistentStore<MyStoreState, string> {
   *   constructor() {
   *     super(null, false);
   *   }
   *   restore() {
   *     return null;
   *   }
   *   persist() {}
   *   protected override update() {}
   * }
   * ```
   */
  constructor(
    protected readonly storage: StorageInterface<Key, T, Opt> | null = null,
    /**
     * Whether to automatically restore state from storage during construction
     *
     * **⚠️ This is primarily a testing/internal property.**
     *
     * **Initialization Order Issues:**
     * When `initRestore` is `true`, `restore()` is called during `super()` execution,
     * which happens BEFORE subclass field initialization. This means:
     * - Subclass fields (e.g., `private readonly storageKey = 'my-key'`) are NOT yet initialized
     * - `restore()` cannot access these fields, causing runtime errors or incorrect behavior
     * - This is a fundamental limitation of JavaScript/TypeScript class initialization order
     *
     * **Initialization Order:**
     * 1. Parent constructor (`super()`) executes - `restore()` is called here if `initRestore` is `true`
     * 2. Subclass fields are initialized (e.g., `storageKey = 'my-key'`)
     * 3. Subclass constructor body executes
     *
     * **Recommended Approach:**
     * Subclasses should set `initRestore` to `false` (default) and manually call `restore()`
     * in their constructor body after fields are initialized:
     *
     * ```typescript
     * class MyStore extends PersistentStore<MyStoreState, string> {
     *   private readonly storageKey = 'my-state';
     *
     *   constructor(storage: StorageInterface<string, MyStoreState> | null = null) {
     *     super(storage, false);
     *     this.restore();
     *   }
     * }
     * ```
     *
     * **When to Use `initRestore: true`:**
     * Only use this option if your `restore()` implementation doesn't require any subclass fields.
     * For example, if you use hardcoded storage keys or don't need subclass-specific configuration.
     *
     * @default `false` - Subclasses should manually call `restore()` after field initialization
     * @internal This property exists primarily for testing and edge cases where subclass fields aren't needed
     */
    initRestore: boolean = false
  ) {
    // Note: initRestore is defaulted to false to avoid initialization order issues
    // Subclasses should call restore() manually in their constructors after fields are initialized
    // This prevents issues where subclass fields (like storageKey) are not yet initialized
    // when restore() is called during super() execution
    if (initRestore) {
      this.restore();
    }
  }

  /**
   * Get the storage instance
   *
   * Returns the storage implementation used by this store for persistence operations.
   * Returns `null` if no storage was configured during construction.
   *
   * Use cases:
   * - Check if persistence is enabled
   * - Access storage for custom operations
   * - Pass storage to other components
   *
   * @override
   * @returns The storage instance or `null` if not configured
   *
   * @example Check if storage is available
   * ```typescript
   * const storage = store.getStorage();
   * if (storage) {
   *   // Storage is available, perform custom operations
   *   storage.clear();
   * }
   * ```
   *
   * @example Access storage for custom operations
   * ```typescript
   * const storage = store.getStorage();
   * if (storage) {
   *   const customKey = 'custom-data' as Key;
   *   storage.setItem(customKey, customValue);
   * }
   * ```
   */
  public getStorage(): StorageInterface<Key, T, Opt> | null {
    return this.storage;
  }

  /**
   * Emit state changes and automatically sync to storage
   *
   * Applies a new snapshot then optionally persists it.
   * When state is emitted, it is automatically persisted to storage (if configured)
   * unless explicitly disabled via options.
   *
   * Behavior:
   * - Dispatches through subclass `update()` (e.g. {@link AsyncStore} → inner {@link StoreInterface})
   * - Automatically persists state to storage if `persist` option is not `false` and storage is configured
   * - Persistence failures are silently ignored to prevent state update failures
   * - State update always succeeds even if persistence fails
   *
   * Error handling:
   * - If persistence fails (e.g., storage quota exceeded, permission denied, storage unavailable),
   *   the error is caught and silently ignored
   * - State update still succeeds, ensuring application functionality is not affected
   * - Subclasses can override this method to implement custom error handling if needed
   *
   * @param state - The new state to emit and persist
   * @param options - Optional configuration for emit behavior
   * @param options.persist - Whether to persist state to storage
   *   - `true` or `undefined`: Persist state to storage (default behavior)
   *   - `false`: Skip persistence, useful during restore operations to prevent circular updates
   *   @default `true`
   *
   * @example Normal emit with automatic persistence
   * ```typescript
   * // State is emitted and automatically persisted
   * this.emit(newState);
   * ```
   *
   * @example Emit without persistence (during restore)
   * ```typescript
   * restore(): MyStoreState | null {
   *   if (!this.storage) return null;
   *   try {
   *     const stored = this.storage.getItem('my-state');
   *     if (stored) {
   *       const restoredState = new MyStoreState();
   *       Object.assign(restoredState, stored);
   *       // Update state without triggering persist to avoid circular updates
   *       this.emit(restoredState, { persist: false });
   *       return restoredState;
   *     }
   *   } catch {
   *     return null;
   *   }
   *   return null;
   * }
   * ```
   *
   * @example Custom error handling in subclass
   * ```typescript
   * override emit(state: T, options?: { persist?: boolean }): void {
   *   super.emit(state);
   *
   *   const shouldPersist = options?.persist !== false && this.storage;
   *   if (!shouldPersist) {
   *     return;
   *   }
   *
   *   try {
   *     this.persist(state);
   *   } catch (error) {
   *     // Custom error handling (e.g., logging, retry logic)
   *     console.error('Failed to persist state:', error);
   *     // Optionally notify error handlers or retry persistence
   *   }
   * }
   * ```
   */
  public emit(
    state: T | StoreUpdateValue<T>,
    options?: { persist?: boolean }
  ): void {
    const shouldPersist = options?.persist !== false && this.storage;
    if (!shouldPersist) {
      return;
    }

    try {
      if (state != null) {
        this.persist(state as T);
      }
    } catch {
      // Silently ignore persistence errors to prevent state update failures
      // Subclasses can override this method to handle errors differently if needed
    }
  }

  /**
   * Restore state from storage and merge with current state
   *
   * This abstract method must be implemented by subclasses to define how state is restored
   * from storage. It is called automatically during construction (if `initRestore` is `true`)
   * and can also be called manually to refresh state from storage.
   *
   * Implementation requirements:
   * - Check if storage is configured (`this.storage` is not `null`)
   * - Retrieve state from storage using storage-specific keys
   * - Validate and transform stored data into the expected state type
   * - Handle expiration checks if the state interface defines an `expires` field
   * - Update store state using `emit()` with `{ persist: false }` to prevent circular updates
   * - Return `null` if storage is not configured, no state is found, or restoration fails
   *
   * Error handling:
   * - Should catch and handle storage errors gracefully
   * - Return `null` on any error to indicate restoration failure
   * - Should not throw errors that would break store initialization
   *
   * State update pattern:
   * - Always use `this.emit(restoredState, { persist: false })` when updating state during restore
   * - This prevents triggering `persist()` which would write back to storage unnecessarily
   * - The `{ persist: false }` option ensures no circular updates occur
   *
   * @override
   * @template R - The type of restored state (defaults to `T`, but can be customized by subclasses)
   *   Some implementations may return only a portion of the state (e.g., just the result value)
   * @returns The restored state of type `R`, or `null` if:
   *   - Storage is not configured (`this.storage` is `null`)
   *   - No state is found in storage
   *   - State restoration fails (e.g., invalid data, storage error)
   *   - State has expired (if expiration checking is implemented)
   *
   * @example Basic implementation
   * ```typescript
   * restore(): MyStoreState | null {
   *   if (!this.storage) return null;
   *   try {
   *     const value = this.storage.getItem('my-state');
   *     if (value) {
   *       const restoredState = new MyStoreState();
   *       Object.assign(restoredState, value);
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
   *
   * @example With expiration checking (if state interface defines expires field)
   * ```typescript
   * interface MyStoreState extends StoreStateInterface {
   *   data: string;
   *   expires?: number | Date | null; // Optional expiration field
   * }
   *
   * restore(): MyStoreState | null {
   *   if (!this.storage) return null;
   *   try {
   *     const stored = this.storage.getItem('my-state') as MyStoreState | null;
   *     if (stored) {
   *       // Check expiration if present
   *       if (stored.expires) {
   *         const expiresAt = typeof stored.expires === 'number'
   *           ? stored.expires
   *           : stored.expires.getTime();
   *         if (Date.now() > expiresAt) {
   *           // State expired, remove from storage
   *           this.storage.removeItem('my-state');
   *           return null;
   *         }
   *       }
   *
   *       const restoredState = new MyStoreState();
   *       Object.assign(restoredState, stored);
   *       this.emit(restoredState, { persist: false });
   *       return restoredState;
   *     }
   *   } catch {
   *     return null;
   *   }
   *   return null;
   * }
   * ```
   *
   * @example Returning partial state (custom return type)
   * ```typescript
   * // Restore only the result value, not the full state
   * restore(): string | null {
   *   if (!this.storage) return null;
   *   try {
   *     const state = this.storage.getItem('my-state') as MyStoreState | null;
   *     if (state) {
   *       this.emit(state, { persist: false });
   *       return state.data; // Return only the data field
   *     }
   *   } catch {
   *     return null;
   *   }
   *   return null;
   * }
   * ```
   */
  public abstract restore<R = T>(): R | null;

  /**
   * Persist current state to storage
   *
   * This abstract method must be implemented by subclasses to define how state is persisted
   * to storage. It is called automatically by `emit()` when state changes (only if storage
   * is configured and `persist` option is not `false`).
   *
   * Implementation requirements:
   * - Check if storage is configured (`this.storage` is not `null`)
   * - Serialize state data appropriately for the storage backend
   * - Use storage-specific keys to store the state
   * - Handle storage-specific options if needed (via `Opt` type parameter)
   * - Do nothing if storage is not configured (graceful no-op)
   *
   * Error handling:
   * - This method may throw errors (e.g., storage quota exceeded, permission denied, storage unavailable)
   * - Errors thrown here are caught by `emit()` to prevent state update failures
   * - The state update will still succeed even if persistence fails
   * - Subclasses can implement retry logic or error recovery if needed
   *
   * When called:
   * - Automatically called by `emit()` after state is updated (unless `{ persist: false }` is specified)
   * - Can be called manually to force persistence of current state
   * - Can be called with a specific state to persist that state instead of current state
   *
   * @override
   * @param state - Optional state to persist
   *   - If provided: Persist the specified state object
   *   - If `undefined`: Persist the current snapshot your subclass holds (the base class has no `this.state`)
   *
   * @returns `void` - Persisting is a side effect operation with no return value
   *
   * @throws May throw errors if storage operations fail, including:
   *   - `QuotaExceededError`: Storage quota exceeded (e.g., localStorage full)
   *   - `SecurityError`: Permission denied (e.g., in private browsing mode)
   *   - `TypeError`: Invalid data type for storage
   *   - Storage-specific errors from the storage implementation
   *
   * @example Basic implementation
   * ```typescript
   * persist(state?: MyStoreState): void {
   *   if (!this.storage) return;
   *   const stateToPersist = state ?? this.current;
   *   this.storage.setItem('my-state', stateToPersist);
   * }
   * ```
   *
   * @example With storage key
   * ```typescript
   * private readonly storageKey = 'my-app-state';
   *
   * persist(state?: MyStoreState): void {
   *   if (!this.storage) return;
   *   const stateToPersist = state ?? this.current;
   *   this.storage.setItem(this.storageKey, stateToPersist);
   * }
   * ```
   *
   * @example With storage options
   * ```typescript
   * persist(state?: MyStoreState): void {
   *   if (!this.storage) return;
   *   const stateToPersist = state ?? this.current;
   *   const options: Opt = {
   *     expires: stateToPersist.expires
   *       ? (typeof stateToPersist.expires === 'number'
   *           ? stateToPersist.expires
   *           : stateToPersist.expires.getTime())
   *       : undefined
   *   };
   *   this.storage.setItem('my-state', stateToPersist, options);
   * }
   * ```
   *
   * @example Persisting only specific fields
   * ```typescript
   * persist(state?: MyStoreState): void {
   *   if (!this.storage) return;
   *   const stateToPersist = state ?? this.current;
   *   // Only persist the data field, not the entire state
   *   this.storage.setItem('my-state-data', stateToPersist.data);
   * }
   * ```
   *
   * @example Manual persistence
   * ```typescript
   * // Force persistence of current state
   * store.persist();
   *
   * // Persist a specific state
   * const customState = new MyStoreState();
   * customState.data = 'custom data';
   * store.persist(customState);
   * ```
   */
  public abstract persist(state?: T): void;
  /**
   * @override
   */
  public abstract persist(state?: StoreUpdateValue<T>): void;
}
