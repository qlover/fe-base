import { SyncStorageInterface } from '@qlover/fe-corekit';
import {
  AsyncStateInterface,
  AsyncStoreInterface
} from '../interface/AsyncStoreInterface';
import { PersistentStore } from './PersistentStore';
import { AsyncStoreStatus, AsyncStoreStatusType } from './AsyncStoreStatus';
import { createAsyncState } from './createAsyncState';

/**
 * Async store state interface
 *
 * Extends `AsyncStateInterface` with status tracking for async operations.
 * This interface provides a complete state structure for managing async operations
 * with status information.
 *
 * @template T - The type of the result data from the async operation
 */
export interface AsyncStoreStateInterface<T> extends AsyncStateInterface<T> {
  /**
   * Current status of the async operation
   *
   * Status values are defined by `AsyncStoreStatus`:
   * - `DRAFT`: Initial state, operation hasn't started
   * - `PENDING`: Operation is in progress
   * - `SUCCESS`: Operation completed successfully
   * - `FAILED`: Operation failed with an error
   * - `STOPPED`: Operation was manually stopped
   */
  status: AsyncStoreStatusType;
}

/**
 * Options for creating an async store instance
 *
 * Configuration options for initializing an `AsyncStore` with storage support
 * and custom state initialization.
 *
 * @template T - The type of the result data from the async operation
 * @template Key - The type of keys used in storage (e.g., `string`, `number`, `symbol`)
 * @template Opt - The type of options for storage operations (defaults to `unknown`)
 *
 * @example Basic usage
 * ```typescript
 * const store = new AsyncStore<User, string>({
 *   storage: localStorage,
 *   storageKey: 'user-state',
 *   defaultState: () => null
 * });
 * ```
 *
 * @example Without storage
 * ```typescript
 * const store = new AsyncStore<User, string>({
 *   storage: null,
 *   defaultState: () => null
 * });
 * ```
 */
export interface AsyncStoreOptions<
  State extends AsyncStoreStateInterface<unknown>,
  Key,
  Opt = unknown
> {
  /**
   * Storage implementation for persisting state
   *
   * If provided, state changes will be automatically persisted to this storage.
   * If `null` or `undefined`, the store will work without persistence.
   *
   * @optional
   */
  storage?: SyncStorageInterface<Key, Opt> | null;

  /**
   * Storage key for persisting state
   *
   * The key used to store state in the storage backend.
   * Required if `storage` is provided.
   *
   * @optional
   */
  storageKey?: Key | null;

  /**
   * Create a new state instance
   *
   * Factory function that creates the initial state for the store.
   * This function is called during store initialization and when state is reset.
   *
   * Behavior:
   * - If `storage` is provided, the function receives storage and storageKey as parameters
   * - If `storage` is not provided, the function receives `undefined` for both parameters
   * - If the function returns `null`, a new `AsyncStoreState` instance will be created
   * - If the function returns a state object, that object will be used as the initial state
   *
   * @param storage - Storage implementation (if provided in options)
   * @param storageKey - Storage key (if provided in options)
   * @returns The initial state instance, or `null` to use default state
   *
   * @example With storage restoration
   * ```typescript
   * const store = new AsyncStore<User, string>({
   *   storage: localStorage,
   *   storageKey: 'user-state',
   *   defaultState: (storage, storageKey) => {
   *     const stored = storage?.getItem(storageKey);
   *     if (stored) {
   *       return new AsyncStoreState<User>(stored);
   *     }
   *     return null; // Use default state
   *   }
   * });
   * ```
   *
   * @example Without storage
   * ```typescript
   * const store = new AsyncStore<User, string>({
   *   storage: null,
   *   defaultState: () => null // Always use default state
   * });
   * ```
   */
  defaultState?(
    storage?: SyncStorageInterface<Key, Opt> | null,
    storageKey?: Key | null
  ): State | null;

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
   */
  initRestore?: boolean;
}

/**
 * Async store implementation
 *
 * - Significance: Provides a complete implementation of async operation state management with persistence
 * - Core idea: Combine async operation lifecycle management with persistent state storage
 * - Main function: Manage async operations (start, stop, success, failure) with automatic state persistence
 * - Main purpose: Enable reactive async state management with storage synchronization
 *
 * Core features:
 * - Async operation lifecycle: Start, stop, success, failure handling with automatic state updates
 * - Persistent storage: Optional automatic state persistence to storage backends
 * - Reactive state: Extends `PersistentStoreInterface` for reactive state subscriptions
 * - Status tracking: Complete status management (DRAFT, PENDING, SUCCESS, FAILED, STOPPED)
 * - Duration calculation: Track and calculate operation duration from timestamps
 * - Flexible storage: Support storing only result value or full state object
 *
 * Design decisions:
 * - Storage is optional: Store works without storage for in-memory only scenarios
 * - Automatic persistence: State changes are automatically persisted (unless disabled)
 * - Storage modes: Can store only result value (default) or full state object
 * - Error resilience: Storage failures don't prevent state updates
 * - Status management: Status is automatically updated based on operation lifecycle
 *
 * @template T - The type of the result data from the async operation
 * @template Key - The type of keys used in storage (e.g., `string`, `number`, `symbol`)
 * @template Opt - The type of options for storage operations (defaults to `unknown`)
 *
 * @example Basic usage
 * ```typescript
 * const store = new AsyncStore<User, string>({
 *   storage: localStorage,
 *   storageKey: 'user-state',
 *   defaultState: () => null
 * });
 *
 * // Start operation
 * store.start();
 *
 * // Handle success
 * try {
 *   const user = await fetchUser();
 *   store.success(user);
 * } catch (error) {
 *   store.failed(error);
 * }
 * ```
 *
 * @example Reactive usage
 * ```typescript
 * const store = new AsyncStore<User, string>({ storage: null });
 *
 * // Subscribe to state changes
 * store.observe((state) => {
 *   if (state.loading) {
 *     console.log('Loading...');
 *   } else if (state.result) {
 *     console.log('User:', state.result);
 *   } else if (state.error) {
 *     console.error('Error:', state.error);
 *   }
 * });
 * ```
 */
export class AsyncStore<
    S extends AsyncStoreStateInterface<unknown>,
    Key,
    Opt = unknown
  >
  extends PersistentStore<S, Key, Opt>
  implements AsyncStoreInterface<S>
{
  /**
   * Storage key for persisting state
   *
   * The key used to store state in the storage backend.
   * Set during construction from `AsyncStoreOptions.storageKey`.
   *
   * @default `null`
   */
  protected storageKey: Key | null = null;

  /**
   * Control the type of data stored in persistence
   *
   * This property controls what data is stored and restored from storage:
   * - `true`: Store only the result value (`T`). `restore()` returns `T | null`
   * - `false`: Store the full state object. `restore()` returns `AsyncStoreStateInterface<T> | null`
   *
   * **Note:** This is primarily an internal testing property. In most cases, storing
   * only the result value (`true`) is sufficient and more efficient.
   *
   * @default `true`
   * @internal
   */
  protected storageResult: boolean = true;

  /**
   * Constructor for async store
   *
   * Initializes the store with optional storage backend and state factory.
   * The state factory is created from options, supporting both storage restoration
   * and default state initialization.
   *
   * @param options - Optional configuration for storage and initial state
   *   If not provided, store will work without persistence and use default state
   *   @optional
   *
   * @example With storage
   * ```typescript
   * const store = new AsyncStore<User, string>({
   *   storage: localStorage,
   *   storageKey: 'user-state',
   *   defaultState: () => null
   * });
   * ```
   *
   * @example Without storage
   * ```typescript
   * const store = new AsyncStore<User, string>({
   *   storage: null,
   *   defaultState: () => null
   * });
   * ```
   */
  constructor(options?: AsyncStoreOptions<S, Key, Opt>) {
    super(
      () => createAsyncState(options),
      options?.storage ?? null,
      options?.initRestore ?? false
    );
    this.storageKey = options?.storageKey ?? null;
  }

  /**
   * Restore state from storage
   *
   * Restores state from the configured storage backend. The return type depends
   * on the `storageResult` property:
   * - If `storageResult` is `true`: Returns only the result value (`T`)
   * - If `storageResult` is `false`: Returns the full state object
   *
   * Behavior:
   * - Checks if storage and storageKey are configured
   * - Retrieves data from storage based on `storageResult` mode
   * - Updates store state without triggering persistence (prevents circular updates)
   * - Returns `null` if storage is not configured, no data found, or restoration fails
   *
   * @template R - The return type (defaults to `T | AsyncStoreStateInterface<T>`)
   * @returns The restored value or state, or `null` if not available
   *
   * @example Restore result value (storageResult = true)
   * ```typescript
   * const result = store.restore(); // Returns T | null
   * if (result) {
   *   console.log('Restored user:', result);
   * }
   * ```
   *
   * @example Restore full state (storageResult = false)
   * ```typescript
   * store.storageResult = false;
   * const state = store.restore(); // Returns AsyncStoreStateInterface<T> | null
   * if (state) {
   *   console.log('Restored state:', state);
   * }
   * ```
   */
  override restore<R = S['result'] | S>(): R | null {
    if (!this.storage || !this.storageKey) {
      return null;
    }

    try {
      if (this.storageResult) {
        // When storageResult is true, storage contains only the result value (T)
        const value = this.storage.getItem(this.storageKey) as
          | S['result']
          | null;
        if (value !== null && value !== undefined) {
          this.updateState({ result: value }, { persist: false });
          return this.getResult() as R;
        }
      } else {
        // When storageResult is false, storage contains the full state object
        const state = this.storage.getItem(this.storageKey) as S | null;
        if (state !== null && state !== undefined) {
          this.updateState(state, { persist: false });
          return this.getState() as unknown as R;
        }
      }
    } catch {
      // ignore error
    }

    return null;
  }

  /**
   * Persist state to storage
   *
   * Persists the current state to the configured storage backend.
   * The data persisted depends on the `storageResult` property:
   * - If `storageResult` is `true`: Stores only the result value (`T`)
   * - If `storageResult` is `false`: Stores the full state object
   *
   * Behavior:
   * - Does nothing if storage or storageKey is not configured
   * - If `storageResult` is `true` and result is `null`, nothing is stored
   * - If `storageResult` is `false`, always stores the full state object (even if result is null)
   * - Automatically called by `emit()` when state changes (unless `persist: false` is specified)
   * - Always persists the current state (the `_state` parameter is ignored for compatibility with interface)
   *
   * @param _state - Optional state parameter (ignored, kept for interface compatibility)
   *   This parameter is not used. The method always persists the current state.
   *   @optional
   *
   * @example Automatic persistence (via emit)
   * ```typescript
   * store.success(user); // Automatically persists to storage
   * ```
   *
   * @example Manual persistence
   * ```typescript
   * store.persist(); // Persist current state
   * ```
   *
   * @example Persist only result value (default)
   * ```typescript
   * store.storageResult = true; // default
   * store.success(user);
   * // Storage contains only the user object
   * ```
   *
   * @example Persist full state
   * ```typescript
   * store.storageResult = false;
   * store.success(user);
   * // Storage contains full state object with loading, status, timestamps, etc.
   * ```
   */
  override persist<T extends S>(_state?: T | undefined): void {
    if (!this.storage || !this.storageKey) {
      return;
    }

    if (this.storageResult) {
      // Store only the result value (T)
      const result = this.getResult();
      if (result !== null) {
        this.storage.setItem(this.storageKey, result);
      }
    } else {
      // Store the full state object
      this.storage.setItem(this.storageKey, this.getState());
    }
  }

  /**
   * Get the underlying store instance
   *
   * Returns the store instance itself, enabling reactive state subscriptions.
   * This method is required by `AsyncStoreInterface` and allows consumers to
   * subscribe to state changes using the store's `observe()` method.
   *
   * @override
   * @returns The store instance for reactive subscriptions
   *
   * @example Subscribe to state changes
   * ```typescript
   * const store = asyncStore.getStore();
   * store.observe((state) => {
   *   console.log('State changed:', state);
   * });
   * ```
   */
  getStore(): PersistentStore<S, Key, Opt> {
    return this;
  }

  /**
   * Start an async operation
   *
   * Marks the beginning of an async operation and sets the loading state to `true`.
   * Records the start timestamp and optionally sets an initial result value.
   *
   * Behavior:
   * - Sets `loading` to `true`
   * - Sets `status` to `PENDING`
   * - Records `startTime` with current timestamp
   * - Optionally sets `result` if provided
   * - Automatically persists state to storage (if configured)
   *
   * @override
   * @param result - Optional initial result value to set before operation starts
   *   Useful for optimistic updates or when resuming a previous operation
   *   @optional
   *
   * @example Start operation
   * ```typescript
   * store.start();
   * // Operation is now in progress, loading = true
   * ```
   *
   * @example Start with optimistic result
   * ```typescript
   * store.start(cachedUser);
   * // Start with cached data while fetching fresh data
   * ```
   */
  start(result?: S['result'] | undefined): void {
    this.updateState({
      loading: true,
      result,
      status: AsyncStoreStatus.PENDING,
      startTime: Date.now()
    });
  }

  /**
   * Stop an async operation
   *
   * Manually stops an async operation (e.g., user cancellation). This is different
   * from failure - stopping is intentional, while failure indicates an error occurred.
   *
   * Behavior:
   * - Sets `loading` to `false`
   * - Sets `status` to `STOPPED`
   * - Records `endTime` with current timestamp
   * - Optionally sets `error` and `result` if provided
   * - Automatically persists state to storage (if configured)
   *
   * @override
   * @param error - Optional error information if operation was stopped due to an error
   *   @optional
   * @param result - Optional result value if partial results are available
   *   @optional
   *
   * @example Stop operation
   * ```typescript
   * store.start();
   * // ... user cancels operation ...
   * store.stopped();
   * ```
   *
   * @example Stop with error
   * ```typescript
   * store.stopped(new Error('User cancelled'));
   * ```
   */
  stopped(error?: unknown, result?: S['result'] | undefined): void {
    // If result is explicitly provided (including null), use it
    // Otherwise, preserve the existing result
    const newResult = result !== undefined ? result : this.getState().result;

    this.updateState({
      loading: false,
      error,
      result: newResult,
      status: AsyncStoreStatus.STOPPED,
      endTime: Date.now()
    });
  }

  /**
   * Mark an async operation as failed
   *
   * Marks the end of an async operation with a failure. This should be called
   * when an operation encounters an error or exception.
   *
   * Behavior:
   * - Sets `loading` to `false`
   * - Sets `status` to `FAILED`
   * - Records `endTime` with current timestamp
   * - Sets `error` with the failure information
   * - Preserves existing `result` if not provided, or sets `result` if explicitly provided
   * - Automatically persists state to storage (if configured)
   *
   * @override
   * @param error - The error that occurred during the operation
   *   Can be an Error object, string message, or any error information
   * @param result - Optional result value if partial results are available
   *   If provided (including `null`), will update the result to this value
   *   If not provided (`undefined`), will preserve the existing result
   *   Useful when operation fails but has partial data to preserve, or when you want to clear result
   *   @optional
   *
   * @example Handle API error (preserves existing result)
   * ```typescript
   * try {
   *   const user = await fetchUser();
   *   store.success(user);
   * } catch (error) {
   *   store.failed(error);
   *   // Existing user data is preserved
   * }
   * ```
   *
   * @example Handle failure with partial data
   * ```typescript
   * try {
   *   const data = await fetchData();
   *   store.success(data);
   * } catch (error) {
   *   // Operation failed but we have cached data
   *   store.failed(error, cachedData);
   * }
   * ```
   *
   * @example Clear result on failure
   * ```typescript
   * try {
   *   const data = await fetchData();
   *   store.success(data);
   * } catch (error) {
   *   // Explicitly clear result on failure
   *   store.failed(error, null);
   * }
   * ```
   */
  failed(error: unknown, result?: S['result'] | undefined): void {
    // If result is explicitly provided (including null), use it
    // Otherwise, preserve the existing result
    const newResult = result !== undefined ? result : this.getState().result;

    this.updateState({
      loading: false,
      error,
      result: newResult,
      status: AsyncStoreStatus.FAILED,
      endTime: Date.now()
    });
  }

  /**
   * Mark an async operation as successful
   *
   * Marks the end of an async operation with a successful result. This should be
   * called when an operation completes successfully.
   *
   * Behavior:
   * - Sets `loading` to `false`
   * - Sets `status` to `SUCCESS`
   * - Records `endTime` with current timestamp
   * - Sets `result` with the successful result data
   * - Clears `error` (sets to `null`)
   * - Automatically persists state to storage (if configured)
   *
   * @override
   * @param result - The result of the successful async operation
   *   This is the data returned from the completed operation
   *
   * @example Handle successful API response
   * ```typescript
   * try {
   *   const user = await fetchUser();
   *   store.success(user);
   * } catch (error) {
   *   store.failed(error);
   * }
   * ```
   *
   * @example Handle successful data transformation
   * ```typescript
   * const processedData = processData(rawData);
   * store.success(processedData);
   * ```
   */
  success(result: S['result']): void {
    this.updateState({
      loading: false,
      result,
      error: null,
      status: AsyncStoreStatus.SUCCESS,
      endTime: Date.now()
    });
  }

  /**
   * Get current store state
   *
   * Returns the current state object containing all async operation information.
   * This is a snapshot of the current state at the time of call.
   *
   * @override
   * @returns Current state object containing:
   *   - `loading`: Whether operation is in progress
   *   - `result`: Operation result (if successful)
   *   - `error`: Error information (if failed)
   *   - `startTime`: Operation start timestamp
   *   - `endTime`: Operation end timestamp
   *   - `status`: Operation status
   *
   * @example Get current state
   * ```typescript
   * const state = store.getState();
   * console.log('Loading:', state.loading);
   * console.log('Result:', state.result);
   * ```
   *
   * @example Use state for conditional logic
   * ```typescript
   * const state = store.getState();
   * if (state.loading) {
   *   return <LoadingSpinner />;
   * } else if (state.result) {
   *   return <DataDisplay data={state.result} />;
   * }
   * ```
   */
  getState(): S {
    return this.state;
  }

  /**
   * Update store state with partial state object
   *
   * Merges the provided partial state into the current state. This allows
   * fine-grained control over state updates without replacing the entire state.
   *
   * Behavior:
   * - Merges provided properties into current state
   * - Only updates specified properties, others remain unchanged
   * - Type-safe: Only accepts properties that exist in the state interface
   * - Automatically persists state to storage (unless `persist: false` is specified)
   *
   * @override
   * @template T - The state type that extends `AsyncStateInterface<T>`
   * @param state - Partial state object containing properties to update
   *   Only specified properties will be updated, others remain unchanged
   * @param options - Optional configuration for emit behavior
   * @param options.persist - Whether to persist state to storage
   *   - `true` or `undefined`: Persist state to storage (default behavior)
   *   - `false`: Skip persistence, useful during restore operations
   *   @default `true`
   *
   * @example Update loading state only
   * ```typescript
   * store.updateState({ loading: true });
   * ```
   *
   * @example Update multiple properties
   * ```typescript
   * store.updateState({
   *   loading: false,
   *   result: data,
   *   endTime: Date.now()
   * });
   * ```
   *
   * @example Update without persistence
   * ```typescript
   * store.updateState({ loading: true }, { persist: false });
   * ```
   */
  updateState<T = S>(state: Partial<T>, options?: { persist?: boolean }): void {
    const newState = this.cloneState(state as Partial<S>);
    this.emit(newState, options);
  }

  /**
   * Get the loading state of the async operation
   *
   * Convenience method to check if an operation is currently in progress.
   * Equivalent to `getState().loading`.
   *
   * @override
   * @returns `true` if the operation is in progress, `false` otherwise
   *
   * @example Check loading state
   * ```typescript
   * if (store.getLoading()) {
   *   console.log('Operation in progress...');
   * }
   * ```
   */
  getLoading(): boolean {
    return this.getState().loading;
  }

  /**
   * Get the error from the async operation
   *
   * Returns the error information if the operation failed, or `null` if no error.
   * Equivalent to `getState().error`.
   *
   * @override
   * @returns The error information if operation failed, or `null` if no error
   *
   * @example Handle error
   * ```typescript
   * const error = store.getError();
   * if (error) {
   *   console.error('Operation failed:', error);
   * }
   * ```
   */
  getError(): unknown | null {
    return this.getState().error;
  }

  /**
   * Get the result from the async operation
   *
   * Returns the result data if the operation succeeded, or `null` if no result.
   * Equivalent to `getState().result`.
   *
   * @override
   * @returns The result data if operation succeeded, or `null` if no result
   *
   * @example Access result
   * ```typescript
   * const result = store.getResult();
   * if (result) {
   *   console.log('Operation result:', result);
   * }
   * ```
   */
  getResult(): S['result'] | null {
    return this.getState().result;
  }

  /**
   * Get the status of the async operation
   *
   * Returns the status information about the operation state.
   * The status type depends on the implementation (e.g., `'pending' | 'success' | 'failed' | 'stopped'`).
   * Equivalent to `getState().status`.
   *
   * @override
   * @returns The status of the async operation
   *
   * @example Check status
   * ```typescript
   * const status = store.getStatus();
   * switch (status) {
   *   case AsyncStoreStatus.PENDING:
   *     return <LoadingSpinner />;
   *   case AsyncStoreStatus.SUCCESS:
   *     return <SuccessMessage />;
   *   case AsyncStoreStatus.FAILED:
   *     return <ErrorMessage />;
   * }
   * ```
   */
  getStatus(): AsyncStoreStatusType {
    return this.getState().status;
  }

  /**
   * Get the duration of the async operation
   *
   * Calculates the duration based on the current state's `startTime` and `endTime`:
   * - Returns `0` if operation has not started (`startTime` is `0` or not set)
   * - If operation is in progress (`endTime` is `0` or not set), returns `Date.now() - startTime`
   * - If operation has completed, returns `endTime - startTime`
   * - Handles type conversion: supports `number`, `string` (parsed via `parseFloat`), or other types (converted via `Number`)
   * - Returns `0` if startTime or endTime cannot be converted to valid numbers
   * - Returns `0` if startTime is greater than endTime (invalid state)
   * - Prevents overflow by checking against `Number.MAX_SAFE_INTEGER`
   *
   * @override
   * @returns The duration of the async operation in milliseconds, or `0` if duration cannot be calculated
   *
   * @example Get duration for completed operation
   * ```typescript
   * store.start();
   * // ... operation completes ...
   * store.success(result);
   * const duration = store.getDuration();
   * console.log(`Operation took ${duration}ms`);
   * ```
   *
   * @example Get duration for in-progress operation
   * ```typescript
   * store.start();
   * // ... operation still running ...
   * const duration = store.getDuration(); // Returns time since start
   * console.log(`Operation has been running for ${duration}ms`);
   * ```
   */
  getDuration(): number {
    const state = this.getState();

    const startTime = state?.startTime;
    const endTime = state?.endTime;

    // If operation has not started (startTime is 0 or not set), return 0
    if (!startTime || startTime === 0) {
      return 0;
    }

    const start =
      typeof startTime === 'number'
        ? startTime
        : typeof startTime === 'string'
          ? parseFloat(startTime)
          : Number(startTime);

    const end =
      typeof endTime === 'number'
        ? endTime
        : typeof endTime === 'string'
          ? parseFloat(endTime)
          : Number(endTime);

    // If operation is in progress (endTime is 0 or not set), use current time
    const actualEnd = Number.isFinite(end) && end > 0 ? end : Date.now();

    if (
      Number.isFinite(start) &&
      Number.isFinite(actualEnd) &&
      start > 0 &&
      actualEnd >= start
    ) {
      const duration = actualEnd - start;

      // Additional check to prevent overflow or large values
      if (duration < Number.MAX_SAFE_INTEGER) {
        return duration;
      }
    }

    return 0;
  }

  /**
   * Reset store state to initial state
   *
   * Clears all state data and resets to default values. This is useful when
   * starting a new operation or clearing previous operation state.
   *
   * Behavior:
   * - Resets `loading` to `false`
   * - Clears `result` (sets to `null`)
   * - Clears `error` (sets to `null`)
   * - Resets `startTime` and `endTime` to `0`
   * - Resets `status` to `DRAFT`
   *
   * @override
   *
   * @example Reset before new operation
   * ```typescript
   * store.reset();
   * store.start();
   * // Now ready for a new operation
   * ```
   *
   * @example Reset after error recovery
   * ```typescript
   * store.failed(error);
   * // ... handle error ...
   * store.reset();
   * // Ready to retry
   * ```
   */
  reset(): void {
    super.reset();
  }

  /**
   * Check if the async operation completed successfully
   *
   * Returns `true` if the operation has completed successfully with a result.
   * This typically means `loading` is `false`, `error` is `null`, and `result` is not `null`.
   *
   * @override
   * @returns `true` if the async operation is successful, `false` otherwise
   *
   * @example Check success before accessing result
   * ```typescript
   * if (store.isSuccess()) {
   *   const result = store.getResult();
   *   console.log('Success:', result);
   * }
   * ```
   */
  isSuccess(): boolean {
    return !this.getLoading() && this.getStatus() === AsyncStoreStatus.SUCCESS;
  }

  /**
   * Check if the async operation failed
   *
   * Returns `true` if the operation has failed with an error.
   * This typically means `loading` is `false` and `error` is not `null`.
   *
   * @override
   * @returns `true` if the async operation is failed, `false` otherwise
   *
   * @example Handle failure
   * ```typescript
   * if (store.isFailed()) {
   *   const error = store.getError();
   *   console.error('Operation failed:', error);
   * }
   * ```
   */
  isFailed(): boolean {
    return !this.getLoading() && this.getStatus() === AsyncStoreStatus.FAILED;
  }

  /**
   * Check if the async operation was stopped
   *
   * Returns `true` if the operation was manually stopped (e.g., user cancellation).
   * This is different from failure - stopping is intentional, failure is an error.
   *
   * @override
   * @returns `true` if the async operation is stopped, `false` otherwise
   *
   * @example Handle stopped operation
   * ```typescript
   * if (store.isStopped()) {
   *   console.log('Operation was cancelled');
   * }
   * ```
   */
  isStopped(): boolean {
    return !this.getLoading() && this.getStatus() === AsyncStoreStatus.STOPPED;
  }

  /**
   * Check if the async operation is completed
   *
   * Returns `true` if the operation has finished, regardless of outcome.
   * This includes success, failure, and stopped states. Returns `false` if still in progress.
   *
   * @override
   * @returns `true` if the async operation is completed (success, failed, or stopped), `false` otherwise
   *
   * @example Check if operation finished
   * ```typescript
   * if (store.isCompleted()) {
   *   // Operation is done, can proceed with next steps
   *   proceedToNextStep();
   * }
   * ```
   */
  isCompleted(): boolean {
    return (
      !this.getLoading() &&
      (this.isSuccess() || this.isFailed() || this.isStopped())
    );
  }

  /**
   * Check if the async operation is pending (in progress)
   *
   * Returns `true` if the operation is currently in progress.
   * This is equivalent to checking if `loading` is `true`.
   *
   * @override
   * @returns `true` if the async operation is pending (in progress), `false` otherwise
   *
   * @example Show loading indicator
   * ```typescript
   * if (store.isPending()) {
   *   return <LoadingSpinner />;
   * }
   * ```
   */
  isPending(): boolean {
    return this.getLoading() && this.getStatus() === AsyncStoreStatus.PENDING;
  }
}
