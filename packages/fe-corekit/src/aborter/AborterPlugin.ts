import {
  type AborterConfig,
  AborterId,
  type AborterInterface
} from './AborterInterface';
import { AbortError, isAbortError } from './AbortError';
import { Aborter } from './Aborter';
import type {
  ExecutorContextInterface,
  LifecyclePluginInterface,
  LifecycleErrorResult
} from '../executor/interface';

/**
 * Configuration extractor function type for AborterPlugin
 *
 * Extracts `AborterConfig` from executor context parameters.
 * Enables flexible configuration passing in different execution contexts.
 *
 * @template T - Type of the input parameters object
 * @param parameters - Executor context parameters to extract configuration from
 * @returns Extracted abort configuration compatible with `AborterConfig`
 *
 * @example
 * ```typescript
 * const extractor: AborterConfigExtractor<MyParams> = (params) => ({
 *   abortId: params.requestId,
 *   abortTimeout: params.timeout,
 *   signal: params.customSignal
 * });
 * ```
 */
export type AborterConfigExtractor<T> = (parameters: unknown) => T;

/**
 * Configuration options for initializing AborterPlugin
 *
 * @template T - Type of the executor context parameters
 */
export interface AborterPluginOptions<T extends AborterConfig> {
  /**
   * Default timeout duration for all operations
   *
   * @optional
   * @default `undefined`
   * @example `10000` // 10 seconds default timeout
   */
  timeout?: number;

  /**
   * Custom configuration extractor function
   *
   * Extracts `AborterConfig` from executor context parameters.
   * This is crucial when using the plugin with custom parameter structures.
   *
   * **Important:** Make sure to extract the `signal` property if it exists
   * in the original parameters. The plugin will warn in development mode
   * if `signal` is missing or invalid.
   *
   * @optional
   * @default Direct cast of parameters to `AborterConfig`
   * @example
   * ```typescript
   * // For MessageSender integration
   * getConfig: (params) => ({
   *   abortId: params.currentMessage.id,
   *   signal: params.gatewayOptions?.signal,  // Extract signal!
   *   onAborted: params.gatewayOptions?.onAborted,
   *   abortTimeout: params.gatewayOptions?.timeout
   * })
   * ```
   */
  getConfig?: AborterConfigExtractor<T>;

  /**
   * Custom abort manager instance
   *
   * @optional
   * @default `new Aborter<AborterConfig>(this.pluginName)`
   */
  aborter?: AborterInterface<T>;

  /**
   * Plugin name
   *
   * @optional
   * @default `'AborterPlugin'`
   */
  pluginName?: string;
}

/**
 * Lifecycle plugin for managing operation cancellation with timeout support
 *
 * A lightweight abort management plugin that implements `LifecyclePluginInterface`
 * to provide abort control for executor operations. Supports timeout mechanisms,
 * external signal composition, and automatic resource cleanup.
 *
 * Core concept:
 * Integrates abort management into the executor lifecycle, automatically creating
 * and cleaning up abort controllers for each operation while supporting timeout
 * and external signal composition.
 *
 * Main features:
 * - Lifecycle integration: Hooks into executor lifecycle for automatic management
 *   - `onBefore`: Registers abort operation, injects signal, validates config
 *   - `onError`: Handles abort errors and cleans up resources
 *   - `onFinally`: Ensures cleanup always happens
 *
 * - Timeout support: Automatic operation timeout with configurable duration
 *   - Configure via `abortTimeout` in parameters or default timeout in options
 *   - Triggers `onAbortedTimeout` callback when timeout occurs
 *   - Automatically cleans up timeout timers
 *
 * - Signal composition: Combines multiple abort signals
 *   - Internal controller signal (for manual abort)
 *   - Timeout signal (if timeout configured)
 *   - External signal (if provided in parameters via `getConfig`)
 *
 * - Error handling: Detects and transforms abort errors
 *   - Converts various abort error types to standard `AbortError`
 *   - Preserves abort context (ID, timeout, reason)
 *   - Allows other plugins to handle non-abort errors
 *
 * - Development warnings: Validates configuration in development mode
 *   - Warns if `signal` property is missing from extracted config
 *   - Warns if `signal` is not an `AbortSignal` instance
 *   - Only active when `NODE_ENV !== 'production'`
 *   - Helps catch `getConfig` implementation errors early
 *
 * @template TParams - Type of executor parameters extending `AborterConfig`
 * @template TResult - Type of executor result
 *
 * @example Basic usage
 * ```typescript
 * import { LifecycleExecutor } from '@qlover/fe-corekit';
 * import { AborterPlugin } from '@qlover/fe-corekit/aborter';
 *
 * const executor = new LifecycleExecutor();
 * executor.use(new AborterPlugin());
 *
 * // Execute with abort support
 * await executor.exec(
 *   async ({ signal }) => {
 *     return fetch('/api/data', { signal });
 *   },
 *   { abortTimeout: 5000 }
 * );
 * ```
 *
 * @example With default timeout
 * ```typescript
 * const plugin = new AborterPlugin({ timeout: 10000 });
 * executor.use(plugin);
 *
 * // All operations will have 10s timeout unless overridden
 * await executor.exec(
 *   async ({ signal }) => fetch('/api/data', { signal }),
 *   {} // Uses default 10s timeout
 * );
 * ```
 *
 * @example Manual abort
 * ```typescript
 * const plugin = new AborterPlugin();
 * executor.use(plugin);
 *
 * // Start operation
 * const promise = executor.exec(
 *   async ({ signal }) => fetch('/api/data', { signal }),
 *   { abortId: 'fetch-data' }
 * );
 *
 * // Cancel after 2 seconds
 * setTimeout(() => plugin.abort('fetch-data'), 2000);
 * ```
 *
 * @example With callbacks
 * ```typescript
 * await executor.exec(
 *   async ({ signal }) => fetch('/api/data', { signal }),
 *   {
 *     abortTimeout: 5000,
 *     onAbortedTimeout: (config) => {
 *       console.log('Request timed out');
 *     },
 *     onAborted: (config) => {
 *       console.log('Request cancelled');
 *     }
 *   }
 * );
 * ```
 *
 * @example With custom getConfig (MessageSender integration)
 * ```typescript
 * // Extract AborterConfig from MessageSenderOptions
 * const plugin = new AborterPlugin({
 *   getConfig: (params) => ({
 *     abortId: params.currentMessage.id,
 *     signal: params.gatewayOptions?.signal,      // Important: extract signal
 *     onAborted: params.gatewayOptions?.onAborted,
 *     abortTimeout: params.gatewayOptions?.timeout
 *   })
 * });
 *
 * sender.use(plugin);
 *
 * // Development warning will alert if signal is not extracted correctly
 * ```
 */
export class AborterPlugin<
  TParams extends AborterConfig = AborterConfig,
  TResult = unknown
> implements
    LifecyclePluginInterface<ExecutorContextInterface<TParams, TResult>>
{
  /**
   * Plugin identifier name
   */
  public readonly pluginName: string;

  /**
   * Ensures only one instance of this plugin can be registered
   */
  public readonly onlyOne = true;

  /**
   * Configuration extractor function
   *
   * @protected
   */
  protected readonly getConfig: AborterConfigExtractor<TParams>;

  /**
   * Default timeout duration for all operations
   *
   * @protected
   * @optional
   */
  protected readonly timeout?: number;

  /**
   * Abort manager instance for managing abort controllers
   *
   * @protected
   */
  protected readonly aborter: AborterInterface<TParams>;

  /**
   * Creates a new AborterPlugin instance
   *
   * @param options - Plugin configuration options
   *
   * @example
   * ```typescript
   * const plugin = new AborterPlugin({
   *   timeout: 10000,
   *   pluginName: 'MyAborter'
   * });
   * ```
   */
  constructor(options?: AborterPluginOptions<TParams>) {
    const { pluginName, ...rest } = options ?? {};

    this.pluginName = pluginName ?? 'AborterPlugin';
    this.getConfig = rest?.getConfig || ((parameters) => parameters as TParams);
    this.timeout = rest?.timeout;
    this.aborter = rest?.aborter ?? new Aborter<TParams>(this.pluginName);
  }

  /**
   * Lifecycle hook: called before operation execution
   *
   * Performs the following operations:
   * 1. Extracts configuration using `getConfig`
   * 2. Validates signal extraction (development mode only)
   * 3. Applies default timeout if not specified
   * 4. Aborts any existing operation with the same ID
   * 5. Registers new abort operation
   * 6. Injects signal and abortId into context parameters
   *
   * **Development mode validation:**
   * - Warns if `config.signal` is missing or not an `AbortSignal` instance
   * - Only active when `NODE_ENV !== 'production'`
   * - Helps catch `getConfig` implementation errors
   *
   * @override
   * @param ctx - Executor context containing parameters
   *
   * @example Context after execution
   * ```typescript
   * // Before: ctx.parameters = { abortId: 'task-1' }
   * // After:  ctx.parameters = { abortId: 'task-1', signal: AbortSignal }
   * ```
   */
  public onBefore(
    ctx: ExecutorContextInterface<TParams, TResult>
  ): TParams | void {
    const config = this.getConfig(ctx.parameters) as TParams;

    if (
      process.env.NODE_ENV !== 'production' &&
      !('signal' in config && config.signal instanceof AbortSignal)
    ) {
      console.warn(
        `[${this.pluginName}] Warning: config.signal is missing. Make sure your getConfig extracts the signal property.`
      );
    }

    // Note: this is a security fix: Create new config object instead of mutating original
    // Apply default timeout if not specified in config
    const finalConfig =
      this.timeout !== undefined &&
      'abortTimeout' in config &&
      (config.abortTimeout === undefined || config.abortTimeout === null)
        ? ({ ...config, abortTimeout: this.timeout } as TParams)
        : config;

    this.aborter.abort(finalConfig);

    const { signal, abortId } = this.aborter.register(finalConfig);

    if (typeof ctx.parameters === 'object' && ctx.parameters !== null) {
      ctx.setParameters({ ...ctx.parameters, signal, abortId });
    }
  }

  /**
   * Helper method to cleanup resources from context
   *
   * @param ctx - Executor context
   * @protected
   */
  protected cleanupFromContext(parameters: TParams): void {
    this.aborter.cleanup(parameters);
  }

  /**
   * Lifecycle hook: called when execution fails
   *
   * Handles abort errors and cleans up resources.
   * Returns `AbortError` if error is abort-related, otherwise returns void
   * to allow other plugins to handle the error.
   *
   * @override
   * @param ctx - Executor context containing error
   * @returns `AbortError` if error is abort-related, void otherwise
   */
  public onError(
    ctx: ExecutorContextInterface<TParams, TResult>
  ): LifecycleErrorResult {
    if (!ctx.parameters) return;

    const config = this.getConfig(ctx.parameters) as TParams;

    if (isAbortError(ctx.error)) {
      if (ctx.error instanceof AbortError) {
        return ctx.error;
      }

      let errorMessage = 'The operation was aborted';
      const err = ctx.error as unknown;
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      }

      return new AbortError(errorMessage, config.abortId);
    }
  }

  /**
   * Lifecycle hook: always executed after operation completes
   *
   * Ensures cleanup happens even if other hooks fail.
   * This is the only place where cleanup is performed to avoid redundant calls.
   *
   * @override
   * @param ctx - Executor context
   */
  public onFinally(ctx: ExecutorContextInterface<TParams, TResult>): void {
    if (ctx.parameters) {
      this.cleanupFromContext(ctx.parameters);
    }
  }

  /**
   * Manually aborts a specific operation
   *
   * Delegates to the internal aborter instance. Provides convenient
   * access to abort functionality without exposing the aborter directly.
   *
   * @param config - Configuration object or abort ID string
   * @returns `true` if operation was aborted, `false` if not found
   *
   * @example
   * ```typescript
   * const plugin = new AborterPlugin();
   * executor.use(plugin);
   *
   * // Start operation
   * executor.exec(async ({ signal }) => fetch('/api/data', { signal }), {
   *   abortId: 'fetch-data'
   * });
   *
   * // Cancel after 2 seconds
   * setTimeout(() => plugin.abort('fetch-data'), 2000);
   * ```
   */
  public abort(config: TParams | AborterId): boolean {
    return this.aborter.abort(config);
  }

  /**
   * Aborts all pending operations
   *
   * Delegates to the internal aborter instance. Provides convenient
   * access to abort all functionality without exposing the aborter directly.
   *
   * @example
   * ```typescript
   * const plugin = new AborterPlugin();
   * executor.use(plugin);
   *
   * // Start multiple operations
   * executor.exec(async ({ signal }) => fetch('/api/data1', { signal }), {
   *   abortId: 'fetch-1'
   * });
   * executor.exec(async ({ signal }) => fetch('/api/data2', { signal }), {
   *   abortId: 'fetch-2'
   * });
   *
   * // Cancel all operations
   * plugin.abortAll();
   * ```
   */
  public abortAll(): void {
    this.aborter.abortAll();
  }

  /**
   * Get the internal aborter instance
   *
   * Provides access to the underlying aborter for advanced use cases.
   * Most users should use `abort()` and `abortAll()` methods instead.
   *
   * @returns The internal aborter instance
   *
   * @example
   * ```typescript
   * const plugin = new AborterPlugin();
   * const aborter = plugin.getAborter();
   *
   * // Use advanced aborter features
   * aborter.register({ abortId: 'custom-op' });
   * ```
   */
  public getAborter(): AborterInterface<TParams> {
    return this.aborter;
  }
}
