import {
  type ExecutorPlugin,
  type ExecutorContext,
  ExecutorError
} from '../../executor';
import {
  AbortPoolConfig,
  AbortManager,
  AbortPoolId
} from '../../pools/AbortManager';
import { AbortError, isAbortError } from '../../pools/AbortError';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Configuration interface for AbortPlugin
 *
 * Defines the parameters needed to control request cancellation behavior,
 * including identifiers, abort signals, timeout settings, and callback functions
 */
export interface AbortPluginConfig extends AbortPoolConfig {
  /**
   * Unique identifier for the abort operation
   *
   * Used to identify and manage specific abort controller instances
   * If not provided, will use `requestId` or auto-generated value
   *
   * @deprecated Use `abortId` instead
   * @example `"user-profile-fetch"`
   */
  id?: string;
  /**
   * Request unique identifier
   *
   * Alternative to `id`, used for identifying specific requests
   * Useful when tracking requests across different systems
   *
   * @deprecated Use `abortId` instead
   * @optional
   * @example `"req_123456789"`
   */
  requestId?: string;
}

/**
 * Configuration extractor function type
 *
 * Extracts `AbortPluginConfig` from executor context parameters
 * Enables flexible configuration passing in different execution contexts
 *
 * @template T - Type of the parameters object
 * @param parameters - Executor context parameters
 * @returns Extracted abort configuration
 *
 * @example
 * ```typescript
 * const extractor: AbortConfigExtractor<MyParams> = (params) => ({
 *   id: params.requestId,
 *   abortTimeout: params.timeout,
 *   signal: params.customSignal
 * });
 * ```
 */
export type AbortConfigExtractor<T> = (parameters: T) => AbortPluginConfig;

class AbortPluginPool extends AbortManager<AbortPluginConfig> {
  public override generateAbortedId(
    config?: AbortPluginConfig | undefined
  ): AbortPoolId {
    if (config) {
      // Prioritize requestId or id, otherwise use auto-incremented counter
      const { requestId, id } = config;
      return requestId || id || super.generateAbortedId(config);
    }

    return super.generateAbortedId(config);
  }
}

/**
 * Configuration options for initializing AbortPlugin
 *
 * Defines optional settings for logger integration, default timeout,
 * and custom configuration extraction logic
 *
 * @template T - Type of the executor parameters
 */
export interface AbortPluginOptions<T> {
  /**
   * Logger instance for debugging and monitoring
   *
   * When provided, the plugin will log abort events, timeouts,
   * and cleanup operations for debugging purposes
   *
   * @optional
   * @example
   * ```typescript
   * import { Logger } from '@qlover/logger';
   * const logger = new Logger({ level: 'debug' });
   * ```
   */
  logger?: LoggerInterface;

  /**
   * Default timeout duration for all requests
   *
   * @optional
   * @example
   * ```typescript
   * timeout: 10000 // 10 seconds default timeout
   * ```
   */
  timeout?: number;

  /**
   * Custom configuration extractor function
   *
   * Extracts `AbortPluginConfig` from executor context parameters
   * Allows customization of how abort configuration is retrieved
   *
   * @default Direct cast of parameters to `AbortPluginConfig`
   * @optional
   * @example
   * ```typescript
   * getConfig: (params) => ({
   *   id: params.requestId,
   *   abortTimeout: params.customTimeout,
   *   signal: params.abortSignal
   * })
   * ```
   */
  getConfig?: AbortConfigExtractor<T>;
}

/**
 * Executor plugin for managing request cancellation and timeout handling
 *
 *
 *
 * Core concept:
 * Provides comprehensive abort control for asynchronous operations by managing
 * `AbortController` instances, timeout mechanisms, and cleanup operations.
 * Integrates seamlessly with the executor plugin system to handle operation
 * lifecycle and error management.
 *
 * Main features:
 * - Request cancellation: Manual and automatic abort control with per-request tracking
 *   - Generates unique identifiers for each request
 *   - Manages `AbortController` instances lifecycle
 *   - Supports both programmatic and user-triggered cancellation
 *   - Prevents duplicate requests by aborting previous ones with same ID
 *
 * - Timeout management: Automatic operation timeout with configurable duration
 *   - Sets up timeout timers for each operation
 *   - Automatically aborts operations exceeding timeout
 *   - Provides timeout-specific error information
 *   - Cleans up timers to prevent memory leaks
 *
 * - Signal integration: Seamless integration with AbortSignal API
 *   - Creates and manages `AbortSignal` instances
 *   - Supports external signal injection
 *   - Provides `raceWithAbort` for signal-unaware operations
 *   - Handles signal events and state changes
 *
 * - Resource cleanup: Automatic cleanup of controllers and timers
 *   - Removes completed operation resources
 *   - Clears timeout timers on success or error
 *   - Prevents memory leaks from abandoned operations
 *   - Supports batch cleanup with `abortAll()`
 *
 * - Error handling: Rich abort error information with context
 *   - Distinguishes between manual and timeout aborts
 *   - Provides detailed error descriptions
 *   - Maintains error context across plugin lifecycle
 *   - Supports custom error callbacks via `onAborted`
 *
 * **v2.6.0  After the release of AbortManager, the core logic has been refactored. Please refer to {@link AbortManager} for more details. **
 *
 * @template TParameters - Type of executor context parameters, defaults to `AbortPluginConfig`
 *
 * @example Basic usage with executor
 * ```typescript
 * import { Executor } from '@/executor';
 * import { AbortPlugin } from '@/executor/plugins';
 *
 * const executor = new Executor();
 * const abortPlugin = new AbortPlugin();
 * executor.use(abortPlugin);
 *
 * // Execute with abort support
 * const result = await executor.execute({
 *   id: 'fetch-users',
 *   abortTimeout: 5000
 * });
 * ```
 *
 * @example Manual abort
 * ```typescript
 * const abortPlugin = new AbortPlugin();
 * executor.use(abortPlugin);
 *
 * // Start operation
 * const promise = executor.execute({ id: 'long-running-task' });
 *
 * // Cancel after 2 seconds
 * setTimeout(() => {
 *   abortPlugin.abort('long-running-task');
 * }, 2000);
 * ```
 *
 * @example With custom configuration extractor
 * ```typescript
 * interface MyParams {
 *   requestId: string;
 *   timeout: number;
 *   customSignal?: AbortSignal;
 * }
 *
 * const abortPlugin = new AbortPlugin<MyParams>({
 *   logger: myLogger,
 *   getConfig: (params) => ({
 *     id: params.requestId,
 *     abortTimeout: params.timeout,
 *     signal: params.customSignal
 *   })
 * });
 * ```
 *
 * @example With abort callback
 * ```typescript
 * await executor.execute({
 *   id: 'upload-file',
 *   abortTimeout: 30000,
 *   onAborted: (config) => {
 *     console.log(`Upload ${config.id} was cancelled`);
 *     // Clean up temporary files
 *     cleanupTempFiles();
 *   }
 * });
 * ```
 *
 * @example Abort all pending operations
 * ```typescript
 * // Start multiple operations
 * executor.execute({ id: 'task-1' });
 * executor.execute({ id: 'task-2' });
 * executor.execute({ id: 'task-3' });
 *
 * // Cancel all at once
 * abortPlugin.abortAll();
 * ```
 */
export class AbortPlugin<TParameters extends AbortPluginConfig>
  implements ExecutorPlugin
{
  /**
   * Plugin identifier name
   *
   * Used by the executor system to identify this plugin
   */
  public readonly pluginName = 'AbortPlugin';

  /**
   * Ensures only one instance of this plugin can be registered
   *
   * Prevents conflicts from multiple abort plugin instances
   */
  public readonly onlyOne = true;

  /**
   * Configuration extractor function
   *
   * Extracts `AbortPluginConfig` from executor parameters
   * Enables flexible configuration in different contexts
   *
   * @protected
   */
  protected readonly getConfig: AbortConfigExtractor<TParameters>;

  /**
   * Optional logger instance for debugging
   *
   * When provided, logs abort events, timeouts, and cleanup operations
   *
   * @protected
   * @optional
   */
  protected readonly logger?: LoggerInterface;

  /**
   * Default timeout duration for all requests
   *
   * Applied to all requests unless overridden by individual request config's `abortTimeout`
   *
   * @protected
   * @optional
   */
  protected readonly timeout?: number;

  /**
   * Abort pool instance for managing abort controllers and resources
   *
   * @protected
   */
  protected readonly abortPool: AbortManager<AbortPluginConfig>;

  /**
   * Creates a new AbortPlugin instance
   *
   * @param options - Plugin configuration options
   * @param options.logger - Logger instance for debugging and monitoring
   * @param options.timeout - Default timeout duration for all requests
   * @param options.getConfig - Custom configuration extractor function
   *
   * @example With logger
   * ```typescript
   * import { Logger } from '@qlover/logger';
   *
   * const abortPlugin = new AbortPlugin({
   *   logger: new Logger({ level: 'debug' })
   * });
   * ```
   *
   * @example With custom extractor
   * ```typescript
   * const abortPlugin = new AbortPlugin({
   *   getConfig: (params) => ({
   *     id: params.customId,
   *     abortTimeout: params.maxWaitTime
   *   })
   * });
   * ```
   */
  constructor(options?: AbortPluginOptions<TParameters>) {
    // Default configuration extractor: directly cast parameters to AbortPluginConfig
    this.getConfig =
      options?.getConfig ||
      ((parameters) => parameters as unknown as AbortPluginConfig);

    this.logger = options?.logger;
    this.timeout = options?.timeout;
    this.abortPool = new AbortPluginPool(this.pluginName);
  }

  /**
   * Checks if an error is abort-related (static utility method)
   *
   * Comprehensive check for various abort error types including custom `AbortError`,
   * native browser `AbortError`, `ExecutorError` with abort ID, `DOMException`,
   * and abort events. Can be used independently without plugin instance.
   *
   * Detection logic:
   * 1. Custom `AbortError` instance
   * 2. Native `Error` with name 'AbortError'
   * 3. `ExecutorError` with `ABORT_ERROR_ID`
   * 4. `DOMException` with name 'AbortError'
   * 5. `Event` with type 'abort'
   *
   * @param error - Error object to check
   * @returns `true` if error is abort-related, `false` otherwise
   *
   * @example Basic usage
   * ```typescript
   * try {
   *   await fetch(url, { signal });
   * } catch (error) {
   *   if (AbortPlugin.isAbortError(error)) {
   *     console.log('Request was cancelled');
   *   } else {
   *     console.error('Request failed:', error);
   *   }
   * }
   * ```
   *
   * @example In error handler
   * ```typescript
   * function handleError(error: unknown) {
   *   if (AbortPlugin.isAbortError(error)) {
   *     // User cancelled - don't show error message
   *     return;
   *   }
   *   showErrorNotification(error);
   * }
   * ```
   */
  public static isAbortError(error?: unknown): error is AbortError {
    return isAbortError(error);
  }

  /**
   * Generates unique request identifier from configuration
   *
   * Priority order:
   * 1. `requestId` from config
   * 2. `id` from config
   * 3. Auto-generated identifier: `{pluginName}-{counter}`
   *
   * @param config - Abort plugin configuration
   * @returns Unique request identifier string
   *
   * @protected
   * @example
   * ```typescript
   * // With requestId
   * generateRequestKey({ requestId: 'fetch-user' }) // "fetch-user"
   *
   * // With id
   * generateRequestKey({ id: 'upload-file' }) // "upload-file"
   *
   * // Auto-generated
   * generateRequestKey({}) // "AbortPlugin-1"
   * ```
   */
  protected generateRequestKey(config: AbortPluginConfig): string {
    return this.abortPool.generateAbortedId(config);
  }

  /**
   * Cleans up resources associated with a request
   *
   * Removes abort controller and clears timeout timer for the specified request
   * Prevents memory leaks by releasing references and stopping timers
   * Only logs when resources actually exist to avoid noise
   *
   * @param config - Configuration object or request identifier string
   *
   * @example With config object
   * ```typescript
   * cleanup({ id: 'fetch-users' });
   * ```
   *
   * @example With identifier string
   * ```typescript
   * cleanup('fetch-users');
   * ```
   */
  public cleanup(config: AbortPluginConfig | string): void {
    this.abortPool.cleanup(config);
  }

  /**
   * Executor lifecycle hook: called before operation execution
   *
   * Performs the following setup operations:
   * 1. Extracts abort configuration from context parameters
   * 2. Generates unique request key
   * 3. Aborts any existing request with same key (prevents duplicates)
   * 4. Creates new `AbortController` if signal not provided
   * 5. Sets up timeout timer if `abortTimeout` configured (or uses default timeout)
   * 6. Injects abort signal into configuration
   *
   * @override
   * @param context - Executor context containing parameters and metadata
   *
   * @example Configuration in context
   * ```typescript
   * executor.execute({
   *   id: 'fetch-data',
   *   abortTimeout: 5000,
   *   onAborted: (config) => console.log('Aborted:', config.id)
   * });
   * ```
   *
   * @example With default timeout
   * ```typescript
   * const abortPlugin = new AbortPlugin({ timeout: 10000 });
   * // All requests will use 10s timeout unless overridden
   * executor.execute({ id: 'fetch-data' }); // Uses 10s timeout
   * executor.execute({ id: 'fetch-data', abortTimeout: 5000 }); // Uses 5s timeout
   * ```
   */
  public onBefore(context: ExecutorContext<TParameters>): void {
    // Use config extractor to get configuration
    const config = this.getConfig(context.parameters);

    // Apply default timeout if not specified in config
    // Only apply if timeout is defined and config doesn't have abortTimeout
    if (
      this.timeout !== undefined &&
      (config.abortTimeout === undefined || config.abortTimeout === null)
    ) {
      Object.assign(config, { abortTimeout: this.timeout });
    }

    this.abortPool.abort(config);

    const { signal } = this.abortPool.register(config);

    // Inject abort signal into configuration
    config.signal = signal;
  }

  /**
   * Executor lifecycle hook: called after successful execution
   *
   * Cleans up resources (controller and timeout) for completed operation
   * Ensures no memory leaks from successful operations
   *
   * @override
   * @param context - Executor context containing parameters and metadata
   *
   * @example
   * ```typescript
   * // After successful execution, resources are automatically cleaned
   * await executor.execute({ id: 'task-1' });
   * // AbortController and timeout for 'task-1' are now removed
   * ```
   */
  public onSuccess({ parameters }: ExecutorContext<TParameters>): void {
    // Delete controller and clear timeout
    if (parameters) {
      const config = this.getConfig(parameters);
      const key = this.generateRequestKey(config);
      this.cleanup(key);
    }
  }

  /**
   * Executor lifecycle hook: called when execution fails
   *
   * Handles abort-related errors and cleans up resources
   *
   * Error handling logic:
   * 1. Check if error is abort-related using `isAbortError()`
   * 2. If abort error: Extract reason from signal, cleanup resources, return `AbortError`
   * 3. If other error: Still cleanup resources to prevent leaks
   *
   * @override
   * @param context - Executor context containing error, parameters, and metadata
   * @returns `AbortError` if error is abort-related, `void` otherwise
   *
   * @example Abort error handling
   * ```typescript
   * try {
   *   await executor.execute({ id: 'task-1', abortTimeout: 100 });
   * } catch (error) {
   *   if (error instanceof AbortError) {
   *     console.log(error.message);
   *     // "The operation was aborted due to timeout"
   *   }
   * }
   * ```
   */
  public onError({
    error,
    parameters
  }: ExecutorContext<TParameters>): ExecutorError | void {
    if (!parameters) return;

    const key = this.generateRequestKey(this.getConfig(parameters));

    // Only handle plugin-related errors, other errors should be handled by other plugins
    if (AbortPlugin.isAbortError(error)) {
      // Controller may be deleted in .abort(), this will be undefined
      const signal = this.abortPool.getSignal(key);
      const reason = signal?.reason;

      this.cleanup(key);

      // If signal.reason is already AbortError, return it directly
      if (reason instanceof AbortError) {
        return reason;
      }

      // Otherwise create new AbortError
      return new AbortError(
        reason?.message || error?.message || 'The operation was aborted',
        key
      );
    } else {
      // Cleanup resources even for non-abort errors
      this.cleanup(key);
    }
  }

  /**
   * Manually aborts a specific operation
   *
   * Triggers abort for the specified request, calls `onAborted` callback if provided,
   * and cleans up all associated resources
   *
   * @param config - Configuration object with request identifier or identifier string
   * @returns `true` if operation was aborted, `false` if no matching operation found
   *
   * @example Abort by ID
   * ```typescript
   * abortPlugin.abort('fetch-users');
   * ```
   *
   * @example Abort with config
   * ```typescript
   * abortPlugin.abort({ id: 'upload-file' });
   * ```
   *
   * @example Conditional abort
   * ```typescript
   * if (userClickedCancel) {
   *   const aborted = abortPlugin.abort('long-task');
   *   if (aborted) {
   *     console.log('Task cancelled successfully');
   *   }
   * }
   * ```
   */
  public abort(config: AbortPluginConfig | AbortPoolId): boolean {
    return this.abortPool.abort(config);
  }

  /**
   * Aborts all pending operations
   *
   * Iterates through all active controllers, aborts each operation,
   * and clears all controllers and timeout timers
   *
   * Use cases:
   * - User logs out
   * - Component unmounts
   * - Application shutdown
   * - Navigation away from page
   *
   * @example Component cleanup
   * ```typescript
   * class MyComponent {
   *   private abortPlugin = new AbortPlugin();
   *
   *   onDestroy() {
   *     // Cancel all pending requests
   *     this.abortPlugin.abortAll();
   *   }
   * }
   * ```
   *
   * @example User logout
   * ```typescript
   * function logout() {
   *   abortPlugin.abortAll(); // Cancel all API calls
   *   clearUserData();
   *   redirectToLogin();
   * }
   * ```
   */
  public abortAll(): void {
    this.abortPool.abortAll();
  }

  /**
   * Wraps an async operation with Promise.race to ensure abort signal responsiveness
   *
   * Defensive mechanism for operations that don't natively check abort signals.
   * Uses promise racing to interrupt operations when signal is aborted,
   * even if the underlying operation ignores the signal.
   *
   * @template T - Type of the promise result
   * @param promise - Promise to wrap with abort capability
   * @param signal - AbortSignal to monitor, if not provided returns original promise
   * @returns Wrapped promise that rejects immediately when signal is aborted
   *
   * @example Basic usage
   * ```typescript
   * const controller = new AbortController();
   * const result = await abortPlugin.raceWithAbort(
   *   fetch('/api/data'), // Even if fetch doesn't check signal
   *   controller.signal
   * );
   * ```
   *
   * @example With third-party library
   * ```typescript
   * const result = await abortPlugin.raceWithAbort(
   *   legacyApiCall(), // Library doesn't support abort
   *   signal
   * );
   * ```
   *
   * @example Without signal (pass-through)
   * ```typescript
   * // When signal is not provided, returns original promise
   * const result = await abortPlugin.raceWithAbort(somePromise());
   * ```
   */
  public raceWithAbort<T>(
    promise: Promise<T>,
    signal?: AbortSignal | null
  ): Promise<T> {
    // If no signal provided, return original promise
    if (!signal) {
      return promise;
    }

    // If signal is already aborted, reject immediately
    if (signal.aborted) {
      return Promise.reject(
        signal.reason ||
          new AbortError('The operation was aborted', undefined, undefined)
      );
    }

    // Create a promise that rejects when signal is aborted
    let removeAbortListener: (() => void) | undefined;
    const abortPromise = new Promise<T>((_, reject) => {
      const abortHandler = () => {
        reject(
          signal.reason ||
            new AbortError('The operation was aborted', undefined, undefined)
        );
      };

      signal.addEventListener('abort', abortHandler, { once: true });
      removeAbortListener = () => {
        signal.removeEventListener('abort', abortHandler);
      };
    });

    // Race between the original promise and abort promise
    return Promise.race([promise, abortPromise]).finally(() => {
      // Clean up event listener to prevent memory leak
      if (removeAbortListener) {
        removeAbortListener();
      }
    });
  }
}
