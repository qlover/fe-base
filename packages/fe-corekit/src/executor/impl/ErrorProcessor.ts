import { ExecutorError } from '../interface';
import {
  ExecutorContextInterface,
  ExecutorPluginInterface,
  ExecutorPluginNameType
} from '../interface/ExecutorInterface';
import { ExecutorContextImpl } from './ExecutorContextImpl';
import { HookExecutor } from './HookExecutor';
import { isPromise } from '../utils/isPromise';
import { ExecutorErrorType, DEFAULT_HOOK_ON_ERROR } from '../utils/constants';

/**
 * Error processor for LifecycleExecutor
 *
 * Purpose:
 * Extracted from LifecycleExecutor to handle all error processing logic, including
 * error wrapping, onError hook execution, and error propagation. This separation
 * improves code organization and maintainability.
 *
 * Key Differences from AsyncExecutor/SyncExecutor:
 *
 * Centralized Error Handling:
 * - Single Error Processing Point: All errors go through one processor
 *   - AsyncExecutor/SyncExecutor: Error handling scattered across methods
 *   - LifecycleExecutor: Centralized error processing
 *   - Consistent error handling behavior
 *
 * - Error Type Constants: Uses constants for error types
 *   - `EXECUTOR_SYNC_ERROR`: For synchronous execution errors
 *   - `EXECUTOR_ASYNC_ERROR`: For asynchronous execution errors
 *   - Better error categorization and debugging
 *
 * Unified Sync/Async Error Handling:
 * - Single Implementation: One class handles both sync and async errors
 *   - AsyncExecutor: Only async error handling
 *   - SyncExecutor: Only sync error handling
 *   - LifecycleExecutor: Automatically handles both
 *
 * - Promise-Aware: Properly handles Promise rejections and sync throws
 *   - Detects Promise return values from onError hooks
 *   - Properly chains async error handling
 *   - Consistent error propagation
 *
 * Improved Error Wrapping:
 * - Consistent Error Types: All errors wrapped in ExecutorError
 *   - Better error tracking
 *   - Consistent error interface
 *   - Preserves original error information
 *
 * - Error Context: Errors include execution context
 *   - Error type (sync/async)
 *   - Original error information
 *   - Context state at error time
 *
 * Architecture Benefits:
 * - Separation of Concerns: Error handling logic isolated from execution logic
 * - Testability: Can test error handling independently
 * - Reusability: Can be reused in other executor implementations
 * - Maintainability: Easier to understand and modify error logic
 *
 * Error Handling Flow:
 * 1. Error occurs during execution
 * 2. Error wrapped in ExecutorError (if not already)
 * 3. Error set in context
 * 4. onError hooks executed (can handle or transform error)
 * 5. Final error thrown or returned (based on exec vs execNoError)
 *
 * Usage:
 * This class is used internally by LifecycleExecutor and TaskExecutor.
 * External code should not instantiate this class directly.
 * 
 * @since 2.6.0
 * @template Ctx - Type of context interface
 *
 * @example Internal usage
 * ```typescript
 * const errorProcessor = new ErrorProcessor(hookExecutor);
 * try {
 *   // Execute task
 * } catch (error) {
 *   errorProcessor.processError(error, context, plugins, EXECUTOR_SYNC_ERROR);
 * }
 * ```
 *
 * @see LifecycleExecutor - Main executor class that uses this error processor
 * @see TaskExecutor - Task executor that uses this for error handling
 * @see HookExecutor - Hook executor used for onError hook execution
 *
 * @category ErrorProcessor
 */
export class ErrorProcessor<
  Ctx extends
    ExecutorContextInterface<unknown> = ExecutorContextInterface<unknown>
> {
  constructor(private hookExecutor: HookExecutor<Ctx>) {}

  /**
   * Handle error processing
   *
   * @template Params - Type of context parameters
   * @param context - Execution context
   */
  public handleError<Params>(context: ExecutorContextImpl<Params>): void {
    if (context.hooksRuntimes.returnValue) {
      context.setError(context.hooksRuntimes.returnValue as ExecutorError);
    }
  }

  /**
   * Process and handle execution errors
   * Wraps error, calls onError hooks, and throws the final error
   *
   * @template Result - Type of task return value
   * @template Params - Type of context parameters
   * @param error - The error that occurred
   * @param context - Execution context
   * @param plugins - Array of plugins to check for onError hooks
   * @param errorType - Type of error (EXECUTOR_SYNC_ERROR or EXECUTOR_ASYNC_ERROR)
   * @returns Promise that rejects with the error (for async) or throws (for sync)
   */
  public processError<Result, Params>(
    error: unknown,
    context: ExecutorContextImpl<Params>,
    plugins: ExecutorPluginInterface<Ctx>[],
    errorType: ExecutorErrorType
  ): Promise<Result> | never {
    // Wrap error in ExecutorError if it's not already
    const executorError =
      error instanceof ExecutorError
        ? error
        : new ExecutorError(
            errorType,
            error instanceof Error ? error : new Error(String(error))
          );
    context.setError(executorError);

    // Handle errors with onError hooks
    const errorResult = this.hookExecutor.runHook(
      plugins,
      DEFAULT_HOOK_ON_ERROR as ExecutorPluginNameType,
      context
    );

    if (isPromise(errorResult)) {
      return errorResult.then(() => {
        this.handleError(context);
        throw context.error || executorError;
      }) as Promise<Result>;
    }

    // Sync error handling
    this.handleError(context);
    throw context.error || executorError;
  }
}
