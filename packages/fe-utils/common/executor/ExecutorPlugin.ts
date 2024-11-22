import { ExecutorError } from './ExecutorError';

/**
 * Type definition for promise-based task
 * @template T - Return type of the task
 * @template D - Input data type for the task
 * @example
 * ```typescript
 * const promiseTask: PromiseTask<string, number> = async (data: number) => {
 *   return `Result: ${data}`;
 * };
 * ```
 */
export type PromiseTask<T, D = unknown> = (data: D) => Promise<T>;

/**
 * Type definition for synchronous task
 * @template T - Return type of the task
 * @template D - Input data type for the task
 * @example
 * ```typescript
 * const syncTask: SyncTask<string, number> = (data: number) => {
 *   return `Result: ${data}`;
 * };
 * ```
 */
export type SyncTask<T, D = unknown> = (data: D) => T;

/**
 * Union type for both promise and sync tasks
 * @template T - Return type of the task
 * @template D - Input data type for the task
 */
export type Task<T, D = unknown> = PromiseTask<T, D> | SyncTask<T, D>;

/**
 * Base plugin class for extending executor functionality.
 * Plugins provide a way to intercept and modify the execution flow at different stages:
 * - Before execution (onBefore)
 * - After successful execution (onSuccess)
 * - On error (onError)
 * - Custom execution logic (onExec)
 *
 * @abstract
 * @template T - Type of data being processed
 * @template R - Type of result after processing
 *
 * @example
 * ```typescript
 * class LoggerPlugin extends ExecutorPlugin {
 *   onBefore(data: unknown) {
 *     console.log('Before execution:', data);
 *     return data;
 *   }
 *
 *   onSuccess(result: unknown) {
 *     console.log('Execution succeeded:', result);
 *     return result;
 *   }
 *
 *   onError(error: Error) {
 *     console.error('Execution failed:', error);
 *     throw error;
 *   }
 * }
 * ```
 */
export abstract class ExecutorPlugin<T = unknown, R = T> {
  /**
   * Indicates if only one instance of this plugin should exist in the executor
   * When true, attempting to add duplicate plugins will result in a warning
   */
  readonly onlyOne?: boolean;

  /**
   * Controls whether the plugin is active for specific hook executions
   * @param name - Name of the hook being executed
   * @param args - Arguments passed to the hook
   * @returns Boolean indicating if the plugin should be executed
   *
   * @example
   * ```typescript
   * enabled(name: keyof ExecutorPlugin, ...args: unknown[]) {
   *   // Only enable for error handling
   *   return name === 'onError';
   * }
   * ```
   */
  enabled?(name: keyof ExecutorPlugin, ...args: unknown[]): boolean;

  /**
   * Hook executed before the main task
   * Can modify the input data before it reaches the task
   * @param data - Input data
   * @returns Modified data or Promise of modified data
   */
  onBefore?(data?: unknown): unknown | Promise<unknown>;

  /**
   * Error handling hook
   * - For `exec`: returning a value or throwing will break the chain
   * - For `execNoError`: returning a value or throwing will return the error
   *
   * @param error - Error that occurred
   * @param data - Original input data
   * @returns ExecutorError, void, or Promise of either
   */
  onError?(
    error: Error,
    data?: unknown
  ): Promise<ExecutorError | void> | ExecutorError | void;

  /**
   * Hook executed after successful task completion
   * Can transform the task result
   * @param result - Task execution result
   * @returns Modified result or Promise of modified result
   */
  onSuccess?(result: T): R | Promise<R>;

  /**
   * Custom execution logic hook
   * Only the first plugin with onExec will be used
   * @param task - Task to be executed
   * @returns Task result or Promise of result
   */
  onExec?<T>(task: PromiseTask<T> | Task<T>): Promise<T | void> | T | void;
}
