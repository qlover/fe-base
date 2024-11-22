export type PromiseTask<T, D = unknown> = (data: D) => Promise<T>;
export type SyncTask<T, D = unknown> = (data: D) => T;
export type Task<T, D = unknown> = PromiseTask<T, D> | SyncTask<T, D>;

// BasePlugin remains the same
export abstract class ExecutorPlugin<T = unknown, R = T> {
  /**
   * only one instance of the same plugin
   */
  readonly onlyOne?: boolean;

  /**
   * override to enable/disable plugin.
   *
   * receive args from `exec` or `execNoError`
   */
  enabled?(name: keyof ExecutorPlugin, ...args: unknown[]): boolean;

  /**
   * **has return value, not break the chain**
   * @access plugin
   */
  onBefore?(data?: unknown): unknown | Promise<unknown>;
  /**
   * - if call `exec`, onError has return value or throw any error, exec will break the chain and throw error
   * - if call `execNoError`, onError has return value or throw any error, execNoError will return the error
   *
   * **as long as it is captured by the error chain, the chain will be terminated**
   * @access plugin
   */
  onError?(
    error: Error,
    data?: unknown
  ): Promise<ExecutorError | void> | ExecutorError | void;
  /**
   * @access plugin
   * **has return value, break the chain**
   */
  onSuccess?(result: T): R | Promise<R>;

  /**
   * can override exec run logic.
   *
   * **only use first bind plugin's onExec**
   * @param data
   * @param task
   */
  onExec?<T>(task: PromiseTask<T> | Task<T>): Promise<T | void> | T | void;
}

// Custom Error Class
export class ExecutorError extends Error {
  constructor(
    public id: string,
    originalError?: string | Error
  ) {
    super(
      typeof originalError === 'string'
        ? originalError
        : originalError?.message || id
    );

    Object.setPrototypeOf(this, new.target.prototype); // Ensure instanceof works
  }
}

export interface ExecutorConfig {}

// Simplified BaseExecutor with no generics
export abstract class Executor {
  /**
   * plugins instance only
   */
  protected plugins: ExecutorPlugin[] = [];

  constructor(protected config: ExecutorConfig = {}) {}

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
   * run hook
   * @param plugins plugins
   * @param name hook name
   * @param args hook args
   */
  abstract runHook(
    plugins: ExecutorPlugin[],
    name: keyof ExecutorPlugin,
    ...args: unknown[]
  ): void | unknown | Promise<void | unknown>;

  /**
   * execute task and return result
   * @throw {ExecutorError} if task execution fails, throw ExecutorError
   * @param task task
   */
  abstract exec<T>(task: Task<T>): Promise<T> | T;
  abstract exec<T>(data: unknown, task: Task<T>): Promise<T> | T;

  /**
   * execute task and return result without throwing error, wrap all errors as ExecutorError
   * @param task task
   */
  abstract execNoError<T>(
    task: Task<T>
  ): Promise<T | ExecutorError> | T | ExecutorError;
  abstract execNoError<T>(
    data: unknown,
    task: Task<T>
  ): Promise<T | ExecutorError> | T | ExecutorError;
}
