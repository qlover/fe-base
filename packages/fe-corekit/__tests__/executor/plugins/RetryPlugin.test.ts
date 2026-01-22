import { LifecycleExecutor } from '../../../src/executor/impl/LifecycleExecutor';
import { RetryPlugin } from '../../../src/executor/plugins/RetryPlugin';
import { Retryer } from '../../../src/executor/utils/Retryer';
import type { ExecutorContextInterface } from '../../../src/executor/interface';
import { vi } from 'vitest';
import { type RetryOptions } from '../../../src/executor/interface/RetryInterface';

const default_retry_delay = 10;
const delayMs = 8;

describe('RetryPlugin', () => {
  describe('Basic retry functionality', () => {
    it('should retry and eventually succeed', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();

      // maxRetries: 3 means 1 initial attempt + 2 retries = 3 total attempts
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: default_retry_delay
      });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      const result = await executor.exec(
        async (_ctx: ExecutorContextInterface<unknown, string>) => {
          if (calls < 2) {
            calls++;
            throw new Error('Test Error');
          }
          return 'success';
        }
      );

      expect(calls).toBe(2);
      expect(result).toBe('success');
    });

    it('should fail after max retries exceeded', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();
      // maxRetries: 2 means 2 total attempts (1 initial + 1 retry)
      const retryer = new Retryer({
        maxRetries: 2,
        retryDelay: default_retry_delay
      });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      await expect(
        executor.exec(
          async (_ctx: ExecutorContextInterface<unknown, string>) => {
            calls++;
            throw new Error('Test Error');
          }
        )
      ).rejects.toThrow('Test Error');

      expect(calls).toBe(2); // 2 total attempts
    });

    it('should retry the default number of times(3)', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();
      // Default maxRetries is 3, meaning 3 total attempts
      const retryer = new Retryer({ retryDelay: default_retry_delay });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      await expect(
        executor.exec(
          async (_ctx: ExecutorContextInterface<unknown, string>) => {
            calls++;
            throw new Error('Test Error');
          }
        )
      ).rejects.toThrow('Test Error');

      expect(calls).toBe(3); // 3 total attempts (default maxRetries)
    });
  });

  describe('Retry delay', () => {
    it('should respect retry delay', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();
      // maxRetries: 2 means 2 total attempts (1 initial + 1 retry)
      const retryer = new Retryer({ maxRetries: 2, retryDelay: delayMs });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      const startTime = Date.now();

      await expect(
        executor.exec(
          async (_ctx: ExecutorContextInterface<unknown, string>) => {
            calls++;
            throw new Error('Test Error');
          }
        )
      ).rejects.toThrow('Test Error');

      const duration = Date.now() - startTime;
      // Allow for timing precision issues by using a more lenient assertion
      // JavaScript setTimeout and Date.now() have millisecond precision limitations
      expect(duration).toBeGreaterThanOrEqual(delayMs - 2);
      expect(calls).toBe(2); // 2 total attempts
    });
  });

  describe('Custom retry conditions', () => {
    it('should only retry when condition is met', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();
      const retryer = new Retryer({
        maxRetries: 2,
        retryDelay: default_retry_delay,
        shouldRetry: (error): boolean => error.error.message === 'Retry This'
      });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      await expect(
        executor.exec(
          async (_ctx: ExecutorContextInterface<unknown, string>) => {
            calls++;
            throw new Error('Do Not Retry');
          }
        )
      ).rejects.toThrow('Do Not Retry');

      expect(calls).toBe(1); // no retry
    });

    it('should retry when condition returns true', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: default_retry_delay,
        shouldRetry: (error): boolean => error.error.message === 'Retryable'
      });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      const result = await executor.exec(
        async (_ctx: ExecutorContextInterface<unknown, string>) => {
          calls++;
          if (calls < 3) {
            throw new Error('Retryable');
          }
          return 'success';
        }
      );

      expect(calls).toBe(3);
      expect(result).toBe('success');
    });
  });

  describe('onFailedAttempt callback', () => {
    it('should call onFailedAttempt callback', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();
      const onFailedAttempt = vi.fn();
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: default_retry_delay,
        onFailedAttempt
      });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      await expect(
        executor.exec(
          async (_ctx: ExecutorContextInterface<unknown, string>) => {
            calls++;
            throw new Error('Test Error');
          }
        )
      ).rejects.toThrow('Test Error');

      // onFailedAttempt should be called for each failed attempt
      expect(onFailedAttempt).toHaveBeenCalled();
      expect(calls).toBe(3);
    });
  });

  describe('Exponential backoff', () => {
    it('should apply exponential backoff delay', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: delayMs,
        useExponentialBackoff: true
      });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      const startTime = Date.now();

      await expect(
        executor.exec(
          async (_ctx: ExecutorContextInterface<unknown, string>) => {
            calls++;
            throw new Error('Test Error');
          }
        )
      ).rejects.toThrow('Test Error');

      const duration = Date.now() - startTime;
      // Exponential backoff: delayMs * (2^0) + delayMs * (2^1) = delayMs + 2*delayMs = 3*delayMs
      // Allow for timing precision issues
      expect(duration).toBeGreaterThanOrEqual(3 * delayMs - 5);
      expect(calls).toBe(3);
    });
  });

  describe('Task with context parameters', () => {
    it('should work with task that uses context parameters', async () => {
      interface TestParams extends RetryOptions {
        value: string;
      }

      const executor = new LifecycleExecutor<
        ExecutorContextInterface<TestParams, string>
      >();

      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: default_retry_delay
      });
      executor.use(new RetryPlugin(retryer));

      let calls = 0;
      const result = await executor.exec(
        { value: 'test' },
        async (ctx: ExecutorContextInterface<TestParams, string>) => {
          if (calls < 2) {
            calls++;
            throw new Error('Test Error');
          }
          return `success: ${ctx.parameters.value}`;
        }
      );

      expect(calls).toBe(2);
      expect(result).toBe('success: test');
    });
  });

  describe('Multiple plugins interaction', () => {
    it('should work with other plugins', async () => {
      const executor = new LifecycleExecutor<
        ExecutorContextInterface<RetryOptions, unknown>
      >();
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: default_retry_delay
      });
      executor.use(new RetryPlugin(retryer));

      const beforeHook = vi.fn();
      const successHook = vi.fn();

      executor.use({
        pluginName: 'test-plugin',
        onBefore: async (_ctx) => {
          beforeHook();
        },
        onSuccess: async () => {
          successHook();
        }
      });

      let calls = 0;
      const result = await executor.exec(
        async (_ctx: ExecutorContextInterface<unknown, string>) => {
          if (calls < 2) {
            calls++;
            throw new Error('Test Error');
          }
          return 'success';
        }
      );

      expect(beforeHook).toHaveBeenCalled();
      expect(successHook).toHaveBeenCalled();
      expect(calls).toBe(2);
      expect(result).toBe('success');
    });
  });
});
