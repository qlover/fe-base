import {
  type ExecutorPlugin,
  type ExecutorContext,
  ExecutorError
} from '../../executor';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Configuration interface for AbortPlugin
 *
 * Defines the parameters needed to control request cancellation behavior,
 * including identifiers, abort signals, timeout settings, and callback functions
 */
export interface AbortPluginConfig {
  /**
   * Unique identifier for the abort operation
   *
   * Used to identify and manage specific abort controller instances
   * If not provided, will use `requestId` or auto-generated value
   *
   * @optional
   * @example `"user-profile-fetch"`
   */
  id?: string;

  /**
   * Request unique identifier
   *
   * Alternative to `id`, used for identifying specific requests
   * Useful when tracking requests across different systems
   *
   * @optional
   * @example `"req_123456789"`
   */
  requestId?: string;

  /**
   * Callback function triggered when operation is aborted
   *
   * Receives the abort configuration (excluding the callback itself to prevent recursion)
   * Useful for cleanup operations or user notifications
   *
   * @optional
   * @example
   * ```typescript
   * onAborted: (config) => {
   *   console.log(`Request ${config.id} was cancelled`);
   *   // Perform cleanup operations
   * }
   * ```
   */
  onAborted?<T extends AbortPluginConfig>(config: T): void;

  /**
   * AbortSignal instance for request cancellation
   *
   * If not provided, the plugin will create and manage one automatically
   * Can be provided externally to integrate with existing abort mechanisms
   *
   * @optional
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal MDN}
   */
  signal?: AbortSignal;

  /**
   * Timeout duration in milliseconds
   *
   * When set, the operation will be automatically aborted after this duration
   * Helps prevent hanging requests and manages resource cleanup
   *
   * @optional
   * @default `undefined` (no timeout)
   * @example `5000` // 5 seconds timeout
   * @example `30000` // 30 seconds timeout
   */
  abortTimeout?: number;
}

/**
 * Error identifier constant for abort-related errors
 *
 * Used to identify abort errors in error handling logic
 */
export const ABORT_ERROR_ID = 'ABORT_ERROR';

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
   * Default timeout duration in milliseconds
   *
   * Applied to all requests unless overridden by individual request config
   * Helps establish consistent timeout behavior across the application
   *
   * @optional
   * @default `undefined` (no default timeout)
   * @example `10000` // 10 seconds default timeout
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
 * Custom error class for abort operations
 *
 * Extends `ExecutorError` to provide rich abort-specific error information,
 * including abort identifiers, timeout details, and user-friendly descriptions
 *
 * Core features:
 * - Abort identification: Tracks which operation was aborted via `abortId`
 * - Timeout tracking: Records timeout duration when abort is timeout-triggered
 * - Timeout detection: Provides `isTimeout()` method to distinguish timeout aborts
 * - Friendly descriptions: Generates human-readable error messages with context
 *
 * @example Basic abort error
 * ```typescript
 * const error = new AbortError(
 *   'Operation cancelled by user',
 *   'fetch-user-123'
 * );
 * console.log(error.getDescription());
 * // Output: "Operation cancelled by user (Request: fetch-user-123)"
 * ```
 *
 * @example Timeout abort error
 * ```typescript
 * const error = new AbortError(
 *   'Request timed out',
 *   'api-call-456',
 *   5000
 * );
 * if (error.isTimeout()) {
 *   console.log(`Request ${error.abortId} timed out after ${error.timeout}ms`);
 * }
 * ```
 */
export class AbortError extends ExecutorError {
  /**
   * Unique identifier for the aborted operation
   *
   * Helps track and identify which specific operation was aborted
   * Corresponds to `id` or `requestId` from `AbortPluginConfig`
   *
   * @optional
   * @example `"fetch-user-profile-123"`
   * @example `"upload-file-456"`
   */
  readonly abortId?: string;

  /**
   * Timeout duration in milliseconds
   *
   * Only populated when abort was triggered by a timeout
   * Used to distinguish between manual aborts and timeout-based aborts
   *
   * @optional
   * @example `5000` // 5 seconds timeout
   */
  readonly timeout?: number;

  /**
   * Creates a new AbortError instance
   *
   * @param message - Human-readable error message describing why the operation was aborted
   * @param abortId - Optional identifier for the aborted operation
   * @param timeout - Optional timeout duration in milliseconds (indicates timeout-based abort)
   *
   * @example Manual abort
   * ```typescript
   * new AbortError('User cancelled the upload', 'upload-123')
   * ```
   *
   * @example Timeout abort
   * ```typescript
   * new AbortError('Request exceeded time limit', 'api-call-456', 5000)
   * ```
   */
  constructor(message: string, abortId?: string, timeout?: number) {
    super(ABORT_ERROR_ID, message);
    this.abortId = abortId;
    this.timeout = timeout;
  }

  /**
   * Checks if the abort was triggered by a timeout
   *
   * Useful for distinguishing between manual cancellations and timeout-based aborts,
   * enabling different error handling strategies
   *
   * @returns `true` if abort was caused by timeout, `false` otherwise
   *
   * @example
   * ```typescript
   * try {
   *   await fetchData();
   * } catch (error) {
   *   if (error instanceof AbortError && error.isTimeout()) {
   *     console.log('Request timed out, please try again');
   *   } else {
   *     console.log('Request was cancelled');
   *   }
   * }
   * ```
   */
  isTimeout(): boolean {
    return this.timeout !== undefined && this.timeout > 0;
  }

  /**
   * Generates a user-friendly error description with context
   *
   * Combines the error message with additional context like request ID and timeout duration
   * Provides more informative error messages for debugging and user feedback
   *
   * @returns Formatted error description string
   *
   * @example Without context
   * ```typescript
   * const error = new AbortError('Operation aborted');
   * error.getDescription(); // "Operation aborted"
   * ```
   *
   * @example With request ID
   * ```typescript
   * const error = new AbortError('Operation aborted', 'req-123');
   * error.getDescription(); // "Operation aborted (Request: req-123)"
   * ```
   *
   * @example With timeout context
   * ```typescript
   * const error = new AbortError('Timeout', 'req-456', 5000);
   * error.getDescription(); // "Timeout (Request: req-456, Timeout: 5000ms)"
   * ```
   */
  getDescription(): string {
    const parts: string[] = [];

    if (this.abortId) {
      parts.push(`Request: ${this.abortId}`);
    }

    if (this.isTimeout()) {
      parts.push(`Timeout: ${this.timeout}ms`);
    }

    return parts.length > 0
      ? `${this.message} (${parts.join(', ')})`
      : this.message;
  }
}

/**
 * Executor plugin for managing request cancellation and timeout handling
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
export class AbortPlugin<
  TParameters extends AbortPluginConfig = AbortPluginConfig
> implements ExecutorPlugin
{
  /**
   * Plugin identifier name
   *
   * Used by the executor system to identify this plugin
   */
  readonly pluginName = 'AbortPlugin';

  /**
   * Ensures only one instance of this plugin can be registered
   *
   * Prevents conflicts from multiple abort plugin instances
   */
  readonly onlyOne = true;

  /**
   * Counter for auto-generating request identifiers
   *
   * Incremented each time a new request without ID is processed
   *
   * @private
   */
  private requestCounter = 0;

  /**
   * Map of active abort controllers indexed by request key
   *
   * Stores `AbortController` instances for ongoing operations
   * Enables abort operations by request identifier
   *
   * @protected
   */
  protected readonly controllers: Map<string, AbortController> = new Map();

  /**
   * Map of active timeout timers indexed by request key
   *
   * Stores timeout IDs for cleanup when operations complete
   * Prevents memory leaks from abandoned timers
   *
   * @protected
   */
  protected readonly timeouts: Map<string, NodeJS.Timeout> = new Map();

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
  static isAbortError(error?: unknown): error is AbortError {
    // Check if the error is our custom AbortError
    if (error instanceof AbortError) {
      return true;
    }

    // Check if the error is an instance of AbortError
    if (error instanceof Error && error.name === 'AbortError') {
      return true;
    }

    // Check if the error is an ExecutorError with ABORT_ERROR_ID
    if (error instanceof ExecutorError && error?.id === ABORT_ERROR_ID) {
      return true;
    }

    // Check for DOMException with abort-related message
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true;
    }

    // Check for Event with auto trigger abort
    // use: signal.addEventListener('abort')
    if (error instanceof Event && error.type === 'abort') {
      return true;
    }

    // Add any additional conditions that signify an abort error
    // For example, custom error types or specific error codes

    return false;
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
    // Prioritize requestId or id, otherwise use auto-incremented counter
    const { requestId, id } = config;
    return requestId || id || `${this.pluginName}-${++this.requestCounter}`;
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
  cleanup(config: AbortPluginConfig | string): void {
    const key =
      typeof config === 'string' ? config : this.generateRequestKey(config);

    // Only cleanup and log when resources exist
    const hasController = this.controllers.has(key);
    const hasTimeout = this.timeouts.has(key);

    if (hasController || hasTimeout) {
      // Remove controller
      this.controllers.delete(key);

      // Clear timeout timer
      const timeoutId = this.timeouts.get(key);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.timeouts.delete(key);
      }

      this.logger?.debug(`[${this.pluginName}] cleanup: ${key}`);
    }
  }

  /**
   * Executor lifecycle hook: called before operation execution
   *
   * Performs the following setup operations:
   * 1. Extracts abort configuration from context parameters
   * 2. Generates unique request key
   * 3. Aborts any existing request with same key (prevents duplicates)
   * 4. Creates new `AbortController` if signal not provided
   * 5. Sets up timeout timer if `abortTimeout` configured
   * 6. Injects abort signal into configuration
   *
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
   */
  onBefore(context: ExecutorContext<TParameters>): void {
    // Use config extractor to get configuration
    const config = this.getConfig(context.parameters);
    const key = this.generateRequestKey(config);
    const { abortTimeout } = config;

    // Abort previous request with same key
    if (this.controllers.has(key)) {
      this.logger?.debug(
        `[${this.pluginName}] aborting previous request: ${key}`
      );
      this.abort(key);
    }

    // Check if config already has a signal
    if (!config.signal) {
      const controller = new AbortController();
      this.controllers.set(key, controller);

      // Extend config with abort signal
      config.signal = controller.signal;

      // Set up timeout mechanism to prevent memory leaks
      if (abortTimeout && abortTimeout > 0) {
        const timeoutId = setTimeout(() => {
          const ctrl = this.controllers.get(key);
          if (ctrl) {
            ctrl.abort(
              new AbortError(
                'The operation was aborted due to timeout',
                key,
                abortTimeout
              )
            );

            this.logger?.info(
              `[${this.pluginName}] timeout abort: ${key} (${abortTimeout}ms)`
            );

            this.cleanup(key);

            // Trigger onAborted callback
            if (typeof config.onAborted === 'function') {
              config.onAborted({
                ...config,
                onAborted: undefined
              });
            }
          }
        }, abortTimeout);

        this.timeouts.set(key, timeoutId);
      }
    }
  }

  /**
   * Executor lifecycle hook: called after successful execution
   *
   * Cleans up resources (controller and timeout) for completed operation
   * Ensures no memory leaks from successful operations
   *
   * @param context - Executor context containing parameters and metadata
   *
   * @example
   * ```typescript
   * // After successful execution, resources are automatically cleaned
   * await executor.execute({ id: 'task-1' });
   * // AbortController and timeout for 'task-1' are now removed
   * ```
   */
  onSuccess({ parameters }: ExecutorContext<TParameters>): void {
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
   * @param context - Executor context containing error, parameters, and metadata
   * @returns `AbortError` if error is abort-related, `void` otherwise
   *
   * @example Abort error handling
   * ```typescript
   * try {
   *   await executor.execute({ id: 'task-1', abortTimeout: 100 });
   * } catch (error) {
   *   if (error instanceof AbortError) {
   *     console.log(error.getDescription());
   *     // "The operation was aborted due to timeout (Request: task-1, Timeout: 100ms)"
   *   }
   * }
   * ```
   */
  onError({
    error,
    parameters
  }: ExecutorContext<TParameters>): ExecutorError | void {
    if (!parameters) return;

    const config = this.getConfig(parameters);
    const key = this.generateRequestKey(config);

    // Only handle plugin-related errors, other errors should be handled by other plugins
    if (AbortPlugin.isAbortError(error)) {
      // Controller may be deleted in .abort(), this will be undefined
      const controller = this.controllers.get(key);
      const reason = controller?.signal.reason;

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
  abort(config: AbortPluginConfig | string): boolean {
    const key =
      typeof config === 'string' ? config : this.generateRequestKey(config);

    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort(new AbortError('The operation was aborted', key));

      this.logger?.info(`[${this.pluginName}] manual abort: ${key}`);
      this.cleanup(key);

      if (
        typeof config !== 'string' &&
        typeof config.onAborted === 'function'
      ) {
        config.onAborted({
          ...config,
          onAborted: undefined
        });
      }
      return true;
    }

    return false;
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
  abortAll(): void {
    const count = this.controllers.size;

    if (count > 0) {
      this.logger?.debug(`[${this.pluginName}] aborting all ${count} requests`);
    }

    this.controllers.forEach((controller, key) => {
      controller.abort(new AbortError('All operations were aborted', key));
    });
    this.controllers.clear();

    // Clear all timeout timers
    this.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }

  /**
   * Creates a Promise that rejects when signal is aborted
   *
   * Returns both the promise and a cleanup function to remove event listener
   * Prevents memory leaks by allowing proper cleanup of abort event handlers
   *
   * Implementation details:
   * 1. Immediately rejects if signal is already aborted
   * 2. Attaches event listener for future abort events
   * 3. Returns cleanup function to remove listener
   * 4. Uses signal reason if available, otherwise creates new `AbortError`
   *
   * @param signal - AbortSignal to monitor
   * @returns Object containing promise and cleanup function
   * @returns promise - Promise that rejects on abort
   * @returns cleanup - Function to remove event listener
   *
   * @private Internal use only
   *
   * @example Internal usage
   * ```typescript
   * const { promise, cleanup } = this.createAbortPromise(signal);
   * try {
   *   await Promise.race([someOperation(), promise]);
   * } finally {
   *   cleanup(); // Always cleanup to prevent memory leak
   * }
   * ```
   */
  private createAbortPromise(signal: AbortSignal): {
    promise: Promise<never>;
    cleanup: () => void;
  } {
    let cleanup: () => void = () => {};

    const promise = new Promise<never>((_, reject) => {
      // If already aborted, immediately reject
      if (signal.aborted) {
        reject(signal.reason || new AbortError('The operation was aborted'));
        return;
      }

      // Listen for abort event
      const onAbort = () => {
        reject(signal.reason || new AbortError('The operation was aborted'));
      };

      signal.addEventListener('abort', onAbort);

      // Provide cleanup function to remove event listener
      cleanup = () => {
        signal.removeEventListener('abort', onAbort);
      };
    });

    return { promise, cleanup };
  }

  /**
   * Wraps an async operation with `Promise.race` to ensure abort signal responsiveness
   *
   * Defensive mechanism for operations that don't natively check abort signals
   * Uses promise racing to interrupt operations when signal is aborted,
   * even if the underlying operation ignores the signal
   *
   * Use cases:
   * - Third-party APIs that don't support `AbortSignal`
   * - Legacy code without abort handling
   * - Gateway operations that don't check signal
   * - Any async operation needing guaranteed cancellation
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
   *
   * @example Timeout with abort
   * ```typescript
   * const controller = new AbortController();
   * setTimeout(() => controller.abort(), 5000);
   *
   * try {
   *   const result = await abortPlugin.raceWithAbort(
   *     longRunningOperation(),
   *     controller.signal
   *   );
   * } catch (error) {
   *   if (AbortPlugin.isAbortError(error)) {
   *     console.log('Operation timed out');
   *   }
   * }
   * ```
   */
  public raceWithAbort<T>(
    promise: Promise<T>,
    signal?: AbortSignal
  ): Promise<T> {
    if (!signal) {
      return promise;
    }

    const { promise: abortPromise, cleanup } = this.createAbortPromise(signal);

    // Use Promise.race - whichever completes first wins
    return Promise.race([promise, abortPromise]).finally(() => {
      // Always cleanup event listener to prevent memory leaks
      cleanup();
    });
  }
}
