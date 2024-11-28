import { Executor } from './Executor';
import { ExecutorError } from './ExecutorError';
import { ExecutorPlugin, PromiseTask } from './ExecutorPlugin';

/**
 * Asynchronous implementation of the Executor pattern
 *
 * Purpose: Provides asynchronous task execution with plugin support
 * Core Concept: Async execution pipeline with plugin hooks
 * Main Features:
 * - Asynchronous plugin hook execution
 * - Promise-based task handling
 * - Error handling with plugin support
 * Primary Use: Handling async operations with extensible middleware
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
export class AsyncExecutor extends Executor {
  /**
   * Execute plugin hook functions asynchronously
   *
   * Purpose: Orchestrates asynchronous plugin hook execution
   * Core Concept: Sequential async plugin pipeline
   * Main Features:
   * - Plugin enablement checking
   * - Result chaining
   * - Error hook special handling
   * Primary Use: Internal plugin lifecycle management
   *
   * Plugin execution flow:
   * 1. Check if plugin is enabled for the hook
   * 2. Execute plugin hook if available
   * 3. Handle plugin results and chain breaking conditions
   *
   * @param plugins - Array of plugins to execute
   * @param name - Name of the hook function to execute
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
  async runHook(
    plugins: ExecutorPlugin[],
    name: keyof ExecutorPlugin,
    ...args: unknown[]
  ): Promise<void | unknown> {
    // if args is not empty, use args[0] as result
    let result: unknown = args?.[0];
    for (const plugin of plugins) {
      // skip plugin if not enabled
      if (plugin.enabled && !plugin.enabled?.(name, ...args)) {
        continue;
      }

      // skip plugin if not has method
      if (!plugin[name]) {
        continue;
      }

      // @ts-expect-error TODO: fix this type
      const pluginResult = await plugin[name](...args);

      if (pluginResult !== undefined) {
        // if is onError, break chain
        if (name === 'onError') {
          return pluginResult;
        }

        result = pluginResult;
      }
    }
    return result;
  }

  /**
   * Execute task without throwing errors
   *
   * Purpose: Safe execution of async tasks
   * Core Concept: Error wrapping and handling
   * Main Features:
   * - Catches all execution errors
   * - Wraps errors in ExecutorError
   * - Returns either result or error object
   * Primary Use: When you want to handle errors without try-catch
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
  async execNoError<T>(
    dataOrTask: unknown | PromiseTask<T>,
    task?: PromiseTask<T>
  ): Promise<T | ExecutorError> {
    try {
      return await this.exec(dataOrTask as unknown, task);
    } catch (error) {
      return error as ExecutorError;
    }
  }

  /**
   * Execute asynchronous task with full plugin pipeline
   *
   * Purpose: Primary method for executing async tasks
   * Core Concept: Full plugin pipeline execution
   * Main Features:
   * - Plugin hook integration
   * - Task validation
   * - Custom execution support
   * Primary Use: Running async tasks with plugin support
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
  exec<T, D = unknown>(
    dataOrTask: unknown | PromiseTask<T, D>,
    task?: PromiseTask<T, D>
  ): Promise<T> {
    // Check if data is provided
    const actualTask = (task || dataOrTask) as PromiseTask<T, D>;
    const data = (task ? dataOrTask : undefined) as D;
    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a async function!');
    }

    let calls = 0;
    const runner = (): Promise<T> => {
      calls++;
      return this.run(data, actualTask);
    };

    const findOnExec = this.plugins.find(
      (plugin) => typeof plugin['onExec'] === 'function'
    );

    if (findOnExec) {
      return this.runHook(this.plugins, 'onExec', runner) as Promise<T>;
    }

    return runner();
  }

  /**
   * Core task execution method with plugin hooks
   *
   * Purpose: Implements the complete execution pipeline
   * Core Concept: Sequential hook execution with error handling
   * Main Features:
   * - Before/After hooks
   * - Error handling hooks
   * - Result transformation
   * Primary Use: Internal pipeline orchestration
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
   * @returns Promise resolving to task result
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
  async run<T, D = unknown>(
    data: D,
    actualTask: PromiseTask<T, D>
  ): Promise<T> {
    try {
      const beforeResult = await this.runHook(this.plugins, 'onBefore', data);

      const result = await actualTask(beforeResult as D);

      return this.runHook(this.plugins, 'onSuccess', result) as T;
    } catch (error) {
      const handledError = await this.runHook(
        this.plugins,
        'onError',
        error as Error,
        data
      );

      if (handledError instanceof ExecutorError) {
        throw handledError;
      }

      throw new ExecutorError('UNKNOWN_ASYNC_ERROR', handledError as Error);
    }
  }
}
