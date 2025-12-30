import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RetryManager } from '../../src/managers';

describe('RetryManager', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    // Use real timers but with very short delays to speed up tests
    retryManager = new RetryManager({
      maxRetries: 3,
      retryDelay: 1, // Use very short delay for tests (1ms)
      useExponentialBackoff: false
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create manager with default options', () => {
      const manager = new RetryManager();
      expect(manager).toBeInstanceOf(RetryManager);
    });

    it('should create manager with custom options', () => {
      const manager = new RetryManager({
        maxRetries: 5,
        retryDelay: 2000,
        useExponentialBackoff: true
      });
      expect(manager).toBeInstanceOf(RetryManager);
    });
  });

  describe('basic functionality', () => {
    it('should have makeRetriable method', () => {
      expect(typeof retryManager.makeRetriable).toBe('function');
    });

    it('should have retry method', () => {
      expect(typeof retryManager.retry).toBe('function');
    });

    it('should makeRetriable return a function', () => {
      const retriableFn = retryManager.makeRetriable(
        () => 'test' as unknown as Promise<unknown>
      );
      expect(typeof retriableFn).toBe('function');
    });
  });

  describe('simple retry scenarios', () => {
    it('should execute function that succeeds immediately', async () => {
      const result = await retryManager.retry(() => 'success');
      expect(result).toBe('success');
    });

    it('should handle function that returns a promise', async () => {
      const result = await retryManager.retry(() =>
        Promise.resolve('async success')
      );
      expect(result).toBe('async success');
    });

  });

  describe('retry logic', () => {
    it('should retry on failure and succeed', async () => {
      let attempts = 0;
      const result = await retryManager.retry(() => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should support custom retry configurations', async () => {
      const customManager = new RetryManager({
        maxRetries: 10,
        retryDelay: 1,
        useExponentialBackoff: true
      });

      expect(customManager).toBeInstanceOf(RetryManager);
    });
  });
});
