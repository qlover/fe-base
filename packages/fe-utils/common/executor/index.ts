type PromiseTask<T, D = unknown> = (data: D) => Promise<T>;
type SyncTask<T, D = unknown> = (data: D) => T;
type Task<T, D = unknown> = PromiseTask<T, D> | SyncTask<T, D>;

// BasePlugin remains the same
export abstract class ExecutorPlugin<T = unknown, R = T> {
  /**
   * **has return value, not break the chain**
   */
  onBefore?(data?: unknown): unknown | Promise<unknown>;
  /**
   * - if call `exec`, onError has return value or throw any error, exec will break the chain and throw error
   * - if call `execNoError`, onError has return value or throw any error, execNoError will return the error
   *
   * **as long as it is captured by the error chain, the chain will be terminated**
   */
  onError?(error: Error, data?: unknown): ExecutorError | void;
  /**
   * **has return value, break the chain**
   */
  onSuccess?(result: T): R | Promise<R>;
}

// Custom Error Class
export class ExecutorError extends Error {
  constructor(
    public id: string,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Ensure instanceof works
  }
}

export interface ExecutorConfig {
  /**
   * whether throw error
   */
  throwError?: boolean;
  /**
   * retry times
   */
  retry?: number;
}

// Simplified BaseExecutor with no generics
export abstract class Executor {
  protected plugins: ExecutorPlugin[] = [];

  constructor(protected config: ExecutorConfig = { throwError: true }) {}

  addPlugin(plugin: ExecutorPlugin): void {
    this.plugins.push(plugin);
  }

  use(plugin: ExecutorPlugin): void {
    this.addPlugin(plugin);
  }

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

  /**
   * before chain
   */
  protected abstract beforeChain(data?: unknown): void | Promise<void>;

  /**
   * success chain
   * @param result
   */
  protected abstract successChain<T, R>(result: T): R | Promise<R>;

  /**
   * error chain
   * @param error
   */
  protected abstract errorChain(
    error: Error,
    data?: unknown
  ): ExecutorError | Promise<ExecutorError>;
}

/**
 * async executor
 */
export class AsyncExecutor extends Executor {
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

  async exec<T, D = unknown>(
    dataOrTask: D | PromiseTask<T, D>,
    task?: PromiseTask<T, D>
  ): Promise<T> {
    // Check if data is provided
    const actualTask = (task || dataOrTask) as PromiseTask<T, D>;
    const data = task ? dataOrTask : undefined;

    try {
      if (typeof actualTask !== 'function') {
        throw new Error('Task must be a async function!');
      }

      const beforeResult = await this.beforeChain(data);

      const result = await actualTask(beforeResult as D);
      return this.successChain<T, T>(result);
    } catch (error) {
      throw await this.errorChain(error as Error, data);
    }
  }

  protected async beforeChain(data?: unknown): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.onBefore?.(data);
    }
  }

  protected async successChain<T, R>(result: T): Promise<R> {
    let modifiedResult: unknown = result;
    for (const plugin of this.plugins) {
      const pluginResult = await plugin.onSuccess?.(modifiedResult as T);

      // early return
      if (pluginResult !== undefined) {
        return (modifiedResult = pluginResult) as R;
      }
    }
    return modifiedResult as R;
  }

  protected async errorChain(
    error: Error,
    data?: unknown
  ): Promise<ExecutorError> {
    for (const plugin of this.plugins) {
      const handledError = await plugin.onError?.(error, data);
      if (handledError) return handledError;
    }
    return new ExecutorError(
      'Unhandled async error',
      'UNKNOWN_ASYNC_ERROR',
      error
    );
  }
}

/**
 * sync executor
 */
export class SyncExecutor extends Executor {
  execNoError<T>(
    dataOrTask: unknown | SyncTask<T>,
    task?: SyncTask<T>
  ): T | ExecutorError {
    try {
      return this.exec(dataOrTask as unknown, task);
    } catch (error) {
      return error as ExecutorError;
    }
  }

  exec<T, D = unknown>(
    dataOrTask: D | SyncTask<T, D>,
    task?: SyncTask<T, D>
  ): T {
    // Check if data is provided
    const actualTask = (task || dataOrTask) as SyncTask<T, D>;
    const data = task ? dataOrTask : undefined;

    try {
      if (typeof actualTask !== 'function') {
        throw new Error('Task must be a function!');
      }

      const beforeResult = this.beforeChain(data);

      const result = actualTask(beforeResult as D);
      return this.successChain<T, T>(result);
    } catch (error) {
      throw this.errorChain(error as Error, data);
    }
  }

  protected beforeChain(data?: unknown): void {
    for (const plugin of this.plugins) {
      plugin.onBefore?.(data);
    }
  }

  protected successChain<T, R>(result: T): R {
    let modifiedResult: unknown = result;
    for (const plugin of this.plugins) {
      const pluginResult = plugin.onSuccess?.(modifiedResult as T);

      // early return
      if (pluginResult !== undefined) {
        return (modifiedResult = pluginResult) as R;
      }
    }
    return modifiedResult as R;
  }

  protected errorChain(error: Error, data?: unknown): ExecutorError {
    for (const plugin of this.plugins) {
      const handledError = plugin.onError?.(error, data);
      if (handledError) return handledError;
    }
    return new ExecutorError(
      'Unhandled sync error',
      'UNKNOWN_SYNC_ERROR',
      error
    );
  }
}
