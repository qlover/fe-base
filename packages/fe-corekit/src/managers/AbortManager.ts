import { AbortError } from './AbortError';
import type {
  AbortManagerInterface,
  AbortManagerConfig,
  AbortManagerId
} from './interface/AbortManagerInterface';

// Re-export types from interface file
export type {
  AbortManagerConfig,
  AbortManagerId
} from './interface/AbortManagerInterface';

/**
 * Wrapper for AbortController with cleanup capability
 *
 * This interface wraps the standard AbortController and adds a `cleanup` method
 * for proper cleanup of event listeners and timers.
 */
export interface AbortControllerWrapper<
  T extends AbortManagerConfig = AbortManagerConfig
> {
  controller: AbortController;
  cleanup?: () => void;
  config: T;
}

/**
 * Resource manager for abort controllers in asynchronous operations
 *
 * `AbortManager` provides centralized management of `AbortController` instances, enabling
 * fine-grained control over operation cancellation and resource cleanup.
 * It can be used standalone or extended as a base class for plugin implementations.
 *
 * Core concept:
 * Think of it as a registry that tracks all cancellable operations. Each operation gets
 * a unique identifier and an associated `AbortController`. The manager manages the lifecycle
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
 * Architecture decisions:
 * - Uses `Map` instead of plain object for better performance and type safety
 * - Separates `onAborted` callback for manual abort scenarios
 * - Auto-generates IDs to simplify usage while allowing custom IDs for tracking
 *
 * @since 2.6.0
 * @template T - Configuration type extending `AbortManagerConfig`, allowing custom properties
 *
 * @example Standalone usage for API requests
 * ```typescript
 * const apiManager = new AbortManager('APIManager');
 *
 * // Register and track a request
 * const { abortId, signal } = apiManager.register({ abortId: 'fetch-users' });
 *
 * fetch('/api/users', { signal })
 *   .then(response => response.json())
 *   .finally(() => apiManager.cleanup(abortId));
 *
 * // Cancel if user navigates away
 * apiManager.abort('fetch-users');
 * ```
 *
 * @example Extending as a base class
 * ```typescript
 * class RequestAbortPlugin extends AbortManager<RequestConfig> {
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
 *   private abortManager = new AbortManager('DataFetcherManager');
 *
 *   async fetchData(id: string) {
 *     const { signal } = this.abortManager.register({ abortId: id });
 *     return fetch('/api/data', { signal });
 *   }
 *
 *   destroy() {
 *     // Cancel all pending requests
 *     this.abortManager.abortAll();
 *   }
 * }
 * ```
 *
 * @example Manual abort control with callbacks
 * ```typescript
 * const manager = new AbortManager('TaskManager');
 *
 * manager.abort({
 *   abortId: 'long-task',
 *   onAborted: (config) => {
 *     console.log(`Task ${config.abortId} was cancelled`);
 *     cleanupTempFiles();
 *   }
 * });
 * ```
 */
export class AbortManager<T extends AbortManagerConfig = AbortManagerConfig>
  implements AbortManagerInterface<T>
{
  /**
   * Counter for auto-generating unique operation identifiers
   *
   * Incremented each time `generateAbortedId()` is called without an explicit ID.
   * Ensures each auto-generated ID is unique within this manager instance.
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
   * Creates a new `AbortManager` instance
   *
   * @param poolName - Name of the manager for identification and debugging
   *
   * @example Minimal setup
   * ```typescript
   * const abortManager = new AbortManager('APIManager');
   * ```
   *
   * @example With descriptive name
   * ```typescript
   * const uploadManager = new AbortManager('FileUploadManager');
   * const fetchManager = new AbortManager('DataFetchManager');
   * ```
   */
  constructor(
    /**
     * Unique name identifying this manager instance
     *
     * Used for:
     * - Auto-generating operation IDs (e.g., `"AbortManager-1"`, `"AbortManager-2"`)
     * - Debugging and logging to distinguish between multiple managers
     * - Identifying manager source in error messages
     *
     * @readonly
     * @default `"AbortManager"`
     * @example `"APIManager"` // For API request management
     * @example `"TaskManager"` // For background task management
     * @example `"UploadManager"` // For file upload operations
     */
    public readonly poolName: string = 'AbortManager'
  ) {}

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
   * @override
   * @param config - Abort configuration containing optional `abortId`
   * @returns Unique operation identifier
   * @see {@link AbortManagerConfig.abortId} for custom ID usage
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
   * generateAbortedId({}) // "AbortManager-3"
   * ```
   *
   * @example In a named manager
   * ```typescript
   * const manager = new AbortManager('APIManager');
   * manager.generateAbortedId() // "APIManager-1"
   * manager.generateAbortedId({}) // "APIManager-2"
   * ```
   */
  public generateAbortedId(config?: T): AbortManagerId {
    if (!config) {
      return `${this.poolName}-${++this.requestCounter}`;
    }

    const abortId =
      config.abortId || `${this.poolName}-${++this.requestCounter}`;
    // TODO: 如果传入引用相同的config对象，则返回相同的abortId

    return abortId;
  }

  /**
   * Registers a new operation and creates an `AbortController` for it
   *
   * This is the recommended way to create and track abort controllers in the manager.
   * It encapsulates the creation and registration logic, ensuring consistent state management.
   *
   * Registration flow:
   * 1. Generate or retrieve operation ID from config
   * 2. Check if operation with same ID already exists
   * 3. Create new `AbortController` instance
   * 4. Store controller in the manager's map
   * 5. Return the operation ID and signal
   *
   * Design rationale:
   * Returns `signal` instead of `controller` to maintain better encapsulation. Users should
   * only need the signal to pass to async operations, while the manager retains full control
   * over the controller lifecycle. To abort, use the manager's `abort()` method.
   *
   * Note: `AbortManager` only manages `AbortController` instances. For timeout and external
   * signal support, use `ProxyAbortManager` instead.
   *
   * @override
   * @param config - Abort configuration with optional `abortId` and `onAborted` callback
   * @returns Object containing the operation ID and `AbortSignal` for the operation
   * @throws {Error} If an operation with the same ID is already registered
   * @see {@link cleanup} to remove the controller after operation completes
   * @see {@link abort} to cancel the operation
   *
   * @example Basic usage with fetch
   * ```typescript
   * const manager = new AbortManager('APIManager');
   *
   * const { abortId, signal } = manager.register({ abortId: 'fetch-users' });
   *
   * try {
   *   const response = await fetch('/api/users', { signal });
   *   const data = await response.json();
   *   return data;
   * } finally {
   *   manager.cleanup(abortId);
   * }
   * ```
   *
   * @example Auto-generated ID
   * ```typescript
   * const { abortId, signal } = manager.register({});
   * console.log(abortId); // "APIManager-1"
   *
   * fetch('/api/data', { signal })
   *   .finally(() => manager.cleanup(abortId));
   * ```
   *
   * @example With callback
   * ```typescript
   * const { abortId, signal } = manager.register({
   *   abortId: 'upload-file',
   *   onAborted: (config) => {
   *     console.log(`Upload ${config.abortId} was cancelled`);
   *   }
   * });
   *
   * uploadFile(file, signal)
   *   .finally(() => manager.cleanup(abortId));
   * ```
   *
   * @example Multiple operations
   * ```typescript
   * const manager = new AbortManager('DataManager');
   *
   * const users = manager.register({ abortId: 'fetch-users' });
   * const posts = manager.register({ abortId: 'fetch-posts' });
   *
   * Promise.all([
   *   fetch('/api/users', { signal: users.signal }),
   *   fetch('/api/posts', { signal: posts.signal })
   * ]).finally(() => {
   *   manager.cleanup(users.abortId);
   *   manager.cleanup(posts.abortId);
   * });
   * ```
   */
  public register(config: T): {
    abortId: AbortManagerId;
    signal: AbortSignal;
  } {
    const abortId = this.generateAbortedId(config);

    if (this.wrappers.has(abortId)) {
      throw new Error(
        `Operation with ID "${abortId}" is already registered in ${this.poolName}`
      );
    }

    const controller = new AbortController();

    const wrapper: AbortControllerWrapper<T> = {
      controller,
      config
    };

    this.wrappers.set(abortId, wrapper);

    return { abortId, signal: controller.signal };
  }

  /**
   * Cleans up resources for a completed or aborted operation
   *
   * Removes the `AbortController` from the manager's tracking map.
   * This should be called after an operation completes (successfully or with error)
   * to prevent memory leaks.
   *
   * Cleanup includes:
   * - Removing controller from tracking map
   *
   * This method is safe to call multiple times for the same operation - it will
   * only remove resources if they exist.
   *
   * @override
   * @param config - Configuration object with `abortId`, or the ID string directly
   * @see {@link abort} for cleanup with abort signal
   * @see {@link abortAll} for batch cleanup of all operations
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
   *
   * @example Cleanup with config object
   * ```typescript
   * const config = { abortId: 'upload-file' };
   * // ... operation logic ...
   * manager.cleanup(config);
   * ```
   *
   * @example Cleanup by ID string
   * ```typescript
   * manager.cleanup('fetch-users');
   * ```
   */
  public cleanup(config: T | AbortManagerId): void {
    const key = this.isAbortedId(config)
      ? config
      : this.generateAbortedId(config);

    const wrapper = this.wrappers.get(key);
    if (wrapper) {
      this.wrappers.delete(key);

      try {
        wrapper.cleanup?.();
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
   * Manually aborts a specific operation
   *
   * Triggers the abort signal for the specified operation, invokes the `onAborted`
   * callback if provided, and cleans up the controller from the manager.
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
   * @override
   * @param config - Configuration with `abortId` and optional `onAborted`, or ID string
   * @returns `true` if operation was found and aborted, `false` if no matching operation
   * @see {@link abortAll} for aborting all tracked operations
   * @see {@link cleanup} for cleanup without triggering abort
   * @see {@link AbortError} for the error thrown to abort listeners
   *
   * @example Abort by ID string
   * ```typescript
   * const wasAborted = manager.abort('fetch-users');
   * if (wasAborted) {
   *   console.log('Request cancelled');
   * }
   * ```
   *
   * @example Abort with config object
   * ```typescript
   * manager.abort({
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
   *   const aborted = manager.abort('long-running-task');
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
   * manager.abort({
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
  public abort(config: T | AbortManagerId): boolean {
    const key = this.isAbortedId(config)
      ? config
      : this.generateAbortedId(config);

    const wrapper = this.wrappers.get(key);
    if (!wrapper) {
      return false;
    }

    const configToUse = this.isAbortedId(config) ? wrapper.config : config;

    wrapper.controller.abort(new AbortError('The operation was aborted', key));

    this.cleanup(key);

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
   * Aborts all tracked operations in the manager
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
   * @override
   * @see {@link abort} for aborting a single operation with callback support
   * @see {@link cleanup} for cleanup without triggering abort
   *
   * @example Component lifecycle cleanup
   * ```typescript
   * class DataComponent {
   *   private abortManager = new AbortManager('DataComponentManager');
   *
   *   async loadData() {
   *     const { signal } = this.abortManager.register({ abortId: 'load-data' });
   *     await fetch('/api/data', { signal });
   *   }
   *
   *   onDestroy() {
   *     // Cancel all pending requests before component is destroyed
   *     this.abortManager.abortAll();
   *   }
   * }
   * ```
   *
   * @example User logout flow
   * ```typescript
   * async function logout() {
   *   // Cancel all ongoing API requests
   *   apiAbortManager.abortAll();
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
   *   const abortManagerRef = useRef(new AbortManager('DataFetcherManager'));
   *
   *   useEffect(() => {
   *     const manager = abortManagerRef.current;
   *
   *     // Start multiple fetch operations
   *     fetchUsers(manager);
   *     fetchPosts(manager);
   *     fetchComments(manager);
   *
   *     return () => {
   *       // Cancel all fetches when component unmounts
   *       manager.abortAll();
   *     };
   *   }, []);
   * }
   * ```
   *
   * @example Navigation guard
   * ```typescript
   * router.beforeEach((to, from, next) => {
   *   // Cancel all pending requests before navigation
   *   pageAbortManager.abortAll();
   *   next();
   * });
   * ```
   */
  public abortAll(): void {
    const wrappersSnapshot = Array.from(this.wrappers.entries());

    this.wrappers.clear();

    wrappersSnapshot.forEach(([key, wrapper]) => {
      try {
        if (!wrapper.controller.signal.aborted) {
          wrapper.controller.abort(
            new AbortError('All operations were aborted', key)
          );
        }
      } catch {
        // Ignore abort errors
      }

      try {
        wrapper.cleanup?.();
      } catch {
        // Ignore cleanup errors
      }
    });
  }

  /**
   * Runs an async workflow with automatic `AbortManager` registration and cleanup.
   *
   * This helper aims to keep your code as close to a normal Promise workflow as possible:
   * - It calls `register()` to create an abortable `signal`
   * - It guarantees `cleanup(abortId)` is called when the returned promise settles
   * - You can register additional finalizers via `finalizer(fn)` if you need to release
   *   other resources (timers, listeners, etc.)
   *
   * Cleanup order is safe by default:
   * - User finalizers run first
   * - `manager.cleanup(abortId)` runs last
   *
   * @override
   * @example Basic usage
   * ```ts
   * const manager = new AbortManager();
   *
   * // use default abortId and signal
   * // not abort timeout, only abort signal
   * const data = await manager.autoCleanup(
   *   ({ signal }) => fetch(url, { signal }).then(r => r.json()),
   * );
   * ```
   *
   * @example
   * ```ts
   * const manager = new AbortManager();
   *
   * const data = await manager.autoCleanup(
   *   ({ signal }) => fetch(url, { signal }).then(r => r.json()),
   *   { abortId: 'fetch-data' }
   * );
   *
   * // you can use abortId and signal to cancel the operation in other places
   * manager.abort('fetch-data');
   * ```
   */
  public autoCleanup<R>(
    factory: (ctx: {
      abortId: AbortManagerId;
      signal: AbortSignal;
    }) => Promise<R>,
    config?: T
  ): Promise<R> {
    const { abortId, signal } = this.register(config ?? ({} as T));

    try {
      const result = factory({ abortId, signal });
      return Promise.resolve(result).finally(() => this.cleanup(abortId));
    } catch (error) {
      // Handle synchronous errors from factory
      this.cleanup(abortId);
      return Promise.reject(error);
    }
  }

  /**
   * @override
   */
  public getSignal(abortId: AbortManagerId): AbortSignal | undefined {
    return this.wrappers.get(abortId)?.controller.signal;
  }
}
