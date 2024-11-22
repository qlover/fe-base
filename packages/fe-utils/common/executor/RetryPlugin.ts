import { ExecutorError, ExecutorPlugin, PromiseTask } from './Executor';

export interface RetryOptions {
  /**
   * max retries, from `0` start
   * @default 3
   */
  maxRetries: number;
  /**
   * retry delay (ms)
   * @default 1000
   */
  retryDelay: number;
  /**
   * use exponential backoff
   * @default false
   */
  useExponentialBackoff: boolean;
  /**
   * should retry function
   * @default always retry
   */
  shouldRetry: (error: Error) => boolean;
}

const SAFE_MAX_RETRIES = 16;
const DEFAULT_MAX_RETRIES = 3;
const defaultShouldRetry = (): boolean => true;
export class RetryPlugin implements ExecutorPlugin {
  readonly onlyOne = true;
  private readonly options: Required<RetryOptions>;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = {
      retryDelay: 1000,
      useExponentialBackoff: false,
      shouldRetry: defaultShouldRetry,
      ...options,
      maxRetries: Math.min(
        Math.max(1, options.maxRetries ?? DEFAULT_MAX_RETRIES),
        SAFE_MAX_RETRIES
      )
    };
  }

  private async delay(attempt: number): Promise<void> {
    const delayTime = this.options.useExponentialBackoff
      ? this.options.retryDelay * Math.pow(2, attempt)
      : this.options.retryDelay;

    return new Promise((resolve) => setTimeout(resolve, delayTime));
  }

  async onExec<T>(task: PromiseTask<T>): Promise<T | void> {
    // no retry, just execute
    if (this.options.maxRetries < 1) {
      return task(null);
    }

    return this.retry<T>(task, this.options, this.options.maxRetries);
  }

  private shouldRetry({
    error,
    retryCount
  }: {
    error: unknown;
    retryCount: number;
  }): boolean {
    return (
      // must be greater than 0
      retryCount > 0 &&
      // must satisfy should retry function
      this.options.shouldRetry(error as Error)
    );
  }

  /**
   * retry async function
   * @param {Function} fn - need retry async function
   * @returns {Promise<any>} - return async function result
   */
  async retry<T>(
    fn: PromiseTask<T>,
    options: RetryOptions,
    retryCount: number
  ): Promise<T | undefined> {
    try {
      return await fn(null);
    } catch (error) {
      if (!this.shouldRetry({ error, retryCount })) {
        throw new ExecutorError(
          'RETRY_ERROR',
          `All ${options.maxRetries} attempts failed: ${(error as Error).message}`
        );
      }

      console.info(
        `Attempt ${options.maxRetries - retryCount + 1} failed. Retrying in ${options.retryDelay}ms... (${retryCount} attempts remaining)`
      );

      await this.delay(options.maxRetries - retryCount);

      // decrement retry count
      retryCount--;

      return this.retry(fn, options, retryCount);
    }
  }
}
