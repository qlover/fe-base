import { ExecutorError } from '../interface';
import type {
  ExecutorPlugin,
  PromiseTask,
  ExecutorContext
} from '../interface';
import type { RetryOptions, RetryManagerInterface } from '../../managers';

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
 * **v2.6.0  Refactored to use RetryManager for retry logic. All retry logic is now delegated to RetryManager. **
 *
 * @implements {ExecutorPlugin}
 *
 * @example
 * ```typescript
 * const retryManager = new RetryManager({
 *   maxRetries: 5,
 *   retryDelay: 2000,
 *   useExponentialBackoff: true,
 *   shouldRetry: (error) => error.message !== 'Invalid credentials'
 * });
 * const retryPlugin = new RetryPlugin(retryManager);
 * ```
 *
 * @category RetryPlugin
 */
export class RetryPlugin implements ExecutorPlugin<RetryOptions> {
  /**
   * The pluginName of the plugin
   */
  public readonly pluginName;

  /**
   * Ensures only one instance of RetryPlugin is used per executor
   */
  public readonly onlyOne = true;

  /**
   * The RetryManager instance used for retry operations
   */
  protected readonly retryManager: RetryManagerInterface<RetryOptions>;

  /**
   * Constructs a new instance of RetryPlugin with a RetryManager instance.
   *
   * This constructor initializes the RetryPlugin with a pre-configured RetryManager,
   * which handles all retry logic and configuration.
   *
   * @param retryManager - The RetryManager instance to use for retry operations
   * @param pluginName - Optional custom name for the plugin
   *
   * @example
   * ```typescript
   * const retryManager = new RetryManager({
   *   maxRetries: 5,
   *   retryDelay: 2000,
   *   useExponentialBackoff: true
   * });
   * const retryPlugin = new RetryPlugin(retryManager);
   * ```
   */
  constructor(
    retryManager: RetryManagerInterface<RetryOptions>,
    pluginName?: string
  ) {
    this.retryManager = retryManager;
    this.pluginName = pluginName ?? 'RetryPlugin';
  }

  /**
   * Custom execution hook that implements retry logic using RetryManager
   *
   * This method intercepts task execution to add retry capability,
   * using the configured RetryManager to handle all retry logic.
   *
   * @override
   * @template T - Type of task return value
   * @param context - Executor context containing parameters and metadata
   * @param task - Task to be executed with retry support
   * @returns A new function that applies retry logic using RetryManager, or undefined to skip
   *
   * @example
   * ```typescript
   * const wrappedTask = retryPlugin.onExec(context, originalTask);
   * // wrappedTask will apply retry logic using the configured RetryManager
   * ```
   */
  public onExec<R>(
    context: ExecutorContext<RetryOptions>,
    task: PromiseTask<R, unknown>
  ): PromiseTask<R, unknown> | R {
    // Create a wrapper function that merges parameters and applies retry logic using RetryManager
    const retriableTask = this.retryManager.makeRetriable(
      async (...args: unknown[]) => {
        // Extract the context from args (assuming it's the first argument)
        const newContext = args[0] as ExecutorContext<unknown>;

        // Merge context.parameters from the original context with the new context
        const mergedContext: ExecutorContext<unknown> = {
          ...newContext,
          parameters: Object.assign(
            {},
            context.parameters,
            newContext.parameters
          )
        };

        return await task(mergedContext);
      }
    );

    // Return a function that wraps the retriable task and handles errors
    return async (newContext: ExecutorContext<unknown>) => {
      try {
        return await retriableTask(newContext);
      } catch (error: unknown) {
        // Convert error to ExecutorError for consistency
        throw new ExecutorError(
          RETRY_ERROR_ID,
          `All ${this.pluginName} retry attempts failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };
  }
}
