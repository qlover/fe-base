import {
  type ExecutorContextInterface,
  type ExecutorTask,
  type LifecyclePluginInterface
} from '../interface';
import type { RetryInterface, RetryOptions } from '../interface/RetryInterface';

/**
 * Error ID for retry errors
 */
export const RETRY_ERROR_ID = 'RETRY_ERROR';

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
 * **Executor Compatibility:**
 * - ✅ **Supported:** `LifecycleExecutor` - This plugin is designed for use with `LifecycleExecutor`.
 *   The `onExec` method returns a new task function that wraps the original task with retry logic.
 *   `LifecycleExecutor` will detect that the return value is a function and execute it.
 * - ❌ **Not Supported:** `AsyncExecutor` - This plugin no longer supports `AsyncExecutor`.
 *   If you need retry functionality with `AsyncExecutor`, consider migrating to `LifecycleExecutor`.
 *
 * **v2.6.0  Refactored to use Retryer for retry logic. All retry logic is now delegated to Retryer. **
 *
 * @implements {LifecyclePluginInterface<ExecutorContextInterface<RetryOptions, unknown>>}
 *
 * @example Usage with LifecycleExecutor
 * ```typescript
 * import { LifecycleExecutor } from '@qlover/fe-corekit';
 *
 * const executor = new LifecycleExecutor();
 * const retryer = new Retryer({
 *   maxRetries: 5,
 *   retryDelay: 2000,
 *   useExponentialBackoff: true,
 *   shouldRetry: (error) => error.message !== 'Invalid credentials'
 * });
 * executor.use(new RetryPlugin(retryer));
 *
 * const result = await executor.exec(async (ctx) => {
 *   // Task that may fail and will be retried
 *   return await fetchData();
 * });
 * ```
 *
 * @category RetryPlugin
 */
export class RetryPlugin
  implements
    LifecyclePluginInterface<ExecutorContextInterface<RetryOptions, unknown>>
{
  /**
   * The pluginName of the plugin
   */
  public readonly pluginName;

  /**
   * Ensures only one instance of RetryPlugin is used per executor
   */
  public readonly onlyOne = true;

  /**
   * The Retryer instance used for retry operations
   */
  protected readonly retryer: RetryInterface<RetryOptions>;

  /**
   * Constructs a new instance of RetryPlugin with a Retryer instance.
   *
   * This constructor initializes the RetryPlugin with a pre-configured Retryer,
   * which handles all retry logic and configuration.
   *
   * @param retryer - The Retryer instance to use for retry operations
   * @param pluginName - Optional custom name for the plugin
   *
   * @example
   * ```typescript
   * const retryer = new Retryer({
   *   maxRetries: 5,
   *   retryDelay: 2000,
   *   useExponentialBackoff: true
   * });
   * const retryPlugin = new RetryPlugin(retryer);
   * ```
   */
  constructor(retryer: RetryInterface<RetryOptions>, pluginName?: string) {
    this.retryer = retryer;
    this.pluginName = pluginName ?? 'RetryPlugin';
  }

  /**
   * Custom execution hook that implements retry logic using Retryer
   *
   * This method intercepts task execution to add retry capability,
   * using the configured Retryer to handle all retry logic.
   *
   * **Executor Compatibility:**
   * - ✅ **LifecycleExecutor:** This method returns a new `ExecutorTask` function that wraps
   *   the original task with retry logic. `LifecycleExecutor` will detect that the return value
   *   is a function and execute it, applying retry logic automatically.
   * - ❌ **AsyncExecutor:** This method is **NOT compatible** with `AsyncExecutor`. `AsyncExecutor`
   *   expects `onExec` to return a direct value (Promise), not a function. Using this plugin with
   *   `AsyncExecutor` will not work correctly.
   *
   * **Implementation Details:**
   * - Wraps the original task to ensure it always returns a Promise
   * - Uses `Retryer.makeRetriable()` to create a retriable version of the task
   * - Returns a function that `LifecycleExecutor` will execute
   *
   * **Type Compatibility:**
   * - Accepts any parameter type that extends `RetryOptions`
   * - This allows the plugin to work with executors that use extended parameter types
   * - The retry logic only uses `RetryOptions` properties, so extended types are safe
   *
   * @override
   * @template R - Type of task return value
   * @template P - Type of task parameters (must extend RetryOptions)
   * @param _context - Executor context containing parameters and metadata (unused, task receives context when executed)
   * @param task - Task to be executed with retry support
   * @returns A new ExecutorTask function that applies retry logic using Retryer
   *
   * @example Usage with LifecycleExecutor
   * ```typescript
   * const executor = new LifecycleExecutor();
   * executor.use(new RetryPlugin(retryer));
   *
   * // When executor.exec() is called, onExec returns a wrapped function
   * // LifecycleExecutor detects it's a function and executes it with retry logic
   * const result = await executor.exec(async (ctx) => {
   *   return await apiCall();
   * });
   * ```
   *
   * @example Usage with extended parameter types
   * ```typescript
   * interface MyParams extends RetryOptions {
   *   customField: string;
   * }
   *
   * const executor = new LifecycleExecutor<ExecutorContextInterface<MyParams, string>>();
   * executor.use(new RetryPlugin(retryer)); // Works with extended types
   * ```
   */
  public onExec<R, P extends RetryOptions = RetryOptions>(
    _context: ExecutorContextInterface<P, R>,
    task: ExecutorTask<R, P>
  ): ExecutorTask<R, P> {
    const wrappedTask = async (
      ctx: ExecutorContextInterface<P, R>
    ): Promise<R> => {
      const result = task(ctx);
      return result instanceof Promise ? result : Promise.resolve(result);
    };

    // Create a function that accepts RetryOptions for the retryer
    const retriableTask = async (
      ctx: ExecutorContextInterface<RetryOptions, R>
    ): Promise<R> => {
      // Since P extends RetryOptions, we can safely cast P to RetryOptions
      return wrappedTask(ctx as ExecutorContextInterface<P, R>);
    };

    const retriableFn = this.retryer.makeRetriable(retriableTask);

    // Wrap the retriableFn to accept P (which extends RetryOptions)
    return (async (ctx: ExecutorContextInterface<P, R>): Promise<R> => {
      // Since P extends RetryOptions, we can safely cast P to RetryOptions
      return retriableFn(ctx as ExecutorContextInterface<RetryOptions, R>);
    }) as ExecutorTask<R, P>;
  }
}
