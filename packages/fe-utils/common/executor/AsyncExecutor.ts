import {
  Executor,
  ExecutorError,
  ExecutorPlugin,
  PromiseTask
} from './Executor';

/**
 * async executor
 */
export class AsyncExecutor extends Executor {
  async runHook(
    plugins: ExecutorPlugin[],
    name: keyof ExecutorPlugin,
    ...args: unknown[]
  ): Promise<void | unknown> {
    // if args is not empty, use args[0] as result
    let result: unknown = args?.[0];
    for (const plugin of plugins) {
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

    return this.run(data, actualTask);
  }

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

      throw new ExecutorError(
        'UNKNOWN_ASYNC_ERROR',
        'Unhandled async error',
        handledError as Error
      );
    }
  }
}
