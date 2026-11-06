import { ExecutorError } from '@qlover/fe-corekit';

/**
 * 剥开 LifecycleExecutor 包的 {@link ExecutorError}，露出业务错误。
 */
export function unwrapExecutorError(error: unknown): unknown {
  let current: unknown = error;
  while (current instanceof ExecutorError && current.cause !== undefined) {
    current = current.cause;
  }
  return current;
}
