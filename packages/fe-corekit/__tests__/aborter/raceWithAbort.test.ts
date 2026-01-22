/**
 * @file raceWithAbort utility tests
 *
 * Tests for raceWithAbort and createAbortPromise utilities including:
 * - Promise racing with abort signals
 * - Cleanup and memory leak prevention
 * - Edge cases and error handling
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  raceWithAbort,
  createAbortPromise
} from '../../src/aborter/utils/raceWithAbort';

describe('raceWithAbort', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should return original promise when no signal provided', async () => {
      const result = await raceWithAbort(Promise.resolve('success'));
      expect(result).toBe('success');
    });

    it('should resolve with promise result when not aborted', async () => {
      const controller = new AbortController();
      const promise = Promise.resolve('test-result');

      const result = await raceWithAbort(promise, controller.signal);

      expect(result).toBe('test-result');
    });

    it('should reject with promise error when promise fails', async () => {
      const controller = new AbortController();
      const error = new Error('Promise failed');
      const promise = Promise.reject(error);

      await expect(raceWithAbort(promise, controller.signal)).rejects.toThrow(
        'Promise failed'
      );
    });

    it('should throw immediately if signal is already aborted', () => {
      const controller = new AbortController();
      controller.abort();

      const promise = Promise.resolve('should not reach');

      expect(() => {
        raceWithAbort(promise, controller.signal);
      }).toThrow('aborted');
    });
  });

  describe('Abort during operation', () => {
    it('should reject with AbortError when aborted before promise resolves', async () => {
      const controller = new AbortController();

      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('delayed result'), 1000);
      });

      const racePromise = raceWithAbort(promise, controller.signal);

      // Advance time and abort
      await vi.advanceTimersByTimeAsync(0);
      controller.abort();

      await expect(racePromise).rejects.toThrow('aborted');
    });

    it('should use custom abort reason when provided', async () => {
      const controller = new AbortController();
      const customReason = new Error('Custom abort reason');

      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('delayed result'), 1000);
      });

      const racePromise = raceWithAbort(promise, controller.signal);

      await vi.advanceTimersByTimeAsync(0);
      controller.abort(customReason);

      await expect(racePromise).rejects.toThrow('Custom abort reason');
    });

    it('should resolve with promise result if promise completes before abort', async () => {
      const controller = new AbortController();

      const promise = Promise.resolve('fast result');

      const result = await raceWithAbort(promise, controller.signal);

      expect(result).toBe('fast result');

      // Abort after promise resolved (should have no effect)
      controller.abort();
    });
  });

  describe('Cleanup and memory leaks', () => {
    it('should cleanup event listeners after promise resolves', async () => {
      const controller = new AbortController();
      const removeEventListenerSpy = vi.spyOn(
        controller.signal,
        'removeEventListener'
      );

      const promise = Promise.resolve('result');

      await raceWithAbort(promise, controller.signal);

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'abort',
        expect.any(Function)
      );
    });

    it('should cleanup event listeners after promise rejects', async () => {
      const controller = new AbortController();
      const removeEventListenerSpy = vi.spyOn(
        controller.signal,
        'removeEventListener'
      );

      const promise = Promise.reject(new Error('error'));

      await expect(raceWithAbort(promise, controller.signal)).rejects.toThrow();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'abort',
        expect.any(Function)
      );
    });

    it('should cleanup event listeners after abort', async () => {
      const controller = new AbortController();
      const removeEventListenerSpy = vi.spyOn(
        controller.signal,
        'removeEventListener'
      );

      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('delayed'), 1000);
      });

      const racePromise = raceWithAbort(promise, controller.signal);

      await vi.advanceTimersByTimeAsync(0);
      controller.abort();

      await expect(racePromise).rejects.toThrow();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'abort',
        expect.any(Function)
      );
    });
  });

  describe('Multiple operations', () => {
    it('should handle multiple promises with same signal', async () => {
      const controller = new AbortController();

      const promise1 = new Promise((resolve) => {
        setTimeout(() => resolve('result1'), 100);
      });
      const promise2 = new Promise((resolve) => {
        setTimeout(() => resolve('result2'), 200);
      });

      const race1 = raceWithAbort(promise1, controller.signal);
      const race2 = raceWithAbort(promise2, controller.signal);

      await vi.advanceTimersByTimeAsync(0);
      controller.abort();

      await expect(race1).rejects.toThrow('aborted');
      await expect(race2).rejects.toThrow('aborted');
    });

    it('should handle multiple promises with different signals', async () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const promise1 = new Promise((resolve) => {
        setTimeout(() => resolve('result1'), 100);
      });
      const promise2 = new Promise((resolve) => {
        setTimeout(() => resolve('result2'), 200);
      });

      const race1 = raceWithAbort(promise1, controller1.signal);
      const race2 = raceWithAbort(promise2, controller2.signal);

      await vi.advanceTimersByTimeAsync(0);
      controller1.abort();

      await expect(race1).rejects.toThrow('aborted');

      // race2 should still be pending
      controller2.abort();
      await expect(race2).rejects.toThrow('aborted');
    });
  });
});

describe('createAbortPromise', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should create a promise that rejects on abort', async () => {
      const controller = new AbortController();
      const { promise } = createAbortPromise(controller.signal);

      const promiseResult = promise.catch((error) => error);

      await vi.advanceTimersByTimeAsync(0);
      controller.abort();

      const error = await promiseResult;
      expect(error.message).toContain('aborted');
    });

    it('should reject immediately if signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      const { promise } = createAbortPromise(controller.signal);

      await expect(promise).rejects.toThrow('aborted');
    });

    it('should use custom abort reason when provided', async () => {
      const controller = new AbortController();
      const customReason = new Error('Custom reason');

      const { promise } = createAbortPromise(controller.signal);

      const promiseResult = promise.catch((error) => error);

      await vi.advanceTimersByTimeAsync(0);
      controller.abort(customReason);

      const error = await promiseResult;
      expect(error).toBe(customReason);
    });
  });

  describe('Cleanup functionality', () => {
    it('should provide cleanup function', () => {
      const controller = new AbortController();
      const { cleanup } = createAbortPromise(controller.signal);

      expect(cleanup).toBeInstanceOf(Function);
    });

    it('should remove event listener when cleanup is called', () => {
      const controller = new AbortController();
      const removeEventListenerSpy = vi.spyOn(
        controller.signal,
        'removeEventListener'
      );

      const { cleanup } = createAbortPromise(controller.signal);
      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'abort',
        expect.any(Function)
      );
    });

    it('should not throw when cleanup is called multiple times', () => {
      const controller = new AbortController();
      const { cleanup } = createAbortPromise(controller.signal);

      expect(() => {
        cleanup();
        cleanup();
        cleanup();
      }).not.toThrow();
    });

    it('should not reject promise after cleanup is called and signal is aborted', async () => {
      const controller = new AbortController();
      const { promise, cleanup } = createAbortPromise(controller.signal);

      // Cleanup before abort
      cleanup();

      // Abort should not affect the promise anymore
      controller.abort();

      // Give time for any potential async operations
      await vi.advanceTimersByTimeAsync(100);

      // Promise should still be pending (never resolves or rejects)
      let promiseSettled = false;
      promise.then(
        () => {
          promiseSettled = true;
        },
        () => {
          promiseSettled = true;
        }
      );

      await vi.advanceTimersByTimeAsync(100);
      expect(promiseSettled).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle abort with no reason', async () => {
      const controller = new AbortController();
      const { promise } = createAbortPromise(controller.signal);

      const promiseResult = promise.catch((error) => error);

      await vi.advanceTimersByTimeAsync(0);
      controller.abort(); // No reason provided

      const error = await promiseResult;
      expect(error.message).toContain('aborted');
    });

    it('should handle multiple abort calls', async () => {
      const controller = new AbortController();
      const { promise } = createAbortPromise(controller.signal);

      const promiseResult = promise.catch((error) => error);

      await vi.advanceTimersByTimeAsync(0);
      controller.abort();
      controller.abort(); // Second abort should have no effect

      const error = await promiseResult;
      expect(error.message).toContain('aborted');
    });
  });
});
