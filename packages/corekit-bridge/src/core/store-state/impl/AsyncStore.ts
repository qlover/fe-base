/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KeyStorageInterface, StorageInterface } from '@qlover/fe-corekit';
import type {
  AsyncStateInterface,
  AsyncStoreInterface
} from '../interface/AsyncStoreInterface';
import type { PersistentInterface } from '../interface/PersistentInterface';
import {
  AsyncStoreStatus,
  type AsyncStoreStatusType
} from './AsyncStoreStatus';
import { createAsyncStoreInterface } from './createAsyncState';
import type {
  StoreInterface,
  StoreUpdateValue
} from '../interface/StoreInterface';

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
 * Value type written through {@link AsyncStoreOptions.persist}
 *
 * A partial snapshot of state fields listed in {@link AsyncStoreOptions.persistKeys}.
 */
export type AsyncStorePersistValue<
  State extends AsyncStoreStateInterface<any>
> = Partial<State>;

/**
 * Options for creating an async store instance
 *
 * Persistence is optional: pass a single {@link KeyStorageInterface} bound to one key.
 * Omit `persist` for in-memory-only usage.
 *
 * @template State - Async store state type
 * @template Key - Storage key type (e.g. `string`)
 * @template Opt - Storage operation options (defaults to `unknown`)
 *
 * @example Persist `result` only (default pick)
 * ```typescript
 * import { KeyStorage } from '@qlover/fe-corekit';
 *
 * const store = new AsyncStore<AsyncStoreStateInterface<User>, string>({
 *   persist: new KeyStorage('user-state', storageAdapter),
 *   defaultState: () => null
 * });
 * ```
 *
 * @example Persist multiple fields
 * ```typescript
 * const store = new AsyncStore<UserState, string>({
 *   persist: new KeyStorage('session', storageAdapter),
 *   persistKeys: ['result', 'credential']
 * });
 * ```
 */
export interface AsyncStoreOptions<
  State extends AsyncStoreStateInterface<any>,
  Key,
  Opt = unknown
> {
  /**
   * Optional persistence port bound to a single storage key
   *
   * When set, `emit` / `persist` / `restore` use this port.
   * When omitted, the store stays in-memory only.
   *
   * @optional
   */
  persist?: KeyStorageInterface<Key, AsyncStorePersistValue<State>, Opt>;

  /**
   * State keys to include in the persisted snapshot
   *
   * - Default: `['result']`
   * - Example: `['result', 'credential']` for auth stores
   *
   * Only these fields are written / restored. Ephemeral fields (`loading`, `status`, …)
   * are omitted unless listed here.
   *
   * @default `['result']`
   */
  persistKeys?: readonly (keyof State)[];

  /**
   * Create a new state instance
   *
   * Called during store initialization and when state is reset.
   * Return `null` to use a fresh {@link AsyncStoreState}.
   *
   * @param persist - Persistence port from options (if any)
   * @returns Initial state, or `null` for the default empty async state
   */
  defaultState?(
    persist?: KeyStorageInterface<
      Key,
      AsyncStorePersistValue<State>,
      Opt
    > | null
  ): State | null;

  /**
   * Whether to call `restore()` after the instance is fully constructed
   *
   * @default `false`
   */
  initRestore?: boolean;

  /**
   * Composed {@link StoreInterface} for snapshots (`update` / `getState` / `subscribe` / `reset`)
   */
  store?: StoreInterface<State>;
}

/**
 * Async store implementation
 *
 * Persistence writes a partial snapshot of fields listed in `persistKeys` (default `['result']`).
 *
 * @since `1.8.0`
 */
export class AsyncStore<
  S extends AsyncStoreStateInterface<any>,
  Key,
  Opt = unknown
>
  implements AsyncStoreInterface<S>, PersistentInterface<S, Key, Opt>
{
  /**
   * Optional persistence port (key + backend bound together)
   */
  protected persistPort?: KeyStorageInterface<
    Key,
    AsyncStorePersistValue<S>,
    Opt
  >;

  /**
   * State keys included in the persisted snapshot
   *
   * @default `['result']`
   */
  protected persistKeys: readonly (keyof S)[];

  protected store: StoreInterface<S>;

  /**
   * @param options - Persist port, `persistKeys`, default state factory, composed store
   */
  constructor(options?: AsyncStoreOptions<S, Key, Opt>) {
    this.persistPort = options?.persist;
    this.persistKeys = options?.persistKeys ?? (['result'] as (keyof S)[]);
    this.store = createAsyncStoreInterface(options);

    if (options?.initRestore) {
      this.restore();
    }
  }

  /**
   * {@link PersistentInterface.getStorage} — always `null`; use {@link getPersist}

   * @override
      */
  public getStorage(): StorageInterface<Key, S, Opt> | null {
    return null;
  }

  /**
   * Persistence port, or `undefined` when memory-only
   */
  public getPersist():
    | KeyStorageInterface<Key, AsyncStorePersistValue<S>, Opt>
    | undefined {
    return this.persistPort;
  }

  /**
   * Apply a state patch, then optionally persist
   *
   * @override
   * @param options.persist - Pass `false` during restore to skip write-back
   */
  public emit(
    state: S | StoreUpdateValue<S>,
    options?: { persist?: boolean }
  ): void {
    this.store.update(state as S);

    if (options?.persist === false) {
      return;
    }

    try {
      this.persist();
    } catch {
      // Persistence must not block in-memory updates
    }
  }

  /**
   * Build the partial snapshot for the configured {@link persistKeys}
   */
  protected pickPersistSnapshot(state: S): AsyncStorePersistValue<S> {
    const picked: AsyncStorePersistValue<S> = {};
    for (const key of this.persistKeys) {
      picked[key] = state[key];
    }
    return picked;
  }

  /**
   * Whether every picked field is nullish (entry should be removed)
   */
  protected isPersistSnapshotEmpty(picked: AsyncStorePersistValue<S>): boolean {
    return this.persistKeys.every((key) => {
      const value = picked[key];
      return value === null || value === undefined;
    });
  }

  /**
   * Normalize a value read from storage into a state patch for {@link persistKeys}
   *
   * Supports object snapshots and legacy single-key raw values.
   */
  protected normalizeStoredPatch(stored: unknown): StoreUpdateValue<S> | null {
    if (stored === null || stored === undefined) {
      return null;
    }

    const patch: StoreUpdateValue<S> = {} as StoreUpdateValue<S>;

    if (this.persistKeys.length === 1) {
      const key = this.persistKeys[0];
      const asRecord =
        typeof stored === 'object' && stored !== null && !Array.isArray(stored);

      if (asRecord && key in (stored as object)) {
        (patch as Record<string | symbol, unknown>)[key as string] = (
          stored as Record<string | symbol, unknown>
        )[key as string];
      } else {
        (patch as Record<string | symbol, unknown>)[key as string] = stored;
      }
      return patch;
    }

    if (
      typeof stored !== 'object' ||
      stored === null ||
      Array.isArray(stored)
    ) {
      return null;
    }

    const record = stored as Record<string | symbol, unknown>;
    let hasAny = false;
    for (const key of this.persistKeys) {
      if (key in record) {
        (patch as Record<string | symbol, unknown>)[key as string] =
          record[key as string];
        hasAny = true;
      }
    }
    return hasAny ? patch : null;
  }

  /**
   * Restore picked fields from the persist port without writing back

   * @override
      */
  public restore<R = S['result'] | AsyncStorePersistValue<S>>(): R | null {
    if (!this.persistPort) {
      return null;
    }

    try {
      const stored = this.persistPort.get();
      const patch = this.normalizeStoredPatch(stored);
      if (!patch) {
        return null;
      }

      this.emit(patch, { persist: false });

      if (
        this.persistKeys.length === 1 &&
        this.persistKeys[0] === ('result' as keyof S)
      ) {
        return this.getResult() as R;
      }

      return this.pickPersistSnapshot(this.getState()) as R;
    } catch {
      // ignore error
    }

    return null;
  }

  /**
   * Write the picked snapshot; remove entry when every picked field is nullish

   * @override
      */
  public persist<T extends S | StoreUpdateValue<S>>(
    _state?: T | undefined
  ): void {
    if (!this.persistPort) {
      return;
    }

    try {
      const picked = this.pickPersistSnapshot(this.getState());
      if (this.isPersistSnapshotEmpty(picked)) {
        this.persistPort.remove();
      } else {
        this.persistPort.set(picked);
      }
    } catch {
      // ignore persistence errors
    }
  }

  /**
   * Get the underlying store instance
   *
   * Returns the composed {@link StoreInterface} (typically {@link SliceStoreAdapter}), enabling
   * reactive subscriptions via {@link StoreInterface.subscribe}.
   *
   * @override
   * @returns The store instance for reactive subscriptions
   *
   * @example Subscribe to state changes
   * ```typescript
   * const port = asyncStore.getStore();
   * port.subscribe((state) => {
   *   console.log('State changed:', state);
   * });
   * ```
   */
  public getStore(): StoreInterface<S> {
    return this.store;
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
  public start(result?: S['result'] | undefined): void {
    this.emit({
      loading: true,
      result,
      status: AsyncStoreStatus.PENDING,
      startTime: Date.now()
    } as StoreUpdateValue<S>);
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
  public stopped(error?: unknown, result?: S['result'] | undefined): void {
    // If result is explicitly provided (including null), use it
    // Otherwise, preserve the existing result
    const newResult = result !== undefined ? result : this.getState().result;

    this.emit({
      loading: false,
      error,
      result: newResult,
      status: AsyncStoreStatus.STOPPED,
      endTime: Date.now()
    } as StoreUpdateValue<S>);
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
  public failed(error: unknown, result?: S['result'] | undefined): void {
    // If result is explicitly provided (including null), use it
    // Otherwise, preserve the existing result
    const newResult = result !== undefined ? result : this.getState().result;

    this.emit({
      loading: false,
      error,
      result: newResult,
      status: AsyncStoreStatus.FAILED,
      endTime: Date.now()
    } as StoreUpdateValue<S>);
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
  public success(result: S['result']): void {
    this.emit({
      loading: false,
      result,
      error: null,
      status: AsyncStoreStatus.SUCCESS,
      endTime: Date.now()
    } as StoreUpdateValue<S>);
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
  public getState(): S {
    return this.store.getState();
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
  public getLoading(): boolean {
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
  public getError(): unknown | null {
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
  public getResult(): S['result'] | null {
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
  public getStatus(): AsyncStoreStatusType {
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
  public getDuration(): number {
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
  public reset(): void {
    this.store.reset();
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
  public isSuccess(): boolean {
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
  public isFailed(): boolean {
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
  public isStopped(): boolean {
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
  public isCompleted(): boolean {
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
  public isPending(): boolean {
    return this.getLoading() && this.getStatus() === AsyncStoreStatus.PENDING;
  }
}
