import { ExecutorError } from '../interface';
import {
  ExecutorContextInterface,
  ExecutorPluginNameType,
  ExecutorSyncTask
} from '../interface/ExecutorInterface';
import { LifecycleSyncPluginInterface } from '../interface/SyncLifecyclePluginInterface';
import { ExecutorContextImpl } from './ExecutorContextImpl';
import { BasePluginExecutor } from './BasePluginExecutor';
import { EXECUTOR_SYNC_ERROR } from '../utils/constants';
import { runPluginHook } from '../utils/pluginUtil';

/**
 * Simplified synchronous lifecycle executor implementation
 *
 * Core Concept:
 * A simpler, fully synchronous implementation of LifecycleExecutor that provides
 * immediate execution without Promise overhead. All operations are synchronous,
 * ensuring predictable execution order and no async context switching.
 *
 * Key Design Decisions:
 *
 * Fully Sync Architecture:
 * - All methods are synchronous: No Promise overhead
 * - Consistent behavior: Same execution path for all tasks
 * - Simpler code: No async/await complexity
 * - Type safety: Return type is always R, no Promise wrapping
 *
 * Why Fully Sync?
 * - Immediate execution: No event loop delays
 * - Predictable timing: Synchronous execution order guaranteed
 * - Performance: No Promise allocation overhead
 * - Debugging: Simpler stack traces
 * - Use cases: Hot paths, constructors, getters, legacy APIs
 *
 * Limitations:
 * - Cannot use async plugins: All plugins must be synchronous
 * - Cannot use async tasks: Task function must return non-Promise values
 * - No I/O operations: Cannot perform async I/O (fetch, file operations, etc.)
 *
 * Simplified Architecture:
 * - No Helper Classes: All logic directly in the main class
 *   - Similar to LifecycleExecutor2 but fully synchronous
 *   - Benefits: Easier to understand, less indirection, simpler debugging
 *
 * Main Features:
 * - Fully sync execution: All operations are immediate
 * - Plugin compatibility: Works with synchronous plugins only
 * - Unified API: Single executor class for sync use cases
 * - Simpler codebase: Much less code than mixed sync/async approach
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
 * 8. Return result immediately
 *
 * @template Ctx - Type of executor context interface (defaults to ExecutorContextInterface<unknown>)
 * @template Plugin - Type of plugin interface (defaults to LifecyclePluginInterface<Ctx>)
 *
 * @example Basic sync usage
 * ```typescript
 * const executor = new LifecycleSyncExecutor();
 * executor.use(new ValidationPlugin());
 *
 * // No await needed - immediate execution
 * const result = executor.exec((ctx) => {
 *   return ctx.parameters.toUpperCase();
 * });
 * ```
 *
 * @example With data transformation
 * ```typescript
 * const executor = new LifecycleSyncExecutor();
 * executor.use({
 *   onBefore: (ctx) => {
 *     // Transform parameters synchronously
 *     return { ...ctx.parameters, timestamp: Date.now() };
 *   }
 * });
 *
 * const result = executor.exec({ text: 'hello' }, (ctx) => {
 *   return ctx.parameters.text.toUpperCase();
 * });
 * ```
 *
 * @example Performance-critical hot path
 * ```typescript
 * class GameEngine {
 *   private executor = new LifecycleSyncExecutor();
 *
 *   onFrame() {
 *     // Must complete within 16.6ms for 60fps
 *     const deltaTime = this.executor.exec(() => {
 *       return performance.now() - this.lastFrameTime;
 *     });
 *     this.update(deltaTime);
 *   }
 * }
 * ```
 *
 * @since 2.6.0
 * @see LifecycleExecutor2 - Async version of this executor
 * @see SyncExecutor - Original sync executor implementation
 * @see LifecyclePluginInterface - Default plugin interface
 *
 * @category LifecycleSyncExecutor
 */
export class LifecycleSyncExecutor<
  Ctx extends
    ExecutorContextInterface<unknown> = ExecutorContextInterface<unknown>,
  Plugin extends
    LifecycleSyncPluginInterface<Ctx> = LifecycleSyncPluginInterface<Ctx>
> extends BasePluginExecutor<Ctx, Plugin> {
  /**
   * Execute a single plugin hook synchronously
   *
   * Core concept:
   * Sequential sync plugin execution with chain breaking and return value handling
   *
   * Execution flow:
   * 1. Check if plugin is enabled for the hook
   * 2. Execute plugin hook immediately
   * 3. Handle plugin results and chain breaking conditions
   * 4. Continue to next plugin or break chain
   *
   * Key features:
   * - Plugin enablement checking
   * - Chain breaking support
   * - Return value management
   * - Fully sync execution (no await)
   *
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function to execute
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook function
   * @returns Result of the hook function execution
   */
  protected runHook<Params>(
    plugins: Plugin[],
    hookName: ExecutorPluginNameType,
    context: ExecutorContextImpl<Params>,
    ...args: unknown[]
  ): Params | undefined {
    let returnValue: Params | undefined;

    // Reset hook runtimes
    context.hooksRuntimes.times = 0;
    context.hooksRuntimes.returnValue = undefined;

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

      const result = runPluginHook(plugin, hookName, context, ...args);

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
   * Execute multiple plugin hooks in sequence synchronously
   *
   * Core concept:
   * Sequential execution of multiple hooks with chain breaking support
   *
   * @param plugins - Array of plugins to execute
   * @param hookNames - Single hook name or array of hook names to execute in sequence
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook functions
   * @returns Result of the last executed hook function
   */
  protected runHooks<Params>(
    plugins: Plugin[],
    hookNames: ExecutorPluginNameType | ExecutorPluginNameType[],
    context: ExecutorContextImpl<Params>,
    ...args: unknown[]
  ): Params | undefined {
    const hookNameArray = Array.isArray(hookNames) ? hookNames : [hookNames];
    let lastReturnValue: Params | undefined;

    for (const hookName of hookNameArray) {
      const result = this.runHook(plugins, hookName, context, ...args);

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
   * Execute core task logic with execHook support synchronously
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
  protected runExec<Result, Params>(
    context: ExecutorContextImpl<Params>,
    actualTask: ExecutorSyncTask<Result, Params>
  ): Result {
    const execHook = this.getExecHook();

    this.runHook(this.plugins, execHook, context, actualTask);

    // If exec times is 0, then execute task
    const result = !context.hooksRuntimes.times
      ? actualTask(context as unknown as ExecutorContextInterface<Params>)
      : context.hooksRuntimes.returnValue;

    context.setReturnValue(result);
    return result as Result;
  }

  /**
   * Core task execution method with plugin hooks
   *
   * Core concept:
   * Complete sync execution pipeline with configurable hook lifecycle
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
   * @returns Task execution result
   */
  protected run<Result, Params>(
    context: ExecutorContextImpl<Params>,
    actualTask: ExecutorSyncTask<Result, Params>
  ): Result {
    const beforeHooks = this.getBeforeHooks();
    const afterHooks = this.getAfterHooks();

    try {
      // Execute beforeHooks
      const beforeValue = this.runHooks(this.plugins, beforeHooks, context);

      // Update parameters if beforeHooks returned a value
      if (beforeValue !== undefined) {
        context.setParameters(beforeValue);
      }

      // Execute core logic
      const result = this.runExec(context, actualTask);

      // Execute afterHooks
      this.runHooks(this.plugins, afterHooks, context);

      return result as Result;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      context.setError(
        errorObj instanceof ExecutorError
          ? errorObj
          : new ExecutorError(EXECUTOR_SYNC_ERROR, errorObj)
      );

      // Handle errors with onError hooks
      this.runHook(this.plugins, 'onError', context);

      // If onError hook returns an ExecutorError, use it
      if (context.hooksRuntimes.returnValue) {
        const returnedError = context.hooksRuntimes.returnValue as Error;
        context.setError(
          returnedError instanceof ExecutorError
            ? returnedError
            : new ExecutorError(EXECUTOR_SYNC_ERROR, returnedError)
        );
      }

      const finalError =
        context.error ||
        new ExecutorError(EXECUTOR_SYNC_ERROR, new Error('Unknown error'));
      throw finalError;
    } finally {
      context.reset();
    }
  }

  /**
   * Execute task without throwing errors
   * Always returns synchronously
   *
   * Core concept:
   * Error-safe execution pipeline that returns errors instead of throwing
   *
   * @override
   * @template R - Type of task return value
   * @template P - Type of task input parameters
   * @param task - Task function to execute
   * @returns Result or ExecutorError
   *
   * @example
   * ```typescript
   * const result = executor.execNoError((ctx) => {
   *   return processData(ctx.parameters);
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.error('Task failed:', result);
   * } else {
   *   console.log('Task succeeded:', result);
   * }
   * ```
   */
  public execNoError<R, P>(task: ExecutorSyncTask<R, P>): R | ExecutorError;
  /** @override */
  public execNoError<R, P>(
    data: P,
    task: ExecutorSyncTask<R, P>
  ): R | ExecutorError;
  /** @override */
  public execNoError<R, P>(
    dataOrTask: P | ExecutorSyncTask<R, P>,
    task?: ExecutorSyncTask<R, P>
  ): R | ExecutorError {
    try {
      // Call the implementation directly
      const actualTask = (task || dataOrTask) as ExecutorSyncTask<R, P>;
      const data = (task ? dataOrTask : undefined) as P | undefined;

      if (typeof actualTask !== 'function') {
        throw new Error('Task must be a function!');
      }

      const context = this.createContext<P>(data ?? ({} as P));
      const result = this.run(context, actualTask);
      return result as R;
    } catch (error) {
      if (error instanceof ExecutorError) {
        return error;
      }
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return new ExecutorError(EXECUTOR_SYNC_ERROR, errorObj);
    }
  }

  /**
   * Execute task with full plugin pipeline
   * Always returns synchronously
   *
   * Core concept:
   * Complete sync execution pipeline with plugin lifecycle management
   * Works only with synchronous tasks
   *
   * @override
   * @template R - Type of task return value
   * @template P - Type of task input parameters
   * @param task - Task function to execute (must be synchronous)
   * @returns Task execution result
   *
   * @example Sync task
   * ```typescript
   * const result = executor.exec((ctx) => {
   *   return ctx.parameters.toUpperCase();
   * });
   * ```
   *
   * @example With data
   * ```typescript
   * const result = executor.exec({ text: 'hello' }, (ctx) => {
   *   return ctx.parameters.text.toUpperCase();
   * });
   * ```
   */
  public exec<R, P>(task: ExecutorSyncTask<R, P>): R;
  /** @override */
  public exec<R, P>(data: P, task: ExecutorSyncTask<R, P>): R;
  /** @override */
  public exec<R, P>(
    dataOrTask: P | ExecutorSyncTask<R, P>,
    task?: ExecutorSyncTask<R, P>
  ): R {
    const actualTask = (task || dataOrTask) as ExecutorSyncTask<R, P>;
    const data = (task ? dataOrTask : undefined) as P | undefined;

    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a function!');
    }

    const context = this.createContext<P>(data ?? ({} as P));
    return this.run(context, actualTask);
  }
}
