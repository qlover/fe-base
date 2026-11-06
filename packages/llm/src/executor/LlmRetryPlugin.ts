import type {
  ExecutorContextInterface,
  ExecutorTask,
  LifecyclePluginInterface
} from '@qlover/fe-corekit';
import { LlmError } from '../errors/LlmError';
import type { LlmExecutorParamsType } from './LlmExecutorParams';

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
  if (error instanceof Error && error.name === 'AbortError') {
    return false;
  }
  if (error instanceof LlmError) {
    const status = error.status;
    return (
      status === 429 || status === 502 || status === 503 || status === 504
    );
  }
  return true;
}

/**
 * 可选 Lifecycle 重试插件（高级用法）。
 * 默认门面 {@link LlmExecutor} 在类内做 completions 重试；需要自定义 exec 链时可挂此插件。
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
        const result = task(ctx);
        return result instanceof Promise ? result : Promise.resolve(result);
      }

      let attempt = 0;
      let lastError: unknown;
      while (attempt < this.maxRetries) {
        attempt += 1;
        try {
          const result = task(ctx);
          return result instanceof Promise ? result : Promise.resolve(result);
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
