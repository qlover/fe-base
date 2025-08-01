import { AsyncExecutor, RetryPlugin } from '../../../src';

const default_retry_delay = 10;
const delayMs = 8;

describe('RetryPlugin', () => {
  it('should retry 2 times', async () => {
    const executor = new AsyncExecutor();
    executor.use(
      new RetryPlugin({ maxRetries: 2, retryDelay: default_retry_delay })
    );

    let calls = 0;
    const result = await executor.exec(async () => {
      if (calls < 2) {
        calls++;
        throw new Error('Test Error');
      }
      return 'success';
    });
    expect(calls).toBe(2);
    expect(result).toBe('success');
  });

  it('should fail after max retries exceeded', async () => {
    const executor = new AsyncExecutor();
    executor.use(
      new RetryPlugin({ maxRetries: 2, retryDelay: default_retry_delay })
    );

    let calls = 0;
    await expect(
      executor.exec(async () => {
        calls++;
        throw new Error('Test Error');
      })
    ).rejects.toThrow('Test Error');

    expect(calls).toBe(3); // init call + 2 retries
  });

  it('should respect retry delay', async () => {
    const executor = new AsyncExecutor();
    executor.use(new RetryPlugin({ maxRetries: 1, retryDelay: delayMs }));

    let calls = 0;
    const startTime = Date.now();

    await expect(
      executor.exec(async () => {
        calls++;
        throw new Error('Test Error');
      })
    ).rejects.toThrow('Test Error');

    const duration = Date.now() - startTime;
    // Allow for timing precision issues by using a more lenient assertion
    // JavaScript setTimeout and Date.now() have millisecond precision limitations
    expect(duration).toBeGreaterThanOrEqual(delayMs - 2);
    expect(calls).toBe(2); // init call + 1 retry
  });

  it('should only retry when condition is met', async () => {
    const executor = new AsyncExecutor();
    executor.use(
      new RetryPlugin({
        maxRetries: 2,
        shouldRetry: (error): boolean => error.message === 'Retry This'
      })
    );

    let calls = 0;
    await expect(
      executor.exec(async () => {
        calls++;
        throw new Error('Do Not Retry');
      })
    ).rejects.toThrow('Do Not Retry');

    expect(calls).toBe(1); // no retry
  });

  it('Should retry the default number of times(3)', async () => {
    const executor = new AsyncExecutor();
    executor.use(new RetryPlugin({ retryDelay: default_retry_delay }));

    let calls = 0;
    await expect(
      executor.exec(async () => {
        calls++;
        throw new Error('Do Not Retry');
      })
    ).rejects.toThrow('Do Not Retry');

    expect(calls).toBe(4); // init call + 3 retries
  });
});
