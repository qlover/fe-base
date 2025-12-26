import {
  ExecutorPlugin,
  PromiseTask,
  ExecutorContext,
  ExecutorError
} from '../interface';
import { RetryPool, RetryOptions } from '../../pools/RetryPool';

// Re-export RetryOptions for backward compatibility
export type { RetryOptions } from '../../pools/RetryPool';

/**
 * Plugin that implements retry logic for failed task executions
 *
 * This class provides a mechanism to retry failed tasks with configurable
 * options such as maximum retries, delay strategies, and custom retry conditions.
 *
 * - Core Idea: Enhance task execution reliability through retries.
 * - Main Function: Retry failed tasks based on specified conditions and strategies.
 * - Main Purpose: Improve success rates of task executions by handling transient errors.
 *
 * **v2.6.0  After the release of RetryPool, the core logic has been refactored. Please refer to {@link RetryPool} for more details. **
 *
 * @implements {ExecutorPlugin}
 *
 * @example
 * ```typescript
 * const retryPlugin = new RetryPlugin({
 *   maxRetries: 5,
 *   retryDelay: 2000,
 *   useExponentialBackoff: true,
 *   shouldRetry: (error) => error.message !== 'Invalid credentials'
 * });
 * ```
 *
 * @category RetryPlugin
 */
export class RetryPlugin implements ExecutorPlugin {
  /**
   * The pluginName of the plugin
   */
  public readonly pluginName = 'RetryPlugin';

  /**
   * Ensures only one instance of RetryPlugin is used per executor
   */
  public readonly onlyOne = true;

  /**
   * Normalized options with defaults applied
   */
  private readonly options: RetryOptions;

  /**
   * Retry pool instance for managing retry logic
   *
   * @protected
   */
  protected readonly retryPool: RetryPool;

  /**
   * Constructs a new instance of RetryPlugin with specified options.
   *
   * This constructor initializes the RetryPlugin with user-defined options,
   * applying default values where necessary and clamping the maxRetries value.
   *
   * @param options - Partial configuration options for retry behavior
   *
   * @example
   * ```typescript
   * const retryPlugin = new RetryPlugin({
   *   maxRetries: 5,
   *   retryDelay: 2000,
   *   useExponentialBackoff: true
   * });
   * ```
   */
  constructor(options: Partial<RetryOptions> = {}) {
    this.retryPool = new RetryPool(this.pluginName);
    this.options = this.retryPool.normalizeOptions(options);
  }

  /**
   * Custom execution hook that implements retry logic
   *
   * This method intercepts task execution to add retry capability,
   * executing the task with the configured retry logic.
   *
   * @override
   * @template T - Type of task return value
   * @param task - Task to be executed with retry support
   * @returns Promise resolving to task result
   *
   * @example
   * ```typescript
   * const result = await retryPlugin.onExec(() => fetchData());
   * ```
   */
  public async onExec(
    _context: ExecutorContext<unknown>,
    task: PromiseTask<unknown, unknown>
  ): Promise<PromiseTask<unknown, unknown> | unknown> {
    // no retry, just pass through
    if (this.options.maxRetries < 1) {
      return undefined; // Let other plugins handle execution
    }

    // Return a wrapper function that applies retry logic
    return async (ctx: ExecutorContext<unknown>): Promise<unknown> => {
      return await this.retry(task, ctx, this.options, this.options.maxRetries);
    };
  }

  /**
   * Core retry implementation
   *
   * This method delegates to RetryPool to execute the retry logic.
   * It adapts the executor-specific PromiseTask and ExecutorContext to
   * a simple function for RetryPool, then handles the result.
   *
   * @template Result - Type of task return value
   * @template Params - Type of executor context parameters
   * @param fn - Function to retry
   * @param context - Executor context containing parameters and metadata
   * @param options - Retry configuration options
   * @param retryCount - Number of retries remaining
   * @throws {ExecutorError} When all retry attempts fail
   * @returns Promise resolving to task result
   *
   * @example
   * ```typescript
   * const result = await retryPlugin.retry(fetchData, context, options, 3);
   * ```
   */
  public async retry<Result, Params = unknown>(
    fn: PromiseTask<Result, Params>,
    context: ExecutorContext<Params>,
    options: RetryOptions,
    retryCount: number
  ): Promise<Result | undefined> {
    const result = await this.retryPool.retry(
      () => fn(context),
      options,
      retryCount
    );

    // If RetryPool returns ExecutorError, throw it to maintain plugin behavior
    if (result instanceof ExecutorError) {
      throw result;
    }

    return result;
  }
}
