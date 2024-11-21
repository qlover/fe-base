import { ExecutorError, ExecutorPlugin } from './Executor';

export interface RetryOptions {
  /** 最大重试次数 */
  maxRetries?: number;
  /** 重试延迟时间(ms) */
  retryDelay?: number;
  /** 是否使用指数退避策略 */
  useExponentialBackoff?: boolean;
  /** 判断错误是否需要重试的函数 */
  shouldRetry?: (error: Error) => boolean;
}

export class RetryPlugin implements ExecutorPlugin {
  private retryCount = 0;
  private readonly options: Required<RetryOptions>;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      useExponentialBackoff: true,
      shouldRetry: (): boolean => true,
      ...options
    };
  }

  private async delay(attempt: number): Promise<void> {
    const delayTime = this.options.useExponentialBackoff
      ? this.options.retryDelay * Math.pow(2, attempt)
      : this.options.retryDelay;

    return new Promise((resolve) => setTimeout(resolve, delayTime));
  }

  async onError(error: Error, context: unknown): Promise<ExecutorError | void> {
    if (
      this.retryCount < this.options.maxRetries &&
      this.options.shouldRetry(error)
    ) {
      this.retryCount++;

      // 等待延迟时间
      await this.delay(this.retryCount - 1);

      // 返回 undefined 表示需要重试
      return;
    }

    // 重置重试计数
    this.retryCount = 0;

    // 返回 error 表示不再重试
    return error as ExecutorError;
  }

  onBefore(): void {
    // 在每次新的执行开始时重置重试计数
    this.retryCount = 0;
  }
}
