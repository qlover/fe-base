type PromiseTask<T> = () => Promise<T>;

// BasePlugin remains the same
export abstract class ExecutorPlugin<T = unknown, R = T> {
  onError?(error: Error): ExecutorError | void;
  onSuccess?(result: T): R | Promise<R>;
}

// Custom Error Class
export class ExecutorError extends Error {
  constructor(
    public message: string,
    public code: string,
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

  // eslint-disable-next-line no-useless-constructor
  constructor(protected config: ExecutorConfig = { throwError: true }) {}

  addPlugin(plugin: ExecutorPlugin): void {
    this.plugins.push(plugin);
  }

  /**
   * execute task and return result
   * @throw {ExecutorError} if task execution fails, throw ExecutorError
   * @param task task
   */
  abstract exec<T>(task: PromiseTask<T> | (() => T)): Promise<T> | T;

  /**
   * execute task and return result without throwing error, wrap all errors as ExecutorError
   * @param task task
   */
  abstract execNoError<T>(
    task: PromiseTask<T> | (() => T)
  ): Promise<T | ExecutorError> | T | ExecutorError;

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
    error: Error
  ): ExecutorError | Promise<ExecutorError>;
}

/**
 * async executor
 */
export class AsyncExecutor extends Executor {
  async execNoError<T>(task: PromiseTask<T>): Promise<T | ExecutorError> {
    try {
      return await this.exec(task);
    } catch (error) {
      return error as ExecutorError;
    }
  }

  async exec<T>(task: PromiseTask<T>): Promise<T> {
    try {
      const result = await task();
      return this.successChain<T, T>(result);
    } catch (error) {
      throw await this.errorChain(error as Error);
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

  protected async errorChain(error: Error): Promise<ExecutorError> {
    for (const plugin of this.plugins) {
      const handledError = await plugin.onError?.(error);
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
  execNoError<T>(task: () => T): T | ExecutorError {
    try {
      return this.exec(task);
    } catch (error) {
      return error as ExecutorError;
    }
  }

  exec<T>(task: () => T): T {
    try {
      const result = task();
      return this.successChain<T, T>(result);
    } catch (error) {
      throw this.errorChain(error as Error);
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

  protected errorChain(error: Error): ExecutorError {
    for (const plugin of this.plugins) {
      const handledError = plugin.onError?.(error);
      if (handledError) return handledError;
    }
    return new ExecutorError(
      'Unhandled sync error',
      'UNKNOWN_SYNC_ERROR',
      error
    );
  }
}
