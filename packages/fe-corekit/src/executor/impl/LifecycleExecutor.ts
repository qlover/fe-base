import { ExecutorError } from '../interface';
import {
  ExecutorAsyncTask,
  ExecutorContextInterface,
  ExecutorPluginNameType,
  ExecutorTask,
  ExecutorSyncTask
} from '../interface/ExecutorInterface';
import { LifecyclePluginInterface } from '../interface/LifecyclePluginInterface';
import { ExecutorContextImpl } from './ExecutorContextImpl';
import { BasePluginExecutor, PluginExecutorConfig } from './BasePluginExecutor';
import { EXECUTOR_ASYNC_ERROR } from '../utils/constants';
import { runPluginHook } from '../utils/pluginUtil';

export interface LifecycleExecutorConfig extends PluginExecutorConfig {}

/**
 * Simplified async lifecycle executor implementation
 *
 * Core Concept:
 * A simpler, fully asynchronous implementation of LifecycleExecutor that follows
 * the AsyncExecutor pattern. All operations are async, eliminating the complexity
 * of runtime sync/async detection and ensuring consistent behavior.
 *
 * Key Design Decisions:
 *
 * Fully Async Architecture:
 * - All methods are async: No sync/async branching logic needed
 * - Consistent behavior: Same execution path for all tasks
 * - Simpler code: ~50% less code than mixed sync/async approach
 * - Type safety: Return type is always Promise<R>, no type mismatches
 *
 * Why Fully Async?
 * - `await` works on both sync and async values seamlessly
 * - No performance penalty in modern JavaScript engines
 * - Avoids runtime type detection complexity (no isPromise checks)
 * - Prevents type system vs runtime behavior mismatches
 * - Plugins can freely mix sync and async operations
 *
 * Simplified Architecture:
 * - No Helper Classes: All logic directly in the main class
 *   - Original LifecycleExecutor: Uses HookExecutor, TaskExecutor, ErrorProcessor
 *   - LifecycleExecutor2: All methods in one class
 *   - Benefits: Easier to understand, less indirection, simpler debugging
 *
 * Main Features:
 * - Fully async execution: All operations use async/await
 * - Plugin compatibility: Works with both sync and async plugins
 * - Unified API: Single executor class for all use cases
 * - Simpler codebase: Much less code to maintain
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
 * 8. Return result as Promise
 *
 * @template Ctx - Type of executor context interface (defaults to ExecutorContextInterface<unknown>)
 * @template Plugin - Type of plugin interface (defaults to LifecyclePluginInterface<Ctx>)
 *
 * @example Basic async usage
 * ```typescript
 * const executor = new LifecycleExecutor2();
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
 * const executor = new LifecycleExecutor2();
 * executor.use(new ValidationPlugin());
 *
 * // Note: Must await even for sync tasks
 * const result = await executor.exec((ctx) => {
 *   return ctx.parameters.toUpperCase();
 * });
 * ```
 *
 * @since 2.6.0
 * @see AsyncExecutor - Inspiration for this implementation
 * @see LifecycleExecutor - Original modular implementation
 * @see LifecyclePluginInterface - Default plugin interface
 *
 * @category LifecycleExecutor
 */
export class LifecycleExecutor<
  Ctx extends ExecutorContextInterface<unknown> = ExecutorContextImpl<unknown>,
  Plugin extends LifecyclePluginInterface<Ctx> = LifecyclePluginInterface<Ctx>
> extends BasePluginExecutor<Ctx, Plugin> {
  /**
   * Execute a single plugin hook asynchronously
   *
   * Core concept:
   * Sequential async plugin execution with chain breaking and return value handling
   *
   * Execution flow:
   * 1. Check if plugin is enabled for the hook
   * 2. Execute plugin hook with await
   * 3. Handle plugin results and chain breaking conditions
   * 4. Continue to next plugin or break chain
   *
   * Key features:
   * - Plugin enablement checking
   * - Chain breaking support
   * - Return value management
   * - Fully async execution with await
   *
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function to execute
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook function
   * @returns Promise resolving to the result of the hook function execution
   */
  protected async runHook<Params>(
    plugins: Plugin[],
    hookName: ExecutorPluginNameType,
    context: ExecutorContextImpl<Params>,
    ...args: unknown[]
  ): Promise<Params | undefined> {
    let returnValue: Params | undefined;

    // Reset hook runtimes
    context.resetHooksRuntimes();

    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];

      // Skip plugin if hook should be skipped
      if (context.shouldSkipPluginHook(plugin, hookName)) {
        continue;
      }

      // Break chain if breakChain flag is set
      if (context.shouldBreakChain()) {
        break;
      }

      // Update runtime info
      context.runtimes(plugin, hookName, i);

      const result = await runPluginHook(plugin, hookName, context, ...args);

      if (result !== undefined) {
        returnValue = result as Params;
        context.runtimeReturnValue(result);

        // Break chain if returnBreakChain flag is set
        if (context.shouldBreakChainOnReturn()) {
          break;
        }
      }
    }

    return returnValue;
  }

  /**
   * Execute multiple plugin hooks in sequence asynchronously
   *
   * Core concept:
   * Sequential execution of multiple hooks with chain breaking support
   *
   * @param plugins - Array of plugins to execute
   * @param hookNames - Single hook name or array of hook names to execute in sequence
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook functions
   * @returns Promise resolving to the result of the last executed hook function
   */
  protected async runHooks<Params>(
    plugins: Plugin[],
    hookNames: ExecutorPluginNameType | ExecutorPluginNameType[],
    context: ExecutorContextImpl<Params>,
    ...args: unknown[]
  ): Promise<Params | undefined> {
    const hookNameArray = Array.isArray(hookNames) ? hookNames : [hookNames];
    let lastReturnValue: Params | undefined;

    for (const hookName of hookNameArray) {
      const result = await this.runHook(plugins, hookName, context, ...args);

      if (result !== undefined) {
        lastReturnValue = result;
      }

      // Check if we should break the chain
      if (context.shouldBreakChain()) {
        break;
      }
    }

    return lastReturnValue;
  }

  /**
   * Execute task without throwing errors
   * Always returns a Promise (async execution)
   *
   * Core concept:
   * Error-safe execution pipeline that returns errors instead of throwing
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
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return new ExecutorError(EXECUTOR_ASYNC_ERROR, errorObj);
    }
  }

  /**
   * Execute task with full plugin pipeline
   * Always returns a Promise (async execution)
   *
   * Core concept:
   * Complete async execution pipeline with plugin lifecycle management
   * Works with both sync and async tasks through await
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
   * Execute core task logic with execHook support asynchronously
   *
   * Core concept:
   * Handles the execution phase with optional plugin intervention
   *
   * Execution logic:
   * 1. Execute configured execHook (default: 'onExec')
   * 2. If no execHook was executed, run the actual task
   * 3. Otherwise, use the return value from execHook
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context
   * @param actualTask - Task function to execute
   */
  protected async runExec<Result, Params>(
    context: ExecutorContextImpl<Params>,
    actualTask: ExecutorTask<Result, Params>
  ): Promise<Result> {
    const execHook = this.getExecHook();

    await this.runHook(this.plugins, execHook, context, actualTask);

    // If exec times is 0, then execute task
    const result = !context.hooksRuntimes.times
      ? await actualTask(context as unknown as ExecutorContextInterface<Params>)
      : context.hooksRuntimes.returnValue;

    context.setReturnValue(result);
    return result as Result;
  }

  /**
   * Core task execution method with plugin hooks
   *
   * Core concept:
   * Complete async execution pipeline with configurable hook lifecycle
   *
   * Pipeline stages:
   * 1. beforeHooks - Pre-process input data (configurable, default: 'onBefore')
   * 2. Task execution - Run the actual task with execHook support
   * 3. afterHooks - Post-process results (configurable, default: 'onSuccess')
   * 4. onError hooks - Handle any errors
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
    const beforeHooks = this.getBeforeHooks();
    const afterHooks = this.getAfterHooks();

    try {
      // Execute beforeHooks
      const beforeValue = await this.runHooks(
        this.plugins,
        beforeHooks,
        context
      );

      // Update parameters if beforeHooks returned a value
      if (beforeValue !== undefined) {
        context.setParameters(beforeValue);
      }

      // Execute core logic
      await this.runExec(context, actualTask);

      // Execute afterHooks
      await this.runHooks(this.plugins, afterHooks, context);

      return context.returnValue as Result;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      context.setError(
        errorObj instanceof ExecutorError
          ? errorObj
          : new ExecutorError(EXECUTOR_ASYNC_ERROR, errorObj)
      );

      // Handle errors with onError hooks
      await this.runHook(this.plugins, 'onError', context);

      // If onError hook returns an ExecutorError, use it
      if (context.hooksRuntimes.returnValue) {
        const returnedError = context.hooksRuntimes.returnValue as Error;
        context.setError(
          returnedError instanceof ExecutorError
            ? returnedError
            : new ExecutorError(EXECUTOR_ASYNC_ERROR, returnedError)
        );
      }

      const finalError =
        context.error ||
        new ExecutorError(EXECUTOR_ASYNC_ERROR, new Error('Unknown error'));
      throw finalError;
    } finally {
      context.reset();
    }
  }
}
