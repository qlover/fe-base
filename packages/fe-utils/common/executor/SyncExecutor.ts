import { Executor, SyncTask, ExecutorError, ExecutorPlugin } from './Executor';

/**
 * sync executor
 */
export class SyncExecutor extends Executor {
  runHook(
    plugins: ExecutorPlugin[],
    name: keyof ExecutorPlugin,
    ...args: unknown[]
  ): void | unknown {
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
      const pluginResult = plugin[name]?.(...args);

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

      const beforeResult = this.runHook(this.plugins, 'onBefore', data);

      const result = actualTask(beforeResult as D);
      return this.runHook(this.plugins, 'onSuccess', result) as T;
    } catch (error) {
      const handledError = this.runHook(
        this.plugins,
        'onError',
        error as Error,
        data
      );

      if (handledError instanceof ExecutorError) {
        throw handledError;
      }

      throw new ExecutorError('UNKNOWN_SYNC_ERROR', handledError as Error);
    }
  }
}
