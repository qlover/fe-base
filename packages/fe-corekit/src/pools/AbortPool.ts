import { AbortError } from './AbortError';
import type { ClearableSignal } from 'any-signal';
import { anySignal } from './utils/anySignal';
import { timeoutSignal } from './utils/timeoutSignal';
import {
  AutoCleanupPromise,
  type AutoCleanupFinalizer
} from './AutoCleanupPromise';

export type AbortPoolSignal = ClearableSignal | AbortSignal;

/**
 * Wrapper for AbortController with cleanup capability
 *
 * This interface wraps the standard AbortController and adds a `cleanup` method
 * for proper cleanup of event listeners and timers.
 */
export interface AbortControllerWrapper<
  T extends AbortPoolConfig = AbortPoolConfig
> {
  controller: AbortController;
  cleanup: () => void;
  config: T;
}

/**
 * Configuration interface for AbortPool operations
 *
 * Defines parameters for controlling abort behavior in asynchronous operations,
 * including operation identification, signal management, timeout control, and lifecycle callbacks.
 *
 * This configuration is framework-agnostic and can be used in any context requiring
 * abort control, not limited to specific plugin implementations.
 */
export interface AbortPoolConfig {
  /**
   * Unique identifier for the abort operation
   *
   * Used to track and manage specific `AbortController` instances in the pool.
   * When not provided, the pool will auto-generate an identifier using the pattern:
   * `{poolName}-{counter}` (e.g., `"AbortPool-1"`, `"AbortPool-2"`)
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
  abortId?: AbortPoolId;

  /**
   * External `AbortSignal` for request cancellation
   *
   * When provided, the pool will use this signal instead of creating a new one.
   * This enables integration with existing abort mechanisms (e.g., browser fetch API,
   * axios, or custom abort systems).
   *
   * If not provided, the pool creates and manages an `AbortController` automatically.
   *
   * `@optional`
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal MDN}
   * @example
   * ```typescript
   * const controller = new AbortController();
   * const config = { signal: controller.signal };
   * // Later: controller.abort()
   * ```
   */
  signal?: AbortSignal;

  /**
   * Timeout duration in milliseconds for automatic abort
   *
   * When set, the operation will be automatically aborted after this duration.
   * This prevents hanging operations and ensures timely resource cleanup.
   *
   * Timeout behavior:
   * - Timer starts when operation begins
   * - Triggers `onAbortedTimeout` callback when expired
   * - Automatically cleans up controller and timer
   * - Does not affect operations that complete before timeout
   *
   * `@optional`
   * @default `undefined` (no timeout)
   * @example `5000` // 5 seconds timeout for quick operations
   * @example `30000` // 30 seconds timeout for API requests
   * @example `60000` // 1 minute timeout for file uploads
   */
  abortTimeout?: number;

  /**
   * Callback triggered when operation is manually aborted via `pool.abort()`
   *
   * Only invoked when `abort()` is called explicitly on the pool.
   * NOT triggered by external signal abort or timeout.
   *
   * Use cases:
   * - Cleanup temporary resources
   * - Show user notifications
   * - Log abort events
   * - Cancel dependent operations
   *
   * Note: For timeout or external signal aborts, use `onAbortedTimeout` callback.
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
  onAborted?<T extends AbortPoolConfig>(config: T): void;

  /**
   * Callback triggered when operation times out via `abortTimeout`
   *
   * Only invoked when the timeout expires and aborts the operation.
   * NOT triggered by manual abort or external signal abort.
   *
   * Use cases:
   * - Show timeout-specific error messages
   * - Log timeout events for monitoring
   * - Retry logic for timed-out operations
   * - Cleanup timeout-specific resources
   *
   * `@optional`
   * @example Basic usage
   * ```typescript
   * onAbortedTimeout: (config) => {
   *   console.error(`Operation ${config.abortId} timed out after ${config.abortTimeout}ms`);
   *   showTimeoutNotification();
   * }
   * ```
   * @example With retry logic
   * ```typescript
   * onAbortedTimeout: (config) => {
   *   logger.warn(`Timeout: ${config.abortId}`);
   *   retryOperation(config);
   * }
   * ```
   */
  onAbortedTimeout?<T extends AbortPoolConfig>(config: T): void;
}

export type AbortPoolId = string;

/**
 * Resource pool for managing abort controllers in asynchronous operations
 *
 * `AbortPool` provides centralized management of `AbortController` instances, enabling
 * fine-grained control over operation cancellation, timeout handling, and resource cleanup.
 * It can be used standalone or extended as a base class for plugin implementations.
 *
 * Core concept:
 * Think of it as a registry that tracks all cancellable operations. Each operation gets
 * a unique identifier and an associated `AbortController`. The pool manages the lifecycle
 * of these controllers, ensuring proper cleanup and preventing memory leaks.
 *
 * Main features:
 * - **Controller management**: Centralized tracking of `AbortController` instances
 *   - Auto-generates unique identifiers for operations without explicit IDs
 *   - Stores controllers in a `Map` for O(1) lookup and removal
 *   - Supports manual abort by operation ID
 *   - Prevents resource leaks by cleaning up completed operations
 *
 * - **Resource cleanup**: Automatic and manual cleanup mechanisms
 *   - Removes controllers after abort or completion
 *   - Provides `cleanup()` for individual operations
 *   - Provides `abortAll()` for batch cleanup (e.g., component unmount)
 *   - Ensures no dangling references or memory leaks
 *
 * - **Promise racing with cleanup**: Delegates to `CleanablePromiseRunner`
 *   - Races multiple promises with automatic cleanup of losers
 *   - Prevents memory leaks from abandoned promises
 *   - Simplifies timeout implementation
 *
 * Architecture decisions:
 * - Uses `Map` instead of plain object for better performance and type safety
 * - Delegates promise racing to `CleanablePromiseRunner` to reduce complexity
 * - Separates `onAborted` and `onAbortedTimeout` callbacks for different abort scenarios
 * - Auto-generates IDs to simplify usage while allowing custom IDs for tracking
 *
 * @since 2.6.0
 * @template T - Configuration type extending `AbortPoolConfig`, allowing custom properties
 *
 * @example Standalone usage for API requests
 * ```typescript
 * const apiAbortPool = new AbortPool('APIPool');
 *
 * // Register and track a request
 * const { abortId, signal } = apiAbortPool.register({ abortId: 'fetch-users' });
 *
 * fetch('/api/users', { signal })
 *   .then(response => response.json())
 *   .finally(() => apiAbortPool.cleanup(abortId));
 *
 * // Cancel if user navigates away
 * apiAbortPool.abort('fetch-users');
 * ```
 *
 * @example Extending as a base class
 * ```typescript
 * class RequestAbortPlugin extends AbortPool<RequestConfig> {
 *   constructor() {
 *     super('RequestAbortPlugin');
 *   }
 *
 *   async execute(config: RequestConfig) {
 *     const { abortId, signal } = this.register(config);
 *
 *     try {
 *       return await fetch(config.url, { signal });
 *     } finally {
 *       this.cleanup(abortId);
 *     }
 *   }
 * }
 * ```
 *
 * @example Batch cleanup on component unmount
 * ```typescript
 * class DataFetcher {
 *   private abortPool = new AbortPool('DataFetcherPool');
 *
 *   async fetchData(id: string) {
 *     const { signal } = this.abortPool.register({ abortId: id });
 *     return fetch('/api/data', { signal });
 *   }
 *
 *   destroy() {
 *     // Cancel all pending requests
 *     this.abortPool.abortAll();
 *   }
 * }
 * ```
 *
 * @example Manual abort control with callbacks
 * ```typescript
 * const pool = new AbortPool('TaskPool');
 *
 * pool.abort({
 *   abortId: 'long-task',
 *   onAborted: (config) => {
 *     console.log(`Task ${config.abortId} was cancelled`);
 *     cleanupTempFiles();
 *   }
 * });
 * ```
 */
export class AbortPool<T extends AbortPoolConfig = AbortPoolConfig> {
  /**
   * Counter for auto-generating unique operation identifiers
   *
   * Incremented each time `generateAbortedId()` is called without an explicit ID.
   * Ensures each auto-generated ID is unique within this pool instance.
   *
   * @private
   */
  private requestCounter = 0;

  /**
   * Map of active abort controller wrappers indexed by operation ID
   *
   * Key: Operation identifier (auto-generated or custom)
   * Value: `AbortControllerWrapper` containing controller and cleanup function
   *
   * This map enables:
   * - O(1) lookup for abort operations
   * - O(1) cleanup after completion
   * - Tracking all active operations
   * - Preventing duplicate operation IDs
   *
   * **IMPORTANT: Memory Leak Prevention**
   * - ALWAYS use `cleanup(abortId)` to remove wrappers from this map
   * - NEVER use `wrappers.delete(abortId)` directly
   * - The `cleanup()` method will call `wrapper.cleanup()` to release resources:
   *   - Event listeners attached to signals
   *   - Timeout timers
   *   - References to other signals
   * - Failure to call `cleanup()` will cause memory leaks
   *
   * @protected
   * @see {@link cleanup} for proper resource cleanup
   * @see {@link AbortControllerWrapper} for the wrapper structure
   */
  protected readonly wrappers: Map<string, AbortControllerWrapper<T>> =
    new Map();

  /**
   * Creates a new `AbortPool` instance
   *
   * @param poolName - Name of the pool for identification and debugging
   *
   * @example Minimal setup
   * ```typescript
   * const abortPool = new AbortPool('APIPool');
   * ```
   *
   * @example With descriptive name
   * ```typescript
   * const uploadPool = new AbortPool('FileUploadPool');
   * const fetchPool = new AbortPool('DataFetchPool');
   * ```
   */
  constructor(
    /**
     * Unique name identifying this pool instance
     *
     * Used for:
     * - Auto-generating operation IDs (e.g., `"APIPool-1"`, `"APIPool-2"`)
     * - Debugging and logging to distinguish between multiple pools
     * - Identifying pool source in error messages
     *
     * @readonly
     * @default `"AbortPool"`
     * @example `"APIPool"` // For API request management
     * @example `"TaskPool"` // For background task management
     * @example `"UploadPool"` // For file upload operations
     */
    public readonly poolName: string = 'AbortPool'
  ) {}

  /**
   * Generates or retrieves unique operation identifier
   *
   * ID resolution priority:
   * 1. `config.abortId` if provided
   * 2. Auto-generated: `{poolName}-{counter}` (e.g., `"AbortPool-1"`)
   *
   * The counter increments for each auto-generated ID, ensuring uniqueness
   * within this pool instance. Custom IDs are not validated for uniqueness.
   *
   * @param config - Abort configuration containing optional `abortId`
   * @returns Unique operation identifier
   * @see {@link AbortPoolConfig.abortId} for custom ID usage
   *
   * @example With custom ID
   * ```typescript
   * generateAbortedId({ abortId: 'fetch-user-123' }) // "fetch-user-123"
   * ```
   *
   * @example Auto-generated IDs
   * ```typescript
   * generateAbortedId({}) // "AbortPool-1"
   * generateAbortedId({}) // "AbortPool-2"
   * generateAbortedId({}) // "AbortPool-3"
   * ```
   *
   * @example In a named pool
   * ```typescript
   * const pool = new AbortPool('APIPool');
   * pool.generateAbortedId() // "APIPool-1"
   * pool.generateAbortedId({}) // "APIPool-2"
   * ```
   */
  public generateAbortedId(config?: T): AbortPoolId {
    if (!config) {
      return `${this.poolName}-${++this.requestCounter}`;
    }

    return config.abortId || `${this.poolName}-${++this.requestCounter}`;
  }

  /**
   * Registers a new operation and creates an `AbortController` for it
   *
   * This is the recommended way to create and track abort controllers in the pool.
   * It encapsulates the creation and registration logic, ensuring consistent state management.
   *
   * Registration flow:
   * 1. Generate or retrieve operation ID from config
   * 2. Check if operation with same ID already exists
   * 3. Create new `AbortController` instance
   * 4. Store controller in the pool's map
   * 5. Combine signals (pool + external + timeout) if applicable
   * 6. Return the operation ID and combined signal
   *
   * Signal combination strategy:
   * - If `AbortSignal.any()` is supported: Use native composition (any signal aborts)
   * - Otherwise: Use event listener coordination (external abort syncs to pool)
   *
   * Design rationale:
   * Returns `signal` instead of `controller` to maintain better encapsulation. Users should
   * only need the signal to pass to async operations, while the pool retains full control
   * over the controller lifecycle. To abort, use the pool's `abort()` method.
   *
   * @param config - Abort configuration with optional `abortId`, `signal`, `abortTimeout`
   * @returns Object containing the operation ID and `AbortSignal` for the operation
   * @throws {Error} If an operation with the same ID is already registered
   * @see {@link cleanup} to remove the controller after operation completes
   * @see {@link abort} to cancel the operation
   *
   * @example Basic usage with fetch
   * ```typescript
   * const pool = new AbortPool('APIPool');
   *
   * const { abortId, signal } = pool.register({ abortId: 'fetch-users' });
   *
   * try {
   *   const response = await fetch('/api/users', { signal });
   *   const data = await response.json();
   *   return data;
   * } finally {
   *   pool.cleanup(abortId);
   * }
   * ```
   *
   * @example Auto-generated ID
   * ```typescript
   * const { abortId, signal } = pool.register({});
   * console.log(abortId); // "APIPool-1"
   *
   * fetch('/api/data', { signal })
   *   .finally(() => pool.cleanup(abortId));
   * ```
   *
   * @example With timeout and callbacks
   * ```typescript
   * const { abortId, signal } = pool.register({
   *   abortId: 'upload-file',
   *   abortTimeout: 30000,
   *   onAbortedTimeout: (config) => {
   *     console.error(`Upload timed out after ${config.abortTimeout}ms`);
   *   }
   * });
   *
   * uploadFile(file, signal)
   *   .finally(() => pool.cleanup(abortId));
   * ```
   *
   * @example With external signal (parent-child relationship)
   * ```typescript
   * const parentController = new AbortController();
   *
   * const { abortId, signal } = pool.register({
   *   abortId: 'child-operation',
   *   signal: parentController.signal  // Child inherits parent's abort
   * });
   *
   * fetch('/api/data', { signal })
   *   .finally(() => pool.cleanup(abortId));
   *
   * // Both can cancel:
   * pool.abort('child-operation');  // ✅ Pool can cancel
   * parentController.abort();        // ✅ Parent can cancel
   * ```
   *
   * @example Multiple operations
   * ```typescript
   * const pool = new AbortPool('DataPool');
   *
   * const users = pool.register({ abortId: 'fetch-users' });
   * const posts = pool.register({ abortId: 'fetch-posts' });
   *
   * Promise.all([
   *   fetch('/api/users', { signal: users.signal }),
   *   fetch('/api/posts', { signal: posts.signal })
   * ]).finally(() => {
   *   pool.cleanup(users.abortId);
   *   pool.cleanup(posts.abortId);
   * });
   * ```
   *
   * @example Complex: external signal + timeout + callbacks
   * ```typescript
   * const parentController = new AbortController();
   *
   * const { abortId, signal } = pool.register({
   *   abortId: 'complex-op',
   *   signal: parentController.signal,  // External signal
   *   abortTimeout: 10000,              // 10s timeout
   *   onAborted: (config) => {
   *     console.log('Manually aborted or external abort');
   *   },
   *   onAbortedTimeout: (config) => {
   *     console.log('Timed out after 10s');
   *   }
   * });
   *
   * // Any of these will cancel:
   * // 1. pool.abort('complex-op')
   * // 2. parentController.abort()
   * // 3. 10s timeout
   * ```
   */
  public register(config: T): {
    abortId: AbortPoolId;
    signal: AbortSignal;
  } {
    const abortId = this.generateAbortedId(config);

    // Prevent duplicate registration
    if (this.wrappers.has(abortId)) {
      throw new Error(
        `Operation with ID "${abortId}" is already registered in ${this.poolName}`
      );
    }

    // Create pool-managed controller
    const controller = new AbortController();

    const signals: AbortPoolSignal[] = [];
    const cleanupCallbacks: Array<() => void> = [];

    // Store timeout signal separately for cleanup
    let timeoutSig: AbortSignal | ClearableSignal | undefined;

    // Add timeout signal if configured
    if (Number.isInteger(config.abortTimeout) && config.abortTimeout! > 0) {
      timeoutSig = timeoutSignal(config.abortTimeout!);

      // Add timeout signal to signals array
      // Native AbortSignal.timeout() returns AbortSignal without clear() method
      // Fallback implementation returns ClearableSignal with clear() method
      signals.push(timeoutSig);
    }

    // Add external signal if provided
    if (config.signal) {
      signals.push(config.signal);
    }

    // If we have other signals, sync them to pool controller (one-way)
    if (signals.length > 0) {
      // Combine external signals (timeout + external) without pool controller
      const externalCombinedSignal = anySignal(signals);

      // Cleanup order: first cleanup timeout signal (if it has clear method),
      // then cleanup combined signal (which may clean up other signals)
      // This ensures timeout timer is cleared even if combined signal uses native API
      if (
        timeoutSig &&
        typeof timeoutSig === 'object' &&
        'clear' in timeoutSig &&
        typeof timeoutSig.clear === 'function'
      ) {
        cleanupCallbacks.push(timeoutSig.clear.bind(timeoutSig));
      }

      // Add external combined signal cleanup
      cleanupCallbacks.push(
        externalCombinedSignal.clear.bind(externalCombinedSignal)
      );

      // Create wrapper first (needed by syncAbortEvents)
      const wrapper: AbortControllerWrapper<T> = {
        controller,
        cleanup: () => {
          cleanupCallbacks.forEach((cb) => cb());
        },
        config
      };

      // Store wrapper
      this.wrappers.set(abortId, wrapper);

      // If external signal is already aborted, abort the pool controller immediately
      if (externalCombinedSignal.aborted) {
        controller.abort(externalCombinedSignal.reason);
        // Still setup listener for consistency, though it won't fire
      }

      // Setup one-way synchronization: external signals → pool controller
      // When any external signal aborts, abort the pool controller
      const removeAbortListener = this.syncAbortEvents(
        abortId,
        externalCombinedSignal,
        signals,
        config
      );
      cleanupCallbacks.push(removeAbortListener);

      return { abortId, signal: controller.signal };
    }

    // Only pool controller signal - no external signals
    // Create wrapper with empty cleanup function
    const wrapper: AbortControllerWrapper<T> = {
      controller,
      cleanup: () => {
        // No external resources to clean up
      },
      config
    };

    // Store wrapper
    this.wrappers.set(abortId, wrapper);

    return { abortId, signal: controller.signal as ClearableSignal };
  }

  /**
   * Cleans up resources for a completed or aborted operation
   *
   * Removes the `AbortController` from the pool's tracking map and cleans up
   * any associated event listeners and timers by calling the signal's `clear()` method.
   * This should be called after an operation completes (successfully or with error)
   * to prevent memory leaks.
   *
   * Cleanup includes:
   * - Calling `signal.clear()` to release resources:
   *   - Clearing timeout timers
   *   - Removing event listeners from combined signals
   *   - Cleaning up anySignal listeners
   * - Removing controller from tracking map
   *
   * This method is safe to call multiple times for the same operation - it will
   * only remove resources if they exist.
   *
   * @param config - Configuration object with `abortId`, or the ID string directly
   * @see {@link abort} for cleanup with abort signal
   * @see {@link abortAll} for batch cleanup of all operations
   *
   * @example Cleanup after operation completion
   * ```typescript
   * const { abortId, signal } = pool.register({ abortId: 'fetch-users' });
   *
   * try {
   *   await fetch('/api/users', { signal });
   * } finally {
   *   pool.cleanup(abortId); // Always cleanup
   * }
   * ```
   *
   * @example Cleanup with config object
   * ```typescript
   * const config = { abortId: 'upload-file' };
   * // ... operation logic ...
   * pool.cleanup(config);
   * ```
   *
   * @example Cleanup by ID string
   * ```typescript
   * pool.cleanup('fetch-users');
   * ```
   */
  public cleanup(config: T | AbortPoolId): void {
    const key = this.isAbortedId(config)
      ? config
      : this.generateAbortedId(config);

    // Get wrapper and call cleanup() to release resources
    const wrapper = this.wrappers.get(key);
    if (wrapper) {
      // Remove wrapper from map first to prevent race conditions
      this.wrappers.delete(key);

      try {
        // Call the cleanup function
        // This will clean up all external resources (timers, listeners)
        wrapper.cleanup();
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Type guard to check if value is an abort ID string
   *
   * @param key - Value to check
   * @returns `true` if value is a string (abort ID), `false` otherwise
   * @protected
   */
  protected isAbortedId(key: unknown): key is string {
    return typeof key === 'string';
  }

  /**
   * Synchronizes abort events from external signals to pool controller (one-way)
   *
   * This method ensures that when any external signal (timeout or external signal)
   * is aborted, the pool controller will also be aborted.
   *
   * Key behaviors (ONE-WAY synchronization):
   * - When external signal aborts → abort pool controller → cleanup pool resources
   * - When timeout signal aborts → abort pool controller → invoke onAbortedTimeout → cleanup
   * - When pool controller aborts manually → cleanup happens via abort() method (no sync needed)
   *
   * This is a one-way sync: external signals → pool controller
   * The pool controller can also abort independently without triggering this listener.
   *
   * @param abortId - The operation identifier
   * @param externalCombinedSignal - The combined external signal (timeout + external)
   * @param _sourceSignals - Array of source signals (timeout, external) - unused, kept for future extension
   * @param config - The abort configuration with callbacks
   * @returns Cleanup function to remove the abort event listener
   * @protected
   */
  protected syncAbortEvents(
    abortId: AbortPoolId,
    externalCombinedSignal: AbortSignal,
    _sourceSignals: AbortPoolSignal[],
    config: T
  ): () => void {
    // Listen to external signals and sync to pool controller
    const abortListener = () => {
      // Check if already cleaned up (avoid race condition)
      const wrapper = this.wrappers.get(abortId);
      if (!wrapper) {
        return;
      }

      // Determine abort reason and invoke appropriate callback
      const reason = externalCombinedSignal.reason;

      // Check if it's a timeout error
      if (
        reason?.name === 'TimeoutError' ||
        reason?.message?.includes('timed out')
      ) {
        // Invoke timeout callback if provided
        if (typeof config.onAbortedTimeout === 'function') {
          try {
            config.onAbortedTimeout({ ...config, onAbortedTimeout: undefined });
          } catch {
            // Ignore callback errors to prevent breaking abort flow
          }
        }
      }

      // Abort the pool controller with the same reason (if not already aborted)
      if (!wrapper.controller.signal.aborted) {
        wrapper.controller.abort(reason);
      }

      // Cleanup pool resources
      // Note: We don't call this.abort() here to avoid invoking onAborted callback
      // because onAborted is only for manual abort() calls
      this.cleanup(abortId);
    };

    externalCombinedSignal.addEventListener('abort', abortListener, {
      once: true
    });

    // Return cleanup function to remove the listener
    return () => {
      externalCombinedSignal.removeEventListener('abort', abortListener);
    };
  }

  /**
   * Manually aborts a specific operation
   *
   * Triggers the abort signal for the specified operation, invokes the `onAborted`
   * callback if provided, and cleans up the controller from the pool.
   *
   * Abort flow:
   * 1. Resolve operation ID from config or string
   * 2. Retrieve controller from map
   * 3. Call `controller.abort()` with `AbortError`
   * 4. Remove controller from map (cleanup)
   * 5. Invoke `onAborted` callback if present
   *
   * The abort signal will propagate to any operations listening to the controller's
   * signal (e.g., `fetch()`, `axios`, custom async operations).
   *
   * @param config - Configuration with `abortId` and optional `onAborted`, or ID string
   * @returns `true` if operation was found and aborted, `false` if no matching operation
   * @see {@link abortAll} for aborting all tracked operations
   * @see {@link cleanup} for cleanup without triggering abort
   * @see {@link AbortError} for the error thrown to abort listeners
   *
   * @example Abort by ID string
   * ```typescript
   * const wasAborted = pool.abort('fetch-users');
   * if (wasAborted) {
   *   console.log('Request cancelled');
   * }
   * ```
   *
   * @example Abort with config object
   * ```typescript
   * pool.abort({
   *   abortId: 'upload-file',
   *   onAborted: (config) => {
   *     console.log(`Upload ${config.abortId} cancelled`);
   *     cleanupTempFiles();
   *   }
   * });
   * ```
   *
   * @example Conditional abort on user action
   * ```typescript
   * function handleCancelClick() {
   *   const aborted = pool.abort('long-running-task');
   *   if (aborted) {
   *     showNotification('Task cancelled successfully');
   *   } else {
   *     showNotification('Task already completed');
   *   }
   * }
   * ```
   *
   * @example Abort with cleanup logic
   * ```typescript
   * pool.abort({
   *   abortId: 'data-sync',
   *   onAborted: (config) => {
   *     // Rollback partial changes
   *     database.rollback();
   *     // Clear UI loading state
   *     setLoading(false);
   *     // Log cancellation
   *     logger.info(`Sync cancelled: ${config.abortId}`);
   *   }
   * });
   * ```
   */
  public abort(config: T | AbortPoolId): boolean {
    const key = this.isAbortedId(config)
      ? config
      : this.generateAbortedId(config);

    const wrapper = this.wrappers.get(key);
    if (!wrapper) {
      return false;
    }

    // Determine which config to use BEFORE cleanup
    // Use the stored config from wrapper if config is just an ID string
    const configToUse = this.isAbortedId(config) ? wrapper.config : config;

    // Abort the controller
    wrapper.controller.abort(new AbortError('The operation was aborted', key));

    // Cleanup resources (removes wrapper from map)
    this.cleanup(key);

    // Invoke onAborted callback if provided (with error handling)
    if (
      configToUse !== null &&
      typeof configToUse === 'object' &&
      typeof configToUse.onAborted === 'function'
    ) {
      try {
        configToUse.onAborted({ ...configToUse, onAborted: undefined });
      } catch {
        // Ignore callback errors to prevent breaking abort flow
      }
    }

    return true;
  }

  /**
   * Aborts all tracked operations in the pool
   *
   * Iterates through all active controllers, triggers abort for each, and clears
   * all resources (controllers, event listeners, timers) by calling signal.clear().
   * This is a batch operation typically used during cleanup phases
   * (e.g., component unmount, user logout, navigation).
   *
   * All operations are aborted even if some abort calls throw errors.
   *
   * Abort flow:
   * 1. Iterate through all controllers in the map
   * 2. Call `controller.abort()` with `AbortError` for each (with error handling)
   * 3. Call `controller.signal.clear()` to release all resources
   * 4. Clear the entire controllers map
   *
   * Note: Individual `onAborted` callbacks are NOT invoked by this method.
   * If you need per-operation callbacks, use `abort()` for each operation instead.
   *
   * Common use cases:
   * - Component unmount (React, Vue, Angular)
   * - User logout (cancel all pending API calls)
   * - Page navigation (cancel ongoing requests)
   * - Application shutdown (cleanup all resources)
   *
   * @see {@link abort} for aborting a single operation with callback support
   * @see {@link cleanup} for cleanup without triggering abort
   *
   * @example Component lifecycle cleanup
   * ```typescript
   * class DataComponent {
   *   private abortPool = new AbortPool('DataComponentPool');
   *
   *   async loadData() {
   *     const { signal } = this.abortPool.register({ abortId: 'load-data' });
   *     await fetch('/api/data', { signal });
   *   }
   *
   *   onDestroy() {
   *     // Cancel all pending requests before component is destroyed
   *     this.abortPool.abortAll();
   *   }
   * }
   * ```
   *
   * @example User logout flow
   * ```typescript
   * async function logout() {
   *   // Cancel all ongoing API requests
   *   apiAbortPool.abortAll();
   *
   *   // Clear user data
   *   clearUserData();
   *
   *   // Redirect to login
   *   router.push('/login');
   * }
   * ```
   *
   * @example React hook cleanup
   * ```typescript
   * function useDataFetcher() {
   *   const abortPoolRef = useRef(new AbortPool('DataFetcherPool'));
   *
   *   useEffect(() => {
   *     const pool = abortPoolRef.current;
   *
   *     // Start multiple fetch operations
   *     fetchUsers(pool);
   *     fetchPosts(pool);
   *     fetchComments(pool);
   *
   *     return () => {
   *       // Cancel all fetches when component unmounts
   *       pool.abortAll();
   *     };
   *   }, []);
   * }
   * ```
   *
   * @example Navigation guard
   * ```typescript
   * router.beforeEach((to, from, next) => {
   *   // Cancel all pending requests before navigation
   *   pageAbortPool.abortAll();
   *   next();
   * });
   * ```
   */
  public abortAll(): void {
    // Create a snapshot of wrappers to avoid iteration issues during cleanup
    const wrappersSnapshot = Array.from(this.wrappers.entries());

    // Clear the map first to prevent race conditions
    this.wrappers.clear();

    // Abort all controllers and cleanup resources
    wrappersSnapshot.forEach(([key, wrapper]) => {
      try {
        // Abort the controller if not already aborted
        if (!wrapper.controller.signal.aborted) {
          wrapper.controller.abort(
            new AbortError('All operations were aborted', key)
          );
        }
      } catch {
        // Ignore abort errors
      }

      try {
        // Call cleanup function to release resources
        wrapper.cleanup();
      } catch {
        // Ignore cleanup errors
      }
    });
  }

  /**
   * Runs an async workflow with automatic `AbortPool` registration and cleanup.
   *
   * This helper aims to keep your code as close to a normal Promise workflow as possible:
   * - It calls `register()` to create an abortable `signal`
   * - It guarantees `cleanup(abortId)` is called when the returned promise settles
   * - You can register additional finalizers via `finalizer(fn)` if you need to release
   *   other resources (timers, listeners, etc.)
   *
   * Cleanup order is safe by default:
   * - User finalizers run first
   * - `pool.cleanup(abortId)` runs last
   *
   * @example
   * ```ts
   * const pool = new AbortPool();
   *
   * const data = await pool.autoCleanup(
   *   ({ signal }) => fetch(url, { signal }).then(r => r.json()),
   *   { abortId: 'fetch-data', abortTimeout: 5000 }
   * );
   * ```
   */
  public autoCleanup<R>(
    factory: (ctx: {
      abortId: AbortPoolId;
      signal: AbortSignal;
      finalizer: AutoCleanupFinalizer;
    }) => PromiseLike<R> | R,
    config: T
  ): Promise<R> {
    const { abortId, signal } = this.register(config);

    return AutoCleanupPromise.run<R>((finalizer) => {
      // Ensure pool resources are released even if the user factory throws.
      // Register this first so it runs last (LIFO finalizer execution).
      finalizer(() => this.cleanup(abortId));

      return factory({ abortId, signal, finalizer });
    });
  }

  public getWrapper(
    abortId: AbortPoolId
  ): AbortControllerWrapper<T> | undefined {
    return this.wrappers.get(abortId);
  }
}
