import { ExecutorError } from '../interface';
import type {
  ExecutorAsyncTask,
  ExecutorContextInterface,
  ExecutorPluginNameType,
  ExecutorTask,
  ExecutorSyncTask
} from '../interface/ExecutorInterface';
import type { LifecyclePluginInterface } from '../interface/LifecyclePluginInterface';
import { ExecutorContextImpl } from './ExecutorContextImpl';
import { BasePluginExecutor } from './BasePluginExecutor';
import { EXECUTOR_ASYNC_ERROR } from '../utils/constants';
import { runPluginsHookAsync, runPluginsHooksAsync } from '../utils/pluginHook';

/**
 * Asynchronous lifecycle executor implementation
 *
 * Core Concept:
 * A fully asynchronous executor that provides complete lifecycle management through
 * plugin hooks. All operations are async, eliminating the complexity of runtime
 * sync/async detection and ensuring consistent behavior.
 *
 * Key Design Decisions:
 *
 * Fully Async Architecture:
 * - All methods are async: No sync/async branching logic needed
 * - Consistent behavior: Same execution path for all tasks
 * - Simpler code: Reduced complexity compared to mixed sync/async approach
 * - Type safety: Return type is always Promise<R>, no type mismatches
 *
 * Why Fully Async?
 * - `await` works seamlessly with both sync and async values
 * - No performance penalty in modern JavaScript engines
 * - Avoids runtime type detection complexity (no isPromise checks)
 * - Prevents type system vs runtime behavior mismatches
 * - Plugins can freely mix sync and async operations
 *
 * Simplified Architecture:
 * - No Helper Classes: All logic directly in the main class
 *   - Benefits: Easier to understand, less indirection, simpler debugging
 *   - Direct method calls instead of delegating to helper classes
 *
 * Main Features:
 * - Fully async execution: All operations use async/await
 * - Plugin compatibility: Works with both sync and async plugins
 * - Unified API: Single executor class for all use cases
 * - Simpler codebase: Reduced maintenance overhead
 * - Type safe: No runtime type mismatches
 *
 * Execution Flow:
 * 1. Create context with parameters
 * 2. Execute beforeHooks (can return new parameters)
 * 3. Update parameters if beforeHooks returned a value
 * 4. Execute execHook (can modify or wrap task)
 * 5. Execute main task
 * 6. Execute afterHooks (can transform result)
 * 7. On error, execute onError hooks
 * 8. Execute onFinally hooks for cleanup
 * 9. Return result as Promise
 *
 * @template Ctx - Type of executor context interface (defaults to ExecutorContextImpl<unknown>)
 * @template Plugin - Type of plugin interface (defaults to LifecyclePluginInterface<Ctx>)
 *
 * @example Basic async usage
 * ```typescript
 * const executor = new LifecycleExecutor();
 * executor.use(new LogPlugin());
 *
 * const result = await executor.exec(async (ctx) => {
 *   const response = await fetch('https://api.example.com/data');
 *   return response.json();
 * });
 * ```
 *
 * @example Sync task (still returns Promise)
 * ```typescript
 * const executor = new LifecycleExecutor();
 * executor.use(new ValidationPlugin());
 *
 * // Note: Must await even for sync tasks
 * const result = await executor.exec((ctx) => {
 *   return ctx.parameters.toUpperCase();
 * });
 * ```
 *
 * @since 2.6.0
 * @see LifecycleSyncExecutor - Synchronous version of this executor
 * @see LifecyclePluginInterface - Default plugin interface
 */
export class LifecycleExecutor<
  Ctx extends ExecutorContextInterface<unknown> = ExecutorContextImpl<unknown>,
  Plugin extends LifecyclePluginInterface<Ctx> = LifecyclePluginInterface<Ctx>
> extends BasePluginExecutor<Ctx, Plugin> {
  /**
   * Execute task without throwing errors
   *
   * Core concept:
   * Error-safe execution pipeline that returns errors as values instead of throwing them.
   * This allows for functional error handling without try-catch blocks.
   *
   * @override
   * @template R - Type of task return value
   * @template P - Type of task input parameters
   * @param task - Task function to execute
   * @returns Promise resolving to result or ExecutorError
   *
   * @example
   * ```typescript
   * const result = await executor.execNoError(async (ctx) => {
   *   return await fetchData();
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.error('Task failed:', result);
   * } else {
   *   console.log('Task succeeded:', result);
   * }
   * ```
   */
  public execNoError<R, P>(
    task: ExecutorAsyncTask<R, P>
  ): Promise<R | ExecutorError>;
  /** @override */
  public execNoError<R, P>(
    data: P,
    task: ExecutorAsyncTask<R, P>
  ): Promise<R | ExecutorError>;
  /** @override */
  public execNoError<R, P>(
    task: ExecutorSyncTask<R, P>
  ): Promise<R | ExecutorError>;
  /** @override */
  public execNoError<R, P>(
    data: P,
    task: ExecutorSyncTask<R, P>
  ): Promise<R | ExecutorError>;
  /** @override */
  public async execNoError<R, P>(
    dataOrTask: P | ExecutorTask<R, P>,
    task?: ExecutorTask<R, P>
  ): Promise<R | ExecutorError> {
    try {
      return task !== undefined
        ? (
            this.exec as <R, P>(
              data: P,
              task: ExecutorTask<R, P>
            ) => R | Promise<R>
          )(dataOrTask as P, task)
        : (this.exec as <R, P>(task: ExecutorTask<R, P>) => R | Promise<R>)(
            dataOrTask as ExecutorTask<R, P>
          );
    } catch (error) {
      if (error instanceof ExecutorError) {
        return error;
      }

      return new ExecutorError(EXECUTOR_ASYNC_ERROR, error);
    }
  }

  /**
   * Execute task with full plugin pipeline
   *
   * Core concept:
   * Complete async execution pipeline with plugin lifecycle management.
   * Works with both sync and async tasks through await.
   *
   * @override
   * @template R - Type of task return value
   * @template P - Type of task input parameters
   * @param task - Task function to execute (can be sync or async)
   * @returns Promise resolving to task execution result
   *
   * @example Async task
   * ```typescript
   * const result = await executor.exec(async (ctx) => {
   *   const response = await fetch('https://api.example.com/data');
   *   return response.json();
   * });
   * ```
   *
   * @example Sync task (still returns Promise)
   * ```typescript
   * const result = await executor.exec((ctx) => {
   *   return ctx.parameters.toUpperCase();
   * });
   * ```
   */
  public exec<R, P>(task: ExecutorAsyncTask<R, P>): Promise<R>;
  /** @override */
  public exec<R, P>(data: P, task: ExecutorAsyncTask<R, P>): Promise<R>;
  /** @override */
  public exec<R, P>(task: ExecutorSyncTask<R, P>): Promise<R>;
  /** @override */
  public exec<R, P>(data: P, task: ExecutorSyncTask<R, P>): Promise<R>;
  /** @override */
  public exec<R, P>(
    dataOrTask: P | ExecutorTask<R, P>,
    task?: ExecutorTask<R, P>
  ): Promise<R> {
    const actualTask = (task || dataOrTask) as ExecutorTask<R, P>;
    const data = (task ? dataOrTask : undefined) as P | undefined;

    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a function!');
    }

    const context = this.createContext<P>(data ?? ({} as P));
    return this.run(context, actualTask);
  }

  /**
   * Execute a single plugin hook asynchronously for all plugins
   *
   * Core concept:
   * Delegates to utility function for sequential async plugin execution with chain breaking
   * and return value handling. This method serves as a convenient wrapper that maintains
   * the executor's API while leveraging shared hook execution logic.
   *
   * Execution flow (delegated to runPluginsHookAsync):
   * 1. Reset hook runtimes in context
   * 2. Iterate through all plugins sequentially
   * 3. Check if each plugin is enabled for the hook
   * 4. Execute plugin hook with await
   * 5. Handle plugin results and chain breaking conditions
   * 6. Continue to next plugin or break chain if requested
   *
   * Key features:
   * - Plugin enablement checking via context.shouldSkipPluginHook
   * - Chain breaking support via context.shouldBreakChain
   * - Return value management and tracking
   * - Fully async execution with await
   * - Type-safe generic parameters for Result and Params
   *
   * Type parameters:
   * - Result: The expected return type from the hook (can differ from Params)
   * - Params: The parameter type in the execution context
   *
   * Why delegate to utility?
   * - Code reuse: Same logic shared across different executor types
   * - Reduced file size: Moves implementation details to utility module
   * - Easier testing: Utility functions can be tested independently
   * - Better maintainability: Single source of truth for hook execution logic
   *
   * @template Result - Type of hook return value
   * @template Params - Type of context parameters
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function to execute
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook function
   * @returns Promise resolving to the result of the hook function execution, or undefined
   *
   * @example
   * ```typescript
   * // Execute onBefore hook, expecting to return modified parameters
   * const newParams = await this.runHook<UserParams, UserParams>(
   *   this.plugins,
   *   'onBefore',
   *   context
   * );
   * ```
   *
   * @see runPluginsHookAsync - The utility function that performs the actual execution
   */
  protected async runHook<Result, Params>(
    plugins: Plugin[],
    hookName: ExecutorPluginNameType,
    context: ExecutorContextImpl<Params>,
    ...args: unknown[]
  ): Promise<Result | undefined> {
    return runPluginsHookAsync(plugins, hookName, context, ...args);
  }

  /**
   * Execute multiple plugin hooks in sequence asynchronously
   *
   * Core concept:
   * Delegates to utility function for sequential execution of multiple hooks with
   * chain breaking support. This enables executing a series of lifecycle hooks
   * (e.g., validation then transformation) in a single call.
   *
   * Execution flow (delegated to runPluginsHooksAsync):
   * 1. Convert hookNames to array if single value provided
   * 2. Iterate through hook names in order
   * 3. Execute each hook using runPluginsHookAsync
   * 4. Track and accumulate return values
   * 5. Check for chain breaking after each hook
   * 6. Return the last non-undefined result
   *
   * Key features:
   * - Sequential hook execution: Hooks run in specified order
   * - Chain breaking: Can stop execution early if plugin sets break flag
   * - Return value tracking: Returns last hook's result
   * - Flexible input: Accepts single hook name or array
   * - Type-safe generics: Separate Result and Params types
   *
   * Use cases:
   * - Execute multiple lifecycle stages: ['onValidate', 'onTransform']
   * - Run custom hook sequences: ['onInit', 'onSetup', 'onReady']
   * - Conditional execution: Hooks can break chain to skip remaining hooks
   *
   * Type parameters:
   * - Result: The expected return type from the hooks
   * - Params: The parameter type in the execution context
   *
   * @template Result - Type of hook return value
   * @template Params - Type of context parameters
   * @param plugins - Array of plugins to execute
   * @param hookNames - Single hook name or array of hook names to execute in sequence
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook functions
   * @returns Promise resolving to the result of the last executed hook function, or undefined
   *
   * @example Execute multiple hooks
   * ```typescript
   * // Execute both validation and transformation hooks
   * const result = await this.runHooks<Data, Data>(
   *   this.plugins,
   *   ['onValidate', 'onTransform'],
   *   context
   * );
   * ```
   *
   * @example Execute single hook (convenience)
   * ```typescript
   * // Same as runHook, but accepts array syntax
   * const result = await this.runHooks<Data, Data>(
   *   this.plugins,
   *   'onBefore',
   *   context
   * );
   * ```
   *
   * @see runPluginsHooksAsync - The utility function that performs the actual execution
   * @see runHook - For executing a single hook
   */
  protected async runHooks<Result, Params>(
    plugins: Plugin[],
    hookNames: ExecutorPluginNameType | ExecutorPluginNameType[],
    context: ExecutorContextImpl<Params>,
    ...args: unknown[]
  ): Promise<Result | undefined> {
    return runPluginsHooksAsync(plugins, hookNames, context, ...args);
  }

  /**
   * Execute core task logic with execHook support asynchronously
   *
   * Core concept:
   * Handles the task execution phase with optional plugin intervention through execHook.
   * Plugins can intercept, wrap, or completely replace the task execution.
   *
   * Execution logic:
   * 1. Execute configured execHook (default: 'onExec') for all plugins
   * 2. Determine which task to execute:
   *    - If plugin returned a function: Use it as the new task
   *    - If plugin returned a value: Use the value directly (skip task execution)
   *    - If no plugin handled: Use the original task
   * 3. Execute the determined task (if needed)
   * 4. Store result in context and return it
   *
   * Plugin intervention modes:
   * - Return a new function: `return (ctx) => retryLogic(task, ctx);` - replaces task, executes at end
   * - Return a value directly: `return cachedValue;` - skips task execution entirely
   * - Call and return: `const result = await task(ctx); return result;` - executes task immediately in plugin
   * - Return nothing: Original task runs normally
   *
   * Hook runtime tracking:
   * - context.hooksRuntimes.times: Number of plugins that executed the hook
   * - context.hooksRuntimes.returnValue: Last return value from plugins
   * - If times === 0, no plugin handled execution, so run actual task
   *
   * Use cases:
   * - Caching: Plugin returns cached result without running task
   * - Retry logic: Plugin returns new function with retry mechanism
   * - Mocking: Plugin returns mock data in test environment
   * - Instrumentation: Plugin wraps task to measure performance
   * - Abort/Cancel: Plugin returns function that checks abort signal
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context containing parameters and runtime state
   * @param actualTask - Task function to execute (if no plugin handles it)
   * @returns Promise resolving to task result (from plugin or actual task)
   *
   * @example Plugin returning cached value (skips task execution)
   * ```typescript
   * onExec: async (ctx, task) => {
   *   const cached = cache.get(ctx.parameters.key);
   *   if (cached) return cached; // Return value directly, task never runs
   *
   *   const result = await task(ctx); // Or execute task in plugin
   *   cache.set(ctx.parameters.key, result);
   *   return result;
   * }
   * ```
   *
   * @example Plugin returning new function (replaces task, executes at end)
   * ```typescript
   * onExec: async (ctx, task) => {
   *   // Return a new function that wraps the original task
   *   // This function will be executed at the end of runExec
   *   return async (ctx) => {
   *     for (let i = 0; i < 3; i++) {
   *       try {
   *         return await task(ctx);
   *       } catch (error) {
   *         if (i === 2) throw error;
   *         await sleep(1000);
   *       }
   *     }
   *   };
   * }
   * ```
   */
  protected async runExec<Result, Params>(
    context: ExecutorContextImpl<Params>,
    actualTask: ExecutorTask<Result, Params>
  ): Promise<Result> {
    const execHook = this.getExecHook();

    // Execute onExec hooks for all plugins
    await this.runHook(this.plugins, execHook, context, actualTask);

    let result: Result;

    if (!context.hooksRuntimes.times) {
      // No plugin handled execution, run actual task
      result = await actualTask(context);
    } else {
      const hookReturnValue = context.hooksRuntimes.returnValue;

      // Check if plugin returned a function (new task to execute)
      if (typeof hookReturnValue === 'function') {
        // Plugin returned a new task function, execute it now
        result = await hookReturnValue(context);
      } else {
        // Plugin returned a direct value, use it as result (skip task execution)
        result = hookReturnValue as Result;
      }
    }

    context.setReturnValue(result);
    return result as Result;
  }

  /**
   * Core task execution method with plugin hooks
   *
   * Core concept:
   * Complete async execution pipeline with configurable hook lifecycle.
   *
   * Pipeline stages:
   * 1. beforeHooks - Pre-process input data (configurable, default: 'onBefore')
   * 2. Task execution - Run the actual task with execHook support
   * 3. afterHooks - Post-process results (configurable, default: 'onSuccess')
   * 4. onError hooks - Handle any errors (if thrown)
   * 5. onFinally hooks - Cleanup operations (always executed)
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context
   * @param actualTask - Actual task function to execute
   * @throws {ExecutorError} When task execution fails
   * @returns Promise resolving to task execution result
   */
  protected async run<Result, Params>(
    context: ExecutorContextImpl<Params>,
    actualTask: ExecutorTask<Result, Params>
  ): Promise<Result> {
    try {
      await this.handler(context, actualTask);

      return context.returnValue as Result;
    } catch (error) {
      throw await this.handlerCatch(context, error);
    } finally {
      await this.handlerFinally(context);
    }
  }

  /**
   * Main execution handler for the success path
   *
   * Core concept:
   * Orchestrates the complete plugin lifecycle for successful task execution.
   * This is the main pipeline that runs when no errors occur.
   *
   * Execution pipeline:
   * 1. beforeHooks: Pre-process and validate input parameters
   *    - Plugins can modify parameters via return value
   *    - Common use: validation, normalization, enrichment
   *    - If hook returns value, parameters are updated
   *
   * 2. Task execution: Run the actual task with execHook support
   *    - Plugins can intercept via execHook
   *    - Task receives updated parameters from beforeHooks
   *    - Result is stored in context
   *
   * 3. afterHooks: Post-process results
   *    - Plugins can transform results, log, notify, etc.
   *    - Common use: formatting, caching, analytics
   *    - Final result comes from context.returnValue
   *
   * Parameter flow:
   * - Initial parameters → beforeHooks → updated parameters → task → result
   * - beforeHooks can return new parameters to replace context.parameters
   * - Task receives the updated parameters
   * - afterHooks work with the result in context.returnValue
   *
   * Hook configuration:
   * - beforeHooks: Configured via getBeforeHooks() (default: 'onBefore')
   * - afterHooks: Configured via getAfterHooks() (default: 'onSuccess')
   * - Can be customized in executor configuration
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context containing parameters and state
   * @param actualTask - Task function to execute
   * @returns Promise resolving to task execution result
   *
   * @example Typical flow
   * ```typescript
   * // 1. beforeHooks modify parameters
   * onBefore: (ctx) => ({ ...ctx.parameters, timestamp: Date.now() })
   *
   * // 2. Task runs with updated parameters
   * const task = (ctx) => fetch(`/api/${ctx.parameters.id}?t=${ctx.parameters.timestamp}`)
   *
   * // 3. afterHooks process result
   * onSuccess: (ctx) => console.log('Fetched:', ctx.returnValue)
   * ```
   */
  protected async handler<Result, Params>(
    context: ExecutorContextImpl<Params>,
    actualTask: ExecutorTask<Result, Params>
  ): Promise<Result> {
    const beforeResult = await this.runHooks<Params, Params>(
      this.plugins,
      this.getBeforeHooks(),
      context
    );

    if (beforeResult !== undefined) {
      context.setParameters(beforeResult);
    }

    await this.runExec(context, actualTask);

    await this.runHooks(this.plugins, this.getAfterHooks(), context);

    return context.returnValue as Result;
  }

  /**
   * Error handler for the catch path
   *
   * Core concept:
   * Handles errors that occur during task execution by running onError hooks
   * and normalizing the error to ExecutorError format.
   *
   * Execution flow:
   * 1. Set error in context
   * 2. Execute onError hooks for all plugins
   * 3. Check if any plugin returned a custom ExecutorError
   * 4. If plugin provided error, use it; otherwise use context.error
   * 5. Normalize to ExecutorError if not already
   * 6. Return the ExecutorError to be thrown
   *
   * Plugin error handling:
   * - Plugins can inspect context.error to see what went wrong
   * - Plugins can return ExecutorError to customize error details
   * - Plugins can log, report, or transform errors
   * - Last plugin's return value takes precedence
   *
   * Error transformation:
   * - If context.error is already ExecutorError, return as-is
   * - Otherwise, wrap in ExecutorError with EXECUTOR_ASYNC_ERROR code
   * - Preserves original error as cause for debugging
   *
   * Use cases:
   * - Error logging: Plugin logs error to monitoring service
   * - Error transformation: Plugin converts technical error to user-friendly message
   * - Error enrichment: Plugin adds context information to error
   *
   * @param context - Execution context containing error information
   * @param error - Original error
   * @returns Promise resolving to ExecutorError to be thrown
   *
   * @example Plugin handling errors
   * ```typescript
   * onError: (ctx) => {
   *   if (ctx.error instanceof NetworkError) {
   *     // Transform to user-friendly error
   *     return new ExecutorError('NETWORK_ERROR', ctx.error, {
   *       message: 'Network connection failed. Please check your internet.'
   *     });
   *   }
   *   // Log and return undefined to use default error
   *   logger.error('Task failed:', ctx.error);
   * }
   * ```
   */
  protected async handlerCatch(
    context: ExecutorContextImpl<unknown>,
    error: unknown
  ): Promise<ExecutorError> {
    context.setError(error);

    await this.runHook(this.plugins, this.getErrorHook(), context);

    if (context.hooksRuntimes.returnValue) {
      context.setError(context.hooksRuntimes.returnValue);
    }

    if (context.error instanceof ExecutorError) {
      return context.error;
    }

    const executorError = new ExecutorError(EXECUTOR_ASYNC_ERROR, context.error);
    context.setError(executorError);
    return executorError;
  }

  /**
   * Finally handler for cleanup
   *
   * Core concept:
   * Cleanup method that always runs after task execution, regardless of success or failure.
   * Ensures context is properly reset for potential reuse and executes onFinally hooks.
   *
   * Execution:
   * - Called in finally block of run() method
   * - Runs after both success (handler) and error (handlerCatch) paths
   * - Guaranteed to execute even if error is thrown
   *
   * Cleanup operations:
   * - Executes onFinally hooks for all plugins (before reset so hooks can access context state)
   * - Resets context state via context.reset()
   * - Clears hook runtimes tracking
   * - Prepares context for next execution
   * - Prevents state leakage between executions
   *
   * Why execute hooks before reset:
   * - Plugins may need access to error or returnValue for cleanup
   * - Context state is still available during hook execution
   * - Reset happens after hooks complete to ensure clean state
   *
   * Why cleanup is important:
   * - Context instances may be reused
   * - Hook runtime state should not persist
   * - Prevents memory leaks
   * - Ensures clean state for next task
   * - Allows plugins to perform final cleanup operations
   *
   * @param context - Execution context to reset
   *
   * @example Context reset includes:
   * ```typescript
   * // Inside context.reset():
   * - Clear hook runtimes (times, returnValue, breakChain, etc.)
   * - Reset plugin tracking
   * - Clear temporary state
   * ```
   *
   * @example Plugin cleanup:
   * ```typescript
   * onFinally: async (ctx) => {
   *   // Cleanup resources
   *   if (ctx.parameters.connection) {
   *     await ctx.parameters.connection.close();
   *   }
   *   // Can access error or returnValue before reset
   *   if (ctx.error) {
   *     logger.error('Task failed:', ctx.error);
   *   }
   * }
   * ```
   */
  protected async handlerFinally(context: ExecutorContextImpl<unknown>): Promise<void> {
    // Enable continue on error for finally hooks to ensure all hooks execute
    // even if one throws an error
    context.runtimes({ continueOnError: true });
    
    await this.runHooks(this.plugins, this.getFinallyHook(), context);

    context.reset();
  }
}
