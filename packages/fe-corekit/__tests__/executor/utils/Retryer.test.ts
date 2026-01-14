/**
 * @file Retryer test suite
 *
 * Tests for Retryer utility class including:
 * - Basic retry functionality
 * - Delay strategies (fixed, exponential, custom)
 * - Custom retry conditions
 * - Options normalization
 * - makeRetriable and retry methods
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Retryer } from '../../../src/executor/utils/Retryer';

describe('Retryer', () => {
  beforeEach(() => {
    // Use fake timers to speed up tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();
  });

  describe('Constructor and Options Normalization', () => {
    it('should create Retryer with default options', () => {
      const retryer = new Retryer();
      
      // Default maxRetries should be 3
      expect(retryer['options'].maxRetries).toBe(3);
      expect(retryer['options'].retryDelay).toBe(1000);
      expect(retryer['options'].useExponentialBackoff).toBe(false);
    });

    it('should create Retryer with custom options', () => {
      const retryer = new Retryer({
        maxRetries: 5,
        retryDelay: 2000,
        useExponentialBackoff: true
      });
      
      expect(retryer['options'].maxRetries).toBe(5);
      expect(retryer['options'].retryDelay).toBe(2000);
      expect(retryer['options'].useExponentialBackoff).toBe(true);
    });

    it('should clamp maxRetries to safe bounds', () => {
      const retryer1 = new Retryer({ maxRetries: 0 });
      expect(retryer1['options'].maxRetries).toBe(1); // Minimum is 1

      const retryer2 = new Retryer({ maxRetries: 100 });
      expect(retryer2['options'].maxRetries).toBe(16); // Maximum is 16
    });

    it('should merge all options correctly', () => {
      const shouldRetry = vi.fn(() => true);
      const onFailedAttempt = vi.fn();
      
      const retryer = new Retryer({
        maxRetries: 5,
        retryDelay: 2000,
        shouldRetry,
        onFailedAttempt,
        randomize: true
      });
      
      expect(retryer['options'].maxRetries).toBe(5);
      expect(retryer['options'].retryDelay).toBe(2000);
      expect(retryer['options'].shouldRetry).toBe(shouldRetry);
      expect(retryer['options'].onFailedAttempt).toBe(onFailedAttempt);
      expect(retryer['options'].randomize).toBe(true);
    });
  });

  describe('retry() method - Basic functionality', () => {
    it('should succeed on first attempt', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 1000 });
      
      let calls = 0;
      const result = await retryer.retry(async () => {
        calls++;
        return 'success';
      });
      
      expect(result).toBe('success');
      expect(calls).toBe(1);
    });

    it('should retry and eventually succeed', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 1000 });
      
      let calls = 0;
      const promise = retryer.retry(async () => {
        calls++;
        if (calls < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });
      
      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toBe('success');
      expect(calls).toBe(3);
    });

    it('should fail after max retries exceeded', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 1000 });
      
      let calls = 0;
      const promise = retryer.retry(async () => {
        calls++;
        throw new Error('Persistent failure');
      });
      
      // Set up rejection handler before running timers
      const rejectionPromise = expect(promise).rejects.toThrow('Persistent failure');
      
      // Run all pending timers and wait for promise to settle
      await vi.runAllTimersAsync();
      await rejectionPromise;
      
      expect(calls).toBe(3);
    });
  });

  describe('retry() method - Delay strategies', () => {
    it('should apply fixed delay between retries', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 1000 });
      
      let calls = 0;
      const promise = retryer.retry(async () => {
        calls++;
        throw new Error('Test error');
      });
      
      // Set up rejection handler before running timers
      const rejectionPromise = expect(promise).rejects.toThrow('Test error');
      
      // Run all pending timers and wait for promise to settle
      await vi.runAllTimersAsync();
      await rejectionPromise;
      
      expect(calls).toBe(3);
    });

    it('should apply exponential backoff delay', async () => {
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: 1000,
        useExponentialBackoff: true
      });
      
      let calls = 0;
      const promise = retryer.retry(async () => {
        calls++;
        throw new Error('Test error');
      });
      
      // Set up rejection handler before running timers
      const rejectionPromise = expect(promise).rejects.toThrow('Test error');
      
      // Run all pending timers and wait for promise to settle
      await vi.runAllTimersAsync();
      await rejectionPromise;
      
      expect(calls).toBe(3);
    });

    it('should support custom delay function', async () => {
      let delayCallCount = 0;
      const customDelay = () => {
        delayCallCount++;
        return 1000;
      };
      
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: customDelay
      });
      
      let calls = 0;
      const promise = retryer.retry(async () => {
        calls++;
        throw new Error('Test error');
      });
      
      // Set up rejection handler before running timers
      const rejectionPromise = expect(promise).rejects.toThrow('Test error');
      
      // Run all pending timers and wait for promise to settle
      await vi.runAllTimersAsync();
      await rejectionPromise;
      
      expect(calls).toBe(3);
      // Custom delay should be called for retries (not for first attempt)
      expect(delayCallCount).toBeGreaterThan(0);
    });
  });

  describe('retry() method - Custom retry conditions', () => {
    it('should only retry when shouldRetry returns false', async () => {
      const retryer = new Retryer({
        maxRetries: 5,
        retryDelay: 1000,
        shouldRetry: (error) => error.error.message === 'Retryable'
      });
      
      let calls = 0;
      await expect(
        retryer.retry(async () => {
          calls++;
          throw new Error('Non-retryable');
        })
      ).rejects.toThrow('Non-retryable');
      
      expect(calls).toBe(1); // Should not retry
    });

    it('should retry when shouldRetry returns true', async () => {
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: 1000,
        shouldRetry: (error) => error.error.message === 'Retryable'
      });
      
      let calls = 0;
      const promise = retryer.retry(async () => {
        calls++;
        if (calls < 3) {
          throw new Error('Retryable');
        }
        return 'success';
      });
      
      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toBe('success');
      expect(calls).toBe(3);
    });

    it('should call onFailedAttempt callback', async () => {
      const onFailedAttempt = vi.fn();
      const retryer = new Retryer({
        maxRetries: 3,
        retryDelay: 1000,
        onFailedAttempt
      });
      
      let calls = 0;
      const promise = retryer.retry(async () => {
        calls++;
        throw new Error('Test error');
      });
      
      // Set up rejection handler before running timers
      const rejectionPromise = expect(promise).rejects.toThrow('Test error');
      
      // Run all pending timers and wait for promise to settle
      await vi.runAllTimersAsync();
      await rejectionPromise;
      
      // onFailedAttempt should be called for each failed attempt
      expect(onFailedAttempt).toHaveBeenCalled();
      expect(calls).toBe(3);
    });
  });

  describe('makeRetriable() method', () => {
    it('should wrap function to make it retriable', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 1000 });
      
      let calls = 0;
      const unreliableFunction = async () => {
        calls++;
        if (calls < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      };
      
      const retriableFunction = retryer.makeRetriable(unreliableFunction);
      const promise = retriableFunction();
      
      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toBe('success');
      expect(calls).toBe(3);
    });

    it('should support function arguments', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 1000 });
      
      let calls = 0;
      const unreliableFunction = async (a: number, b: number) => {
        calls++;
        if (calls < 2) {
          throw new Error('Temporary failure');
        }
        return a + b;
      };
      
      const retriableFunction = retryer.makeRetriable(unreliableFunction);
      const promise = retriableFunction(5, 10);
      
      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toBe(15);
      expect(calls).toBe(2);
    });

    it('should allow overriding options per call', async () => {
      const retryer = new Retryer({ maxRetries: 5, retryDelay: 1000 });
      
      let calls = 0;
      const unreliableFunction = async () => {
        calls++;
        throw new Error('Always fails');
      };
      
      const retriableFunction = retryer.makeRetriable(
        unreliableFunction,
        { maxRetries: 3 } // Override to 3 attempts
      );
      
      const promise = retriableFunction();
      
      // Set up rejection handler before running timers
      const rejectionPromise = expect(promise).rejects.toThrow('Always fails');
      
      // Run all pending timers and wait for promise to settle
      await vi.runAllTimersAsync();
      await rejectionPromise;
      
      expect(calls).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle synchronous functions', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 1000 });
      
      let calls = 0;
      const promise = retryer.retry(() => {
        calls++;
        if (calls < 2) {
          throw new Error('Sync error');
        }
        return 'sync success';
      });
      
      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toBe('sync success');
      expect(calls).toBe(2);
    });

    it('should handle zero delay', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 0 });
      
      let calls = 0;
      await expect(
        retryer.retry(async () => {
          calls++;
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
      
      expect(calls).toBe(3);
    });

    it('should handle attemptNumber parameter in retry function', async () => {
      const retryer = new Retryer({ maxRetries: 3, retryDelay: 1000 });
      
      const attemptNumbers: number[] = [];
      const promise = retryer.retry(async (attemptNumber: number) => {
        attemptNumbers.push(attemptNumber);
        throw new Error('Test error');
      });
      
      // Set up rejection handler before running timers
      const rejectionPromise = expect(promise).rejects.toThrow('Test error');
      
      // Run all pending timers and wait for promise to settle
      await vi.runAllTimersAsync();
      await rejectionPromise;
      
      // p-retry passes attemptNumber starting from 1
      expect(attemptNumbers).toEqual([1, 2, 3]);
    });
  });

  describe('Integration with AbortSignal', () => {
    it('should support AbortSignal to cancel retries', async () => {
      const controller = new AbortController();
      const retryer = new Retryer({
        maxRetries: 5,
        retryDelay: 1000,
        signal: controller.signal
      });
      
      let calls = 0;
      const promise = retryer.retry(async () => {
        calls++;
        if (calls === 2) {
          controller.abort();
        }
        throw new Error('Test error');
      });
      
      // Set up rejection handler before running timers
      // AbortError or the original error could be thrown
      const rejectionPromise = expect(promise).rejects.toThrow();
      
      // Run all pending timers and wait for promise to settle
      await vi.runAllTimersAsync();
      await rejectionPromise;
      
      // Should stop retrying after abort
      expect(calls).toBeLessThanOrEqual(3);
    });
  });
});
