/**
 * Unique identifier for an abort operation
 */
export type AbortManagerId = string;

/**
 * Base configuration interface for abort operations
 *
 * Defines common parameters for controlling abort behavior in asynchronous operations,
 * including operation identification and lifecycle callbacks.
 *
 * This configuration is framework-agnostic and can be used in any context requiring
 * abort control, not limited to specific plugin implementations.
 *
 * Note: `AbortManager` only manages `AbortController` instances. For timeout and external
 * signal support, use `ProxyAbortManager` instead.
 */
export interface AbortManagerConfig {
  /**
   * Unique identifier for the abort operation
   *
   * Used to track and manage specific `AbortController` instances in the pool.
   * When not provided, the pool will auto-generate an identifier using the pattern:
   * `{poolName}-{counter}` (e.g., `"AbortManager-1"`, `"AbortManager-2"`)
   *
   * Use cases:
   * - Abort specific operations by ID
   * - Prevent duplicate operations with same identifier
   * - Track operation lifecycle in logs
   *
   * `@optional`
   * @example `"user-profile-fetch"`
   * @example `"api-request-123"`
   */
  abortId?: AbortManagerId;

  /**
   * Callback triggered when operation is manually aborted via `pool.abort()`
   *
   * Only invoked when `abort()` is called explicitly on the pool.
   *
   * Use cases:
   * - Cleanup temporary resources
   * - Show user notifications
   * - Log abort events
   * - Cancel dependent operations
   *
   * `@optional`
   * @example Basic usage
   * ```typescript
   * onAborted: (config) => {
   *   console.log(`Operation ${config.abortId} was manually cancelled`);
   *   cleanupResources();
   * }
   * ```
   * @example With state management
   * ```typescript
   * onAborted: (config) => {
   *   store.dispatch(cancelRequest(config.abortId));
   *   showNotification('Request cancelled');
   * }
   * ```
   */
  onAborted?<T extends AbortManagerConfig>(config: T): void;
}

/**
 * Interface defining the common API for abort management
 *
 * This interface ensures that both `AbortManager` and `ProxyAbortManager` have the same
 * public API, allowing them to be used interchangeably based on whether external
 * signal delegation is needed.
 *
 * @since 2.6.0
 * @template T - Configuration type extending `AbortManagerConfig`
 */
export interface AbortManagerInterface<T extends AbortManagerConfig> {
  /**
   * Generates or retrieves unique operation identifier
   *
   * ID resolution priority:
   * 1. `config.abortId` if provided
   * 2. Auto-generated: `{poolName}-{counter}` (e.g., `"AbortManager-1"`)
   *
   * The counter increments for each auto-generated ID, ensuring uniqueness
   * within this manager instance. Custom IDs are not validated for uniqueness.
   *
   * @param config - Abort configuration containing optional `abortId`
   * @returns Unique operation identifier
   *
   * @example With custom ID
   * ```typescript
   * generateAbortedId({ abortId: 'fetch-user-123' }) // "fetch-user-123"
   * ```
   *
   * @example Auto-generated IDs
   * ```typescript
   * generateAbortedId({}) // "AbortManager-1"
   * generateAbortedId({}) // "AbortManager-2"
   * ```
   */
  generateAbortedId(config?: T): AbortManagerId;

  /**
   * Registers a new operation and creates an `AbortController` for it
   *
   * This is the recommended way to create and track abort controllers.
   * It encapsulates the creation and registration logic, ensuring consistent state management.
   *
   * @param config - Abort configuration with optional `abortId`, `abortTimeout`, etc.
   * @returns Object containing the operation ID and `AbortSignal` for the operation
   * @throws {Error} If an operation with the same ID is already registered
   *
   * @example Basic usage
   * ```typescript
   * const { abortId, signal } = manager.register({ abortId: 'fetch-users' });
   *
   * try {
   *   const response = await fetch('/api/users', { signal });
   *   return await response.json();
   * } finally {
   *   manager.cleanup(abortId);
   * }
   * ```
   */
  register(config: T): {
    abortId: AbortManagerId;
    signal: AbortSignal;
  };

  /**
   * Cleans up resources for a completed or aborted operation
   *
   * Removes the `AbortController` from the tracking map and cleans up
   * any associated event listeners and timers.
   *
   * This method is safe to call multiple times for the same operation.
   *
   * @param config - Configuration object with `abortId`, or the ID string directly
   *
   * @example Cleanup after operation completion
   * ```typescript
   * const { abortId, signal } = manager.register({ abortId: 'fetch-users' });
   *
   * try {
   *   await fetch('/api/users', { signal });
   * } finally {
   *   manager.cleanup(abortId); // Always cleanup
   * }
   * ```
   */
  cleanup(config: T | AbortManagerId): void;

  /**
   * Manually aborts a specific operation
   *
   * Triggers the abort signal for the specified operation, invokes the `onAborted`
   * callback if provided, and cleans up the controller from the pool.
   *
   * @param config - Configuration with `abortId` and optional `onAborted`, or ID string
   * @returns `true` if operation was found and aborted, `false` if no matching operation
   *
   * @example Abort by ID string
   * ```typescript
   * const wasAborted = manager.abort('fetch-users');
   * if (wasAborted) {
   *   console.log('Request cancelled');
   * }
   * ```
   */
  abort(config: T | AbortManagerId): boolean;

  /**
   * Aborts all tracked operations in the pool
   *
   * Iterates through all active controllers, triggers abort for each, and clears
   * all resources. This is a batch operation typically used during cleanup phases
   * (e.g., component unmount, user logout, navigation).
   *
   * Note: Individual `onAborted` callbacks are NOT invoked by this method.
   *
   * @example Component lifecycle cleanup
   * ```typescript
   * class DataComponent {
   *   private manager = new AbortManager('DataComponentManager');
   *
   *   onDestroy() {
   *     this.manager.abortAll();
   *   }
   * }
   * ```
   */
  abortAll(): void;

  /**
   * Runs an async workflow with automatic registration and cleanup
   *
   * This helper keeps your code as close to a normal Promise workflow as possible:
   * - It calls `register()` to create an abortable `signal`
   * - It guarantees `cleanup(abortId)` is called when the returned promise settles
   *
   * @param factory - Function that receives `{ abortId, signal }` and returns a Promise
   * @param config - Optional abort configuration
   * @returns Promise that resolves/rejects with the factory result
   *
   * @example Basic usage
   * ```typescript
   * const data = await manager.autoCleanup(
   *   ({ signal }) => fetch(url, { signal }).then(r => r.json())
   * );
   * ```
   */
  autoCleanup<R>(
    factory: (ctx: {
      abortId: AbortManagerId;
      signal: AbortSignal;
    }) => Promise<R>,
    config?: T
  ): Promise<R>;

  /**
   * Retrieves the abort signal for a registered operation
   *
   * @param abortId - The operation identifier
   * @returns The `AbortSignal` for the operation, or `undefined` if not found
   *
   * @example
   * ```typescript
   * const { abortId } = manager.register({ abortId: 'fetch-users' });
   * const signal = manager.getSignal(abortId);
   * // Use signal in other operations
   * ```
   */
  getSignal(abortId: AbortManagerId): AbortSignal | undefined;
}
