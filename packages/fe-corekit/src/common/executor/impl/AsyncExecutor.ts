import {
  Executor,
  ExecutorContext,
  ExecutorError,
  ExecutorPlugin,
  PromiseTask
} from '../../../interface';

/**
 * Asynchronous implementation of the Executor pattern
 *
 * - Purpose: Provides asynchronous task execution with plugin support
 * - Core Concept: Async execution pipeline with plugin hooks
 * - Main Features:
 *  - Asynchronous plugin hook execution
 *  - Promise-based task handling
 *  - Error handling with plugin support
 * - Primary Use: Handling async operations with extensible middleware
 *
 * @example
 * ```typescript
 * const executor = new AsyncExecutor();
 * executor.use(new LogPlugin());
 *
 * const result = await executor.exec(async (data) => {
 *   const response = await fetch('https://api.example.com/data');
 *   return response.json();
 * });
 * ```
 *
 * @category AsyncExecutor
 */
export class AsyncExecutor<
  ExecutorConfig = unknown
> extends Executor<ExecutorConfig> {
  /**
   * Execute plugin hook functions asynchronously
   *
   * - Purpose: Orchestrates asynchronous plugin hook execution
   * - Core Concept: Sequential async plugin pipeline
   * - Main Features:
   *  - Plugin enablement checking
   *  - Result chaining
   *  - Error hook special handling
   * - Primary Use: Internal plugin lifecycle management
   *
   * Plugin execution flow:
   * 1. Check if plugin is enabled for the hook
   * 2. Execute plugin hook if available
   * 3. Handle plugin results and chain breaking conditions
   *
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function to execute
   * @param args - Arguments to pass to the hook function
   * @returns Promise resolving to the hook execution result
   *
   * @example
   * ```typescript
   * const result = await this.runHook(
   *   this.plugins,
   *   'beforeExec',
   *   { userId: 123 }
   * );
   * ```
   */
  async runHooks<Params>(
    plugins: ExecutorPlugin[],
    /**
     * allow any string as hook name.
     * if the hook name is not a function, it will be skipped
     *
     * @since 1.1.3
     */
    hookName: string,
    context?: ExecutorContext<Params>,
    ...args: unknown[]
  ): Promise<unknown> {
    let _index = -1;
    let returnValue: unknown;

    const _context: ExecutorContext<Params> = context || {
      parameters: undefined as Params,
      hooksRuntimes: {}
    };

    // reset hooksRuntimes times and index
    _context.hooksRuntimes.times = 0;
    _context.hooksRuntimes.index = undefined;

    for (const plugin of plugins) {
      _index++;

      if (
        typeof plugin[hookName as keyof ExecutorPlugin] !== 'function' ||
        (typeof plugin.enabled == 'function' &&
          !plugin.enabled(hookName as keyof ExecutorPlugin, context))
      ) {
        continue;
      }

      // if breakChain is true, stop the chain
      if (_context.hooksRuntimes?.breakChain) {
        break;
      }

      _context.hooksRuntimes.pluginName = plugin.pluginName;
      _context.hooksRuntimes.hookName = hookName;
      _context.hooksRuntimes.times++;
      _context.hooksRuntimes.index = _index;

      // @ts-expect-error
      const pluginReturn = await plugin[hookName](context, ...args);

      if (pluginReturn !== undefined) {
        returnValue = pluginReturn;
        // set runtimes returnValue
        _context.hooksRuntimes.returnValue = pluginReturn;

        // When returnBreakChain is true, stop the chain
        if (_context.hooksRuntimes.returnBreakChain) {
          return returnValue;
        }
      }
    }

    return returnValue;
  }

  /**
   * Execute task without throwing errors
   *
   * - Purpose: Safe execution of async tasks
   * - Core Concept: Error wrapping and handling
   * - Main Features:
   *  - Catches all execution errors
   *  - Wraps errors in ExecutorError
   *  - Returns either result or error object
   * - Primary Use: When you want to handle errors without try-catch
   *
   * @template T - Type of task return value
   * @param dataOrTask - Task data or task function
   * @param task - Task function (optional)
   * @returns Promise resolving to either result or ExecutorError
   *
   * @example
   * ```typescript
   * const result = await executor.execNoError(async () => {
   *   const response = await riskyOperation();
   *   return response.data;
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.error('Operation failed:', result);
   * }
   * ```
   */
  async execNoError<Result, Params = unknown>(
    dataOrTask: unknown | PromiseTask<Result, Params>,
    task?: PromiseTask<Result, Params>
  ): Promise<Result | ExecutorError> {
    try {
      return await this.exec(dataOrTask as Params, task);
    } catch (error) {
      if (error instanceof ExecutorError) {
        return error;
      }

      return new ExecutorError('UNKNOWN_ASYNC_ERROR', error as Error);
    }
  }

  /**
   * Execute asynchronous task with full plugin pipeline
   *
   * - Purpose: Primary method for executing async tasks
   * - Core Concept: Full plugin pipeline execution
   * - Main Features:
   *  - Plugin hook integration
   *  - Task validation
   *  - Custom execution support
   * - Primary Use: Running async tasks with plugin support
   *
   * Execution flow:
   * 1. Validate and prepare task
   * 2. Check for custom execution plugins
   * 3. Execute task with plugin pipeline
   *
   * @template T - Type of task return value
   * @template D - Type of task data
   * @param dataOrTask - Task data or task function
   * @param task - Task function (optional)
   * @throws {Error} When task is not an async function
   * @returns Promise resolving to task result
   *
   * @example
   * ```typescript
   * // With separate data and task
   * const data = { userId: 123 };
   * const result = await executor.exec(data, async (input) => {
   *   return await fetchUserData(input.userId);
   * });
   *
   * // With combined task
   * const result = await executor.exec(async () => {
   *   return await fetchData();
   * });
   * ```
   */
  exec<Result, Params = unknown>(
    dataOrTask: Params | PromiseTask<Result, Params>,
    task?: PromiseTask<Result, Params>
  ): Promise<Result> {
    const actualTask = (task || dataOrTask) as PromiseTask<Result, Params>;
    const data = (task ? dataOrTask : undefined) as Params;

    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a async function!');
    }

    return this.run(data, actualTask);
  }

  /**
   * Core task execution method with plugin hooks
   *
   * - Purpose: Implements the complete execution pipeline
   * - Core Concept: Sequential hook execution with error handling
   * - Main Features:
   *  - Before/After hooks
   *  - Error handling hooks
   *  - Result transformation
   * - Primary Use: Internal pipeline orchestration
   *
   * Pipeline stages:
   * 1. onBefore hooks - Pre-process input data
   * 2. Task execution - Run the actual task
   * 3. onSuccess hooks - Post-process results
   * 4. onError hooks - Handle any errors
   *
   * @template T - Type of task return value
   * @template D - Type of task data
   * @param data - Input data for the task
   * @param actualTask - Task function to execute
   * @throws {ExecutorError} When task execution fails
   * @returns Promise resolving to task result(context.returnValue)
   *
   * @example
   * ```typescript
   * private async run(data, task) {
   *   try {
   *     const preparedData = await this.runHook(this.plugins, 'onBefore', data);
   *     const result = await task(preparedData);
   *     return await this.runHook(this.plugins, 'onSuccess', result);
   *   } catch (error) {
   *     const handledError = await this.runHook(
   *       this.plugins,
   *       'onError',
   *       error,
   *       data
   *     );
   *     throw new ExecutorError('EXECUTION_FAILED', handledError);
   *   }
   * }
   * ```
   */
  async run<Result, Params = unknown>(
    data: Params,
    actualTask: PromiseTask<Result, Params>
  ): Promise<Result> {
    const context: ExecutorContext<Params> = {
      parameters: data,
      returnValue: undefined,
      error: undefined,
      hooksRuntimes: {
        pluginName: '',
        hookName: '',
        returnValue: undefined,
        returnBreakChain: false,
        times: 0
      }
    };

    const runExec = async (ctx: ExecutorContext<Params>): Promise<void> => {
      await this.runHooks(this.plugins, 'onExec', ctx, actualTask);

      // if exec times is 0, then execute task, otherwise return the result of the last hook
      if (ctx.hooksRuntimes.times === 0) {
        ctx.returnValue = await actualTask(ctx);
        return;
      }

      ctx.returnValue = ctx.hooksRuntimes.returnValue;
    };

    try {
      await this.runHooks(this.plugins, 'onBefore', context);

      await runExec(context);

      await this.runHooks(this.plugins, 'onSuccess', context);

      return context.returnValue as Result;
    } catch (error) {
      context.error = error as Error;

      await this.runHooks(this.plugins, 'onError', context);

      // if onError hook return a ExecutorError, then throw it
      if (context.hooksRuntimes.returnValue) {
        context.error = context.hooksRuntimes.returnValue as Error;
      }

      if (context.error instanceof ExecutorError) {
        throw context.error;
      }

      throw new ExecutorError('UNKNOWN_ASYNC_ERROR', context.error);
    } finally {
      // reset hooksRuntimes
      context.hooksRuntimes = {
        pluginName: '',
        hookName: '',
        returnValue: undefined,
        returnBreakChain: false,
        times: 0
      };
    }
  }
}
