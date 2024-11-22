import {
  Executor,
  ExecutorError,
  ExecutorPlugin,
  PromiseTask
} from './Executor';

/**
 * Asynchronous executor class that extends the base Executor
 * Provides asynchronous task execution with plugin support
 *
 * Key features:
 * 1. Asynchronous plugin hook execution
 * 2. Promise-based task handling
 * 3. Error handling with async plugin support
 * 4. Flexible execution flow control
 *
 * @extends Executor
 *
 * @example
 * ```typescript
 * // Create an async executor
 * const executor = new AsyncExecutor();
 *
 * // Add plugins for different purposes
 * executor.use(new RetryPlugin({ maxAttempts: 3 }));
 * executor.use(new TimeoutPlugin({ timeout: 5000 }));
 *
 * // Example 1: Basic async task execution
 * const result = await executor.exec(async (data) => {
 *   const response = await fetch('https://api.example.com/data');
 *   return response.json();
 * });
 *
 * // Example 2: Execution with input data
 * const data = { id: 123 };
 * const result = await executor.exec(data, async (input) => {
 *   const response = await fetch(`https://api.example.com/data/${input.id}`);
 *   return response.json();
 * });
 *
 * // Example 3: Error handling with execNoError
 * const result = await executor.execNoError(async () => {
 *   throw new Error('API Error');
 * }); // Returns ExecutorError instead of throwing
 * ```
 */
export class AsyncExecutor extends Executor {
  /**
   * Execute plugin hook functions asynchronously
   * Manages the plugin execution chain and handles results
   *
   * Plugin execution flow:
   * 1. Check if plugin is enabled for the hook
   * 2. Execute plugin hook if available
   * 3. Handle plugin results and chain breaking conditions
   *
   * @param plugins - Array of plugins to execute
   * @param name - Name of the hook function to execute
   * @param args - Arguments to pass to the hook function
   * @returns Result of the hook function execution
   *
   * @example
   * ```typescript
   * // Internal usage example
   * const result = await this.runHook(
   *   this.plugins,
   *   'onBefore',
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
   * Wraps all errors in ExecutorError for safe error handling
   *
   * Use this method when you want to handle errors in the calling code
   * rather than using try-catch blocks
   *
   * @template T - Type of task return value
   * @param dataOrTask - Task data or task function
   * @param task - Task function (optional)
   * @returns Promise that resolves to either task result or ExecutorError
   *
   * @example
   * ```typescript
   * const result = await executor.execNoError(async () => {
   *   if (Math.random() > 0.5) {
   *     throw new Error('Random failure');
   *   }
   *   return 'success';
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.log('Task failed:', result.message);
   * } else {
   *   console.log('Task succeeded:', result);
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
   * Core method for task execution with plugin support
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
   * @returns Promise that resolves to task execution result
   *
   * @example
   * ```typescript
   * // Example with data and task separation
   * const data = { userId: 123 };
   * const task = async (input) => {
   *   const user = await db.users.findById(input.userId);
   *   return user.profile;
   * };
   *
   * const profile = await executor.exec(data, task);
   *
   * // Example with combined task
   * const result = await executor.exec(async () => {
   *   return await someAsyncOperation();
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
   * Core method to run asynchronous task with plugin hooks
   * Implements the complete execution pipeline with all plugin hooks
   *
   * Pipeline stages:
   * 1. onBefore hooks - Pre-process input data
   * 2. Task execution - Run the actual task
   * 3. onSuccess hooks - Post-process results
   * 4. onError hooks - Handle any errors
   *
   * @template T - Type of task return value
   * @template D - Type of task data
   * @param data - Data to pass to the task
   * @param actualTask - Actual task function to execute
   * @throws {ExecutorError} When task execution fails
   * @returns Promise that resolves to task execution result
   *
   * @example
   * ```typescript
   * // Internal usage example
   * private async run(data, task) {
   *   try {
   *     const preparedData = await this.runHook(this.plugins, 'onBefore', data);
   *     const result = await task(preparedData);
   *     return await this.runHook(this.plugins, 'onSuccess', result);
   *   } catch (error) {
   *     // Error handling with plugin support
   *     const handledError = await this.runHook(
   *       this.plugins,
   *       'onError',
   *       error,
   *       data
   *     );
   *     // ... error handling logic ...
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
