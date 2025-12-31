import {
  ExecutorAsyncTask,
  ExecutorContextInterface,
  ExecutorPluginInterface,
  ExecutorPluginNameType,
  ExecutorTask,
  ExecutorSyncTask
} from '../interface/ExecutorInterface';
import { ExecutorContextImpl } from './ExecutorContextImpl';
import { HookExecutor } from './HookExecutor';
import { ErrorProcessor } from './ErrorProcessor';
import {
  EXECUTOR_SYNC_ERROR,
  EXECUTOR_ASYNC_ERROR,
  DEFAULT_HOOK_ON_BEFORE,
  DEFAULT_HOOK_ON_EXEC,
  DEFAULT_HOOK_ON_SUCCESS
} from '../utils/constants';
import { LifecycleExecutorConfig } from './LifecycleExecutor';
import { isPromise } from '../utils/isPromise';

/**
 * Task executor for LifecycleExecutor
 *
 * Purpose:
 * Extracted from LifecycleExecutor to handle all task execution logic, including
 * the main task execution, onExec hook pipeline, and coordination with before/after hooks.
 * This separation improves code organization and maintainability.
 *
 * Key Differences from AsyncExecutor/SyncExecutor:
 *
 * Unified Sync/Async Task Execution:
 * - Single Implementation: One class handles both sync and async tasks
 *   - AsyncExecutor: Only async tasks (always returns Promise)
 *   - SyncExecutor: Only sync tasks (always synchronous)
 *   - LifecycleExecutor: Automatically detects and handles both
 *
 * - Dynamic Type Detection: Uses is-promise to detect Promise return values
 *   - No need for separate sync/async methods
 *   - Seamless mixing of sync and async operations
 *   - Runtime type checking for flexibility
 *
 * Parameter Update from onBefore Hooks:
 * - Automatic Parameter Updates: onBefore hook return values update context parameters
 *   - AsyncExecutor/SyncExecutor: onBefore hooks don't update parameters via return value
 *   - LifecycleExecutor: Return values from onBefore hooks automatically update parameters
 *   - Supports both sync and async return values
 *
 * Improved Pipeline Orchestration:
 * - Clear Separation: Before hooks → Task execution → After hooks
 *   - Each phase is clearly separated
 *   - Better error handling per phase
 *   - Easier to understand execution flow
 *
 * - onExec Hook Support: Handles onExec hook pipeline
 *   - Plugins can modify or wrap the task
 *   - Supports task chaining
 *   - Handles both sync and async task modifications
 *
 * Performance Optimizations:
 * - Cached Property Access: Hook methods are cached
 * - Early Returns: Empty plugin arrays handled efficiently
 * - Input Validation: Validates inputs early
 * - Efficient Promise Handling: Properly chains async operations
 *
 * Architecture Benefits:
 * - Separation of Concerns: Task execution logic isolated from hook execution
 * - Testability: Can test task execution independently
 * - Reusability: Can be reused in other executor implementations
 * - Maintainability: Easier to understand and modify task logic
 *
 * Execution Flow:
 * 1. Execute beforeHooks (onBefore)
 * 2. Update parameters if beforeHooks returned a value
 * 3. Execute onExec hooks (can modify task)
 * 4. Execute final task
 * 5. Execute afterHooks (onSuccess)
 * 6. Handle errors with onError hooks if needed
 *
 * Usage:
 * This class is used internally by LifecycleExecutor.
 * External code should not instantiate this class directly.
 *
 * @since 2.6.0
 * @template Ctx - Type of context interface
 * @template Plugin - Type of plugin interface
 *
 * @example Internal usage
 * ```typescript
 * const taskExecutor = new TaskExecutor(plugins, config, hookExecutor, errorProcessor);
 * const result = taskExecutor.run(context, task);
 * ```
 *
 * @see LifecycleExecutor - Main executor class that uses this task executor
 * @see HookExecutor - Hook executor used for before/after hooks
 * @see ErrorProcessor - Error processor used for error handling
 *
 * @category TaskExecutor
 */
export class TaskExecutor<
  Ctx extends
    ExecutorContextInterface<unknown> = ExecutorContextInterface<unknown>,
  Plugin extends ExecutorPluginInterface<Ctx> = ExecutorPluginInterface<Ctx>
> {
  constructor(
    protected plugins: Plugin[],
    protected config: LifecycleExecutorConfig,
    protected hookExecutor: HookExecutor<Ctx>,
    protected errorProcessor: ErrorProcessor<Ctx>
  ) {}

  /**
   * Core task execution method with plugin hooks
   * Automatically handles both sync and async execution
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context
   * @param actualTask - Actual task function to execute
   * @throws {ExecutorError} When task execution fails
   * @returns Task execution result (sync or async based on task and plugin types)
   */
  public run<Result, Params = unknown>(
    context: ExecutorContextImpl<Params>,
    actualTask:
      | ExecutorAsyncTask<Result, Params>
      | ExecutorSyncTask<Result, Params>
  ): Result | Promise<Result> {
    // Security: Validate inputs
    if (!context) {
      throw new Error('Context is required');
    }
    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a function');
    }

    // Use configured hooks or defaults
    const beforeHooks = this.config?.beforeHooks || DEFAULT_HOOK_ON_BEFORE;
    const afterHooks = this.config?.afterHooks || DEFAULT_HOOK_ON_SUCCESS;

    try {
      // Execute beforeHooks
      const beforeResult = this.hookExecutor.runHooks(
        this.plugins,
        beforeHooks,
        context
      );

      // Check if beforeHooks returned a Promise
      if (isPromise(beforeResult)) {
        return this.handleAsyncRun(
          context,
          beforeHooks,
          afterHooks,
          actualTask,
          beforeResult
        );
      }

      // Update parameters if beforeHooks returned a new value
      // This allows plugins to modify parameters through return value
      if (beforeResult !== undefined) {
        context.setParameters(beforeResult);
      }

      // Execute core logic with execHook support
      const execResult = this.runExec(context, actualTask);

      // Check if runExec returned a Promise
      if (isPromise(execResult)) {
        return execResult
          .then(async () => {
            // Execute afterHooks
            const afterResult = this.hookExecutor.runHooks(
              this.plugins,
              afterHooks,
              context
            );

            if (isPromise(afterResult)) {
              await afterResult;
            }

            return context.returnValue as Result;
          })
          .catch((error) => {
            // Security: Ensure error is properly handled
            // Performance: processError will throw, so this catch is necessary
            return this.errorProcessor.processError(
              error,
              context,
              this.plugins,
              EXECUTOR_ASYNC_ERROR
            );
          });
      }

      // Execute afterHooks
      const afterResult = this.hookExecutor.runHooks(
        this.plugins,
        afterHooks,
        context
      );

      // Check if afterHooks returned a Promise
      if (isPromise(afterResult)) {
        return afterResult
          .then(() => context.returnValue as Result)
          .catch((error) => {
            // Security: Ensure error is properly handled
            return this.errorProcessor.processError(
              error,
              context,
              this.plugins,
              EXECUTOR_ASYNC_ERROR
            );
          });
      }

      // All sync - return sync result
      return context.returnValue as Result;
    } catch (error) {
      // processError will throw, so this line is unreachable after it throws
      // But TypeScript needs to see a return/throw to satisfy the type checker
      return this.errorProcessor.processError(
        error,
        context,
        this.plugins,
        EXECUTOR_SYNC_ERROR
      ) as never;
    } finally {
      context.reset();
    }
  }

  /**
   * Handle async run execution when a Promise is detected in beforeHooks
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context
   * @param _beforeHooks - Before hooks configuration
   * @param afterHooks - After hooks configuration
   * @param actualTask - Task function
   * @param beforePromise - Promise from beforeHooks
   * @returns Promise resolving to result
   */
  protected async handleAsyncRun<Result, Params = unknown>(
    context: ExecutorContextImpl<Params>,
    _beforeHooks: ExecutorPluginNameType | ExecutorPluginNameType[],
    afterHooks: ExecutorPluginNameType | ExecutorPluginNameType[],
    actualTask: ExecutorTask<Result, Params>,
    beforePromise: Promise<Params>
  ): Promise<Result> {
    try {
      const beforeResult = await beforePromise;

      // Update parameters if beforeHooks returned a new value
      // This allows plugins to modify parameters through return value
      if (beforeResult !== undefined) {
        context.setParameters(beforeResult);
      }

      // Execute core logic with execHook support
      const execResult = this.runExec(context, actualTask);

      if (isPromise(execResult)) {
        await execResult;
      }

      // Execute afterHooks
      const afterResult = this.hookExecutor.runHooks(
        this.plugins,
        afterHooks,
        context
      );

      if (isPromise(afterResult)) {
        await afterResult;
      }

      return context.returnValue as Result;
    } catch (error) {
      // processError will throw, but we need to handle the Promise case
      const errorResult = this.errorProcessor.processError(
        error,
        context,
        this.plugins,
        EXECUTOR_ASYNC_ERROR
      );
      if (isPromise(errorResult)) {
        await errorResult;
      }
      // If not a Promise, processError already threw
      // This line is unreachable, but TypeScript needs it for type checking
      throw error;
    } finally {
      context.reset();
    }
  }

  /**
   * Execute task with execHook support
   * Handles plugin execution hooks and task execution
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context
   * @param actualTask - Task function to execute
   */
  public runExec<Result, Params = unknown>(
    context: ExecutorContextImpl<Params>,
    actualTask:
      | ExecutorAsyncTask<Result, Params>
      | ExecutorSyncTask<Result, Params>
  ): void | Promise<void> {
    // Security: Validate inputs
    if (!context) {
      throw new Error('Context is required');
    }
    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a function');
    }

    const execHook = this.config?.execHook || DEFAULT_HOOK_ON_EXEC;

    // Early return for empty plugins array
    if (this.plugins.length === 0) {
      // No plugins, execute task directly
      const taskResult = actualTask(context);
      if (isPromise(taskResult)) {
        return taskResult.then((result) => {
          context.setReturnValue(result);
        });
      }
      context.setReturnValue(taskResult);
      return;
    }

    let currentTask:
      | ExecutorAsyncTask<Result, Params>
      | ExecutorSyncTask<Result, Params> = actualTask;
    let finalResult: Result | undefined;
    let _index = -1;

    for (const plugin of this.plugins) {
      _index++;

      // Cache hook method access to avoid repeated property lookup
      const hookMethod = plugin[execHook as keyof ExecutorPluginInterface<Ctx>];
      if (
        typeof hookMethod !== 'function' ||
        (typeof plugin.enabled === 'function' &&
          !plugin.enabled(execHook, context as unknown as Ctx))
      ) {
        continue;
      }

      if (context.shouldBreakChain()) {
        break;
      }

      // Update runtime tracking
      context.runtimes(plugin, execHook, _index);

      // Use cached hookMethod
      const pluginReturn = (hookMethod as (...args: unknown[]) => unknown)(
        context,
        currentTask
      );

      // Check if plugin returned a Promise
      if (isPromise(pluginReturn)) {
        // Handle async plugin execution
        return this.handleAsyncExecExecution(
          context,
          execHook,
          _index + 1,
          pluginReturn,
          currentTask,
          finalResult
        );
      }

      // Handle sync plugin
      if (typeof pluginReturn === 'function') {
        currentTask = pluginReturn as
          | ExecutorAsyncTask<Result, Params>
          | ExecutorSyncTask<Result, Params>;
        context.runtimeReturnValue(pluginReturn);
        context.setReturnValue(pluginReturn);
      } else {
        if (pluginReturn === undefined) {
          continue;
        }

        finalResult = pluginReturn as Result;
        context.runtimeReturnValue(pluginReturn);
        context.setReturnValue(pluginReturn);
      }
    }

    // Execute final task or use final result
    // Security: Ensure task is still a function before calling
    if (typeof currentTask !== 'function') {
      throw new Error('Task must be a function');
    }

    const taskResult = currentTask(context);

    if (isPromise(taskResult)) {
      return taskResult
        .then((result) => {
          context.setReturnValue(
            finalResult !== undefined ? finalResult : result
          );
        })
        .catch((error) => {
          // Security: Ensure promise rejection is properly handled
          throw error;
        });
    }

    context.setReturnValue(
      finalResult !== undefined ? finalResult : taskResult
    );
  }

  /**
   * Handle async exec execution when a Promise is detected
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context
   * @param execHook - Hook name
   * @param startIndex - Next plugin index to process (after the async plugin that returned firstPromise)
   * @param firstPromise - First Promise returned by plugin
   * @param currentTask - Current task function
   * @param currentFinalResult - Current final result
   * @returns Promise resolving to void
   */
  protected async handleAsyncExecExecution<Result, Params = unknown>(
    context: ExecutorContextImpl<Params>,
    execHook: ExecutorPluginNameType,
    startIndex: number,
    firstPromise: Promise<unknown>,
    currentTask:
      | ExecutorAsyncTask<Result, Params>
      | ExecutorSyncTask<Result, Params>,
    currentFinalResult: Result | undefined
  ): Promise<void> {
    // Security: Validate inputs
    if (!context) {
      throw new Error('Context is required');
    }
    // startIndex can be plugins.length (meaning no more plugins to process)
    if (startIndex < 0 || startIndex > this.plugins.length) {
      throw new Error(
        `Invalid startIndex: ${startIndex}, plugins.length: ${this.plugins.length}`
      );
    }

    let task = currentTask;
    let finalResult = currentFinalResult;

    // Wait for the first async plugin
    // Security: Handle promise rejection properly
    let resolved: unknown;
    try {
      resolved = await firstPromise;
    } catch (error) {
      // Re-throw to be handled by caller's error handling
      throw error;
    }

    if (typeof resolved === 'function') {
      task = resolved as
        | ExecutorAsyncTask<Result, Params>
        | ExecutorSyncTask<Result, Params>;
      context.runtimeReturnValue(resolved);
      context.setReturnValue(resolved);
    } else if (resolved !== undefined) {
      finalResult = resolved as Result;
      context.runtimeReturnValue(resolved);
      context.setReturnValue(resolved);
    }

    // Continue with remaining plugins
    // startIndex is the next plugin index to process (after the async plugin)
    for (let i = startIndex; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];

      // Cache hook method access to avoid repeated property lookup
      const hookMethod = plugin[execHook as keyof ExecutorPluginInterface<Ctx>];
      if (
        typeof hookMethod !== 'function' ||
        (typeof plugin.enabled === 'function' &&
          !plugin.enabled(execHook, context as unknown as Ctx))
      ) {
        continue;
      }

      if (context.shouldBreakChain()) {
        break;
      }

      // Update runtime tracking
      context.runtimes(plugin, execHook, i);

      // Use cached hookMethod
      const pluginReturn = (hookMethod as (...args: unknown[]) => unknown)(
        context,
        task
      );

      if (isPromise(pluginReturn)) {
        const resolved = await pluginReturn;
        if (typeof resolved === 'function') {
          task = resolved as
            | ExecutorAsyncTask<Result, Params>
            | ExecutorSyncTask<Result, Params>;
          context.runtimeReturnValue(resolved);
          context.setReturnValue(resolved);
        } else if (resolved !== undefined) {
          finalResult = resolved as Result;
          context.runtimeReturnValue(resolved);
          context.setReturnValue(resolved);
        }
      } else {
        if (typeof pluginReturn === 'function') {
          task = pluginReturn as
            | ExecutorAsyncTask<Result, Params>
            | ExecutorSyncTask<Result, Params>;
          context.runtimeReturnValue(pluginReturn);
          context.setReturnValue(pluginReturn);
        } else if (pluginReturn !== undefined) {
          finalResult = pluginReturn as Result;
          context.runtimeReturnValue(pluginReturn);
          context.setReturnValue(pluginReturn);
        }
      }
    }

    // Execute final task
    // Security: Ensure task is still a function before calling
    if (typeof task !== 'function') {
      throw new Error('Task must be a function');
    }

    const taskResult = task(context);

    if (isPromise(taskResult)) {
      const result = await taskResult;
      context.setReturnValue(finalResult !== undefined ? finalResult : result);
    } else {
      context.setReturnValue(
        finalResult !== undefined ? finalResult : taskResult
      );
    }
  }
}
