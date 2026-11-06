import type {
  ExecutorContextInterface,
  ExecutorTask,
  LifecyclePluginInterface
} from '@qlover/fe-corekit';
import { LlmError } from '../errors/LlmError';
import type { LlmExecutorParamsType } from './LlmExecutorParams';
import { unwrapExecutorError } from './unwrapExecutorError';

export type LlmRetryPluginOptionsType = {
  /** 含首次在内的最大尝试次数。默认 3。 */
  readonly maxRetries?: number;
  /** 固定间隔毫秒。默认 1000。 */
  readonly retryDelayMs?: number;
  readonly shouldRetry?: (error: unknown) => boolean;
};

/**
 * 默认：对 429/502/503/504 与非 Abort 网络错重试；用户中止不重试。
 */
export function defaultLlmShouldRetry(error: unknown): boolean {
  const raw = unwrapExecutorError(error);
  if (raw instanceof Error && raw.name === 'AbortError') {
    return false;
  }
  if (raw instanceof LlmError) {
    const status = raw.status;
    return (
      status === 429 || status === 502 || status === 503 || status === 504
    );
  }
  return true;
}

/**
 * Lifecycle 重试插件：在 `onExec` 包装任务（须 `await` 任务，才能捕到 Promise 拒绝）。
 *
 * 对流式任务请设 `enableRetry: false`，或不要对本任务挂本插件。
 */
export class LlmRetryPlugin
  implements
    LifecyclePluginInterface<
      ExecutorContextInterface<LlmExecutorParamsType, unknown>
    >
{
  public readonly pluginName = 'LlmRetryPlugin';
  public readonly onlyOne = true;

  protected readonly maxRetries: number;
  protected readonly retryDelayMs: number;
  protected readonly shouldRetry: (error: unknown) => boolean;

  constructor(options: LlmRetryPluginOptionsType = {}) {
    this.maxRetries = Math.max(1, options.maxRetries ?? 3);
    this.retryDelayMs = Math.max(0, options.retryDelayMs ?? 1000);
    this.shouldRetry = options.shouldRetry ?? defaultLlmShouldRetry;
  }

  public onExec<R, P extends LlmExecutorParamsType = LlmExecutorParamsType>(
    _context: ExecutorContextInterface<P, R>,
    task: ExecutorTask<R, P>
  ): ExecutorTask<R, P> {
    return async (ctx: ExecutorContextInterface<P, R>): Promise<R> => {
      if (ctx.parameters?.enableRetry === false) {
        return await Promise.resolve(task(ctx));
      }

      let attempt = 0;
      let lastError: unknown;
      while (attempt < this.maxRetries) {
        attempt += 1;
        try {
          return await Promise.resolve(task(ctx));
        } catch (error: unknown) {
          lastError = error;
          const canRetry =
            attempt < this.maxRetries && this.shouldRetry(error);
          if (!canRetry) {
            throw error;
          }
          if (this.retryDelayMs > 0) {
            await new Promise<void>((resolve) => {
              setTimeout(resolve, this.retryDelayMs);
            });
          }
        }
      }
      throw lastError;
    };
  }
}
