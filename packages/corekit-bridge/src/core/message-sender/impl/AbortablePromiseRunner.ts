import { AbortError } from '@qlover/fe-corekit';

export class AbortablePromiseRunner {
  /**
   * 最简单的安全实现
   */
  public static raceWithAbort<T>(
    promise: Promise<T>,
    signal?: AbortSignal
  ): Promise<T> {
    if (!signal) {
      return promise;
    }

    // 如果已经中止，直接返回拒绝的Promise
    if (signal.aborted) {
      return Promise.reject<T>(
        signal.reason || new AbortError('The operation was aborted')
      );
    }

    return new Promise<T>((resolve, reject) => {
      // 标记是否已完成
      let completed = false;

      // 定义清理函数
      const cleanup = () => {
        if (!completed) {
          completed = true;
          signal.removeEventListener('abort', onAbort);
        }
      };

      // 中止处理函数
      const onAbort = () => {
        reject(signal.reason || new AbortError('The operation was aborted'));
        cleanup();
      };

      // 添加中止监听
      signal.addEventListener('abort', onAbort);

      // 处理原Promise
      promise.then(
        (result) => {
          if (!completed) {
            resolve(result);
            cleanup();
          }
        },
        (error) => {
          if (!completed) {
            reject(error);
            cleanup();
          }
        }
      );
    });
  }
}
