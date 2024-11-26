import { ExecutorError } from './ExecutorError';
import { ExecutorPlugin, Task } from './ExecutorPlugin';

/**
 * Configuration interface for executor
 * Currently empty but allows for future extension
 */
export interface ExecutorConfig {}

/**
 * Base executor class providing plugin management and execution pipeline
 *
 * The Executor pattern implements a pluggable execution pipeline that allows:
 * 1. Pre-processing of input data
 * 2. Post-processing of results
 * 3. Error handling
 * 4. Custom execution logic
 *
 * @abstract
 * @class Executor
 *
 * @example
 * ```typescript
 * // Create an executor instance
 * const executor = new AsyncExecutor();
 *
 * // Add plugins
 * executor.use(new LoggerPlugin());
 * executor.use(new RetryPlugin({ maxAttempts: 3 }));
 *
 * // Execute a task
 * const result = await executor.exec(async (data) => {
 *   return await someAsyncOperation(data);
 * });
 * ```
 */
export abstract class Executor {
  /**
   * Array of active plugins
   * Plugins are executed in the order they were added
   */
  protected plugins: ExecutorPlugin[] = [];

  constructor(protected config: ExecutorConfig = {}) {}

  /**
   * Add a plugin to the executor
   * @param plugin - Plugin instance to add
   */
  use(plugin: ExecutorPlugin): void {
    if (
      this.plugins.find((p) => p.constructor === plugin.constructor) &&
      plugin.onlyOne
    ) {
      console.warn(
        `Plugin ${plugin.constructor.name} is already used, skip adding`
      );
      return;
    }

    this.plugins.push(plugin);
  }

  /**
   * Execute a plugin hook
   * Must be implemented by concrete executor classes
   * @param plugins - Plugins to execute
   * @param name - Hook name to execute
   * @param args - Arguments for the hook
   */
  abstract runHook(
    plugins: ExecutorPlugin[],
    name: keyof ExecutorPlugin,
    ...args: unknown[]
  ): void | unknown | Promise<void | unknown>;

  /**
   * Execute a task with plugin pipeline
   * @param task - Task to execute
   * @throws {ExecutorError} If task execution fails
   */
  abstract exec<T>(task: Task<T>): Promise<T> | T;
  abstract exec<T>(data: unknown, task: Task<T>): Promise<T> | T;

  /**
   * Execute a task without throwing errors
   * All errors are wrapped in ExecutorError
   * @param task - Task to execute
   */
  abstract execNoError<T>(
    task: Task<T>
  ): Promise<T | ExecutorError> | T | ExecutorError;
  abstract execNoError<T>(
    data: unknown,
    task: Task<T>
  ): Promise<T | ExecutorError> | T | ExecutorError;
}
