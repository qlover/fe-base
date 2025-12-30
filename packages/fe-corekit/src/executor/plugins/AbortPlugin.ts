import {
  AbortError,
  AbortManager,
  AbortManagerConfig,
  AbortManagerId,
  AbortManagerInterface,
  isAbortError
} from '../../managers';
import {
  type ExecutorPlugin,
  type ExecutorContext,
  ExecutorError
} from '../../executor';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Configuration extractor function type for AbortPlugin
 *
 * Extracts `AbortManagerConfig` from executor context parameters.
 * Enables flexible configuration passing in different execution contexts
 * by mapping custom parameter structures to the standard abort configuration format.
 *
 * @template T - Type of the input parameters object
 * @param parameters - Executor context parameters to extract configuration from
 * @returns Extracted abort configuration compatible with `AbortManagerConfig`
 *
 * @example Basic usage
 * ```typescript
 * const extractor: AbortConfigExtractor<MyParams> = (params) => ({
 *   abortId: params.requestId,
 *   abortTimeout: params.timeout,
 *   signal: params.customSignal
 * });
 * ```
 *
 * @example Complex mapping
 * ```typescript
 * interface ApiRequestParams {
 *   url: string;
 *   method: 'GET' | 'POST';
 *   timeoutMs?: number;
 *   requestId?: string;
 * }
 *
 * const extractor: AbortConfigExtractor<ApiRequestParams> = (params) => ({
 *   abortId: params.requestId || `api-${params.method}-${Date.now()}`,
 *   abortTimeout: params.timeoutMs || 30000,
 *   onAborted: (config) => {
 *     console.log(`API request aborted: ${config.abortId}`);
 *   }
 * });
 * ```
 */
export type AbortConfigExtractor<T> = (parameters: T) => AbortManagerConfig;

/**
 * Configuration options for initializing AbortPlugin
 *
 * Defines comprehensive settings for customizing AbortPlugin behavior,
 * including logger integration, default timeout, custom configuration extraction,
 * and dependency injection of abort manager instance.
 *
 * @template T - Type of the executor context parameters
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
   * Extracts `AbortManagerConfig` from executor context parameters
   * Allows customization of how abort configuration is retrieved
   *
   * @default Direct cast of parameters to `AbortManagerConfig`
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

  /**
   * Custom abort manager instance for managing abort controllers and resources
   *
   * Allows dependency injection of a custom abort manager implementation.
   * Useful for testing, custom abort logic, or sharing abort state across multiple plugins.
   * Must implement the `AbortManagerInterface<AbortManagerConfig>` contract.
   *
   * @default `new AbortManager<AbortManagerConfig>(this.pluginName)`
   * @optional
   * @example Basic usage
   * ```typescript
   * abortManager: new AbortManager<AbortManagerConfig>('MyCustomPool')
   * ```
   *
   * @example For testing
   * ```typescript
   * abortManager: mockAbortManager // Mock implementation for unit tests
   * ```
   *
   * @example Shared abort manager
   * ```typescript
   * const sharedManager = new AbortManager('SharedPool');
   * const plugin1 = new AbortPlugin({ abortManager: sharedManager });
   * const plugin2 = new AbortPlugin({ abortManager: sharedManager });
   * ```
   */
  abortManager?: AbortManagerInterface<AbortManagerConfig>;

  /**
   * Plugin name
   *
   * Used by the executor system to identify this plugin
   *
   * @default 'AbortPlugin'
   */
  pluginName?: string;
}

/**
 * Executor plugin for managing request cancellation and timeout handling
 *
 * **Architecture**: Uses composition over inheritance by implementing `AbortManagerInterface`
 * to delegate abort management to specialized abort manager instances.
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
 *   - Manages `AbortController` instances lifecycle via `AbortManagerInterface`
 *   - Supports both programmatic and user-triggered cancellation
 *   - Prevents duplicate requests by aborting previous ones with same ID
 *
 * - Timeout management: Automatic operation timeout with configurable duration
 *   - Sets up timeout timers for each operation via abort manager
 *   - Automatically aborts operations exceeding timeout
 *   - Provides timeout-specific error information
 *   - Cleans up timers to prevent memory leaks
 *
 * - Signal integration: Seamless integration with AbortSignal API
 *   - Creates and manages `AbortSignal` instances via abort manager
 *   - Supports external signal injection
 *   - Handles signal events and state changes
 *
 * - Resource cleanup: Automatic cleanup of controllers and timers
 *   - Removes completed operation resources via abort manager
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
 * **v2.6.0**: Refactored to use `AbortManagerInterface` for better testability and decoupling.
 * The plugin now composes with abort manager instances rather than extending them.
 *
 * **Migration Guide**:
 * - `id` and `requestId` fields are no longer supported. Use `abortId` instead.
 * - Configuration now uses `AbortManagerConfig` instead of `AbortPluginConfig`.
 * - For custom ID generation, implement your own `AbortManagerInterface`.
 *
 * @template TParameters - Type of executor context parameters, defaults to `AbortManagerConfig`
 *
 * @example Basic usage with executor
 * ```typescript
 * import { AsyncExecutor, AbortPlugin } from '@qlover-corekit';
 *
 * const executor = new AsyncExecutor();
 * const abortPlugin = new AbortPlugin();
 * executor.use(abortPlugin);
 *
 * // Execute with abort support
 * const result = await executor.exec({
 *   abortId: 'fetch-users',  // Use abortId instead of id/requestId
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
 * const promise = executor.exec({ abortId: 'long-running-task' });
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
 *     abortId: params.requestId,
 *     abortTimeout: params.timeout,
 *     signal: params.customSignal
 *   })
 * });
 * ```
 *
 * @example With abort callback
 * ```typescript
 * await executor.exec({
 *   abortId: 'upload-file',
 *   abortTimeout: 30000,
 *   onAborted: (config) => {
 *     console.log(`Upload ${config.abortId} was cancelled`);
 *     // Clean up temporary files
 *     cleanupTempFiles();
 *   }
 * });
 * ```
 *
 * @example Abort all pending operations
 * ```typescript
 * // Start multiple operations
 * executor.exec({ abortId: 'task-1' });
 * executor.exec({ abortId: 'task-2' });
 * executor.exec({ abortId: 'task-3' });
 *
 * // Cancel all at once
 * abortPlugin.abortAll();
 * ```
 *
 * @example Dependency injection for testing
 * ```typescript
 * import { AbortManagerInterface } from '@/managers';
 *
 * const mockAbortManager: AbortManagerInterface = {
 *   poolName: 'MockManager',
 *   register: vi.fn(),
 *   abort: vi.fn(),
 *   cleanup: vi.fn(),
 *   abortAll: vi.fn(),
 *   generateAbortedId: vi.fn(),
 * };
 *
 * const plugin = new AbortPlugin({
 *   abortManager: mockAbortManager
 * });
 * ```
 */
export class AbortPlugin<TParameters extends AbortManagerConfig>
  implements ExecutorPlugin<TParameters>
{
  /**
   * Plugin identifier name
   *
   * Used by the executor system to identify this plugin
   */
  public readonly pluginName: string;

  /**
   * Ensures only one instance of this plugin can be registered
   *
   * Prevents conflicts from multiple abort plugin instances
   */
  public readonly onlyOne = true;

  /**
   * Configuration extractor function
   *
   * Extracts `AbortManagerConfig` from executor parameters
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
   * Abort manager instance for managing abort controllers and resources
   *
   * Delegates all abort-related operations to this manager instance.
   * Uses composition pattern to achieve better testability and decoupling.
   * Can be injected via constructor options for dependency injection.
   *
   * @protected
   */
  protected readonly abortManager: AbortManagerInterface<TParameters>;

  /**
   * Creates a new AbortPlugin instance with configurable abort management
   *
   * Initializes the plugin with optional logger, default timeout, custom configuration
   * extractor, and abort manager instance. Uses composition pattern to delegate
   * abort management to the injected abort manager.
   *
   * @param options - Plugin configuration options
   * @param options.logger - Optional logger instance for debugging and monitoring abort events
   * @param options.timeout - Optional default timeout duration (ms) applied to all requests
   * @param options.getConfig - Optional custom function to extract abort config from executor parameters
   * @param options.abortManager - Optional custom abort manager instance (dependency injection)
   *
   * @example Basic usage
   * ```typescript
   * const abortPlugin = new AbortPlugin();
   * ```
   *
   * @example With logger and timeout
   * ```typescript
   * import { Logger } from '@qlover/logger';
   *
   * const abortPlugin = new AbortPlugin({
   *   logger: new Logger({ level: 'debug' }),
   *   timeout: 30000 // 30 second default timeout
   * });
   * ```
   *
   * @example With custom configuration extractor
   * ```typescript
   * interface ApiRequest {
   *   url: string;
   *   requestId: string;
   *   timeout?: number;
   * }
   *
   * const abortPlugin = new AbortPlugin<ApiRequest>({
   *   getConfig: (params) => ({
   *     abortId: params.requestId,
   *     abortTimeout: params.timeout || 10000
   *   })
   * });
   * ```
   *
   * @example Dependency injection for testing
   * ```typescript
   * const mockManager: AbortManagerInterface = { ... };
   * const abortPlugin = new AbortPlugin({
   *   abortManager: mockManager
   * });
   * ```
   */
  constructor(options?: AbortPluginOptions<TParameters>) {
    const { pluginName, ...rest } = options ?? {};

    this.pluginName = pluginName ?? 'AbortPlugin';

    // Default configuration extractor: directly cast parameters to AbortManagerConfig
    this.getConfig =
      rest?.getConfig ||
      ((parameters) => parameters as unknown as AbortManagerConfig);

    this.logger = rest?.logger;
    this.timeout = rest?.timeout;
    this.abortManager =
      rest?.abortManager ??
      new AbortManager<AbortManagerConfig>(this.pluginName);
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
  protected generateRequestKey(config: TParameters): string {
    return this.abortManager.generateAbortedId(config);
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
  public cleanup(config: TParameters | AbortManagerId): void {
    this.abortManager.cleanup(config);
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
   * executor.exec({
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
   * executor.exec({ id: 'fetch-data' }); // Uses 10s timeout
   * executor.exec({ id: 'fetch-data', abortTimeout: 5000 }); // Uses 5s timeout
   * ```
   */
  public onBefore(context: ExecutorContext<TParameters>): void {
    const config = this.getConfig(context.parameters) as TParameters;

    // Apply default timeout if not specified in config
    // Only apply if timeout is defined and config doesn't have abortTimeout
    if (
      this.timeout !== undefined &&
      'abortTimeout' in config &&
      (config.abortTimeout === undefined || config.abortTimeout === null)
    ) {
      Object.assign(config, { abortTimeout: this.timeout });
    }

    this.abortManager.abort(config);

    const { signal } = this.abortManager.register(config);

    // Inject abort signal into context parameters
    Object.assign(context.parameters, { signal });
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
   * await executor.exec({ id: 'task-1' });
   * // AbortController and timeout for 'task-1' are now removed
   * ```
   */
  public onSuccess({ parameters }: ExecutorContext<TParameters>): void {
    // Delete controller and clear timeout
    if (parameters) {
      const config = this.getConfig(parameters) as TParameters;
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
   *   await executor.exec({ id: 'task-1', abortTimeout: 100 });
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

    const key = this.generateRequestKey(
      this.getConfig(parameters) as TParameters
    );

    // Only handle plugin-related errors, other errors should be handled by other plugins
    if (AbortPlugin.isAbortError(error)) {
      // Controller may be deleted in .abort(), this will be undefined
      const signal = this.abortManager.getSignal(key);
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
  public abort(config: TParameters | AbortManagerId): boolean {
    return this.abortManager.abort(config);
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
    this.abortManager.abortAll();
  }
}
