/**
 * @file Aborter test suite
 *
 * Tests for Aborter class functionality including:
 * - Basic registration and cleanup
 * - Timeout mechanisms
 * - External signal composition
 * - Security fixes:
 *   - Race condition prevention (already aborted signals)
 *   - Memory leak prevention (ID caching)
 *   - Callback error handling
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Aborter } from '../../src/aborter/Aborter';
import { AbortError } from '../../src/aborter/AbortError';
import type { AborterConfig } from '../../src/aborter/AborterInterface';

describe('Aborter', () => {
  let aborter: Aborter<AborterConfig>;
  let originalAbortSignalTimeout: typeof AbortSignal.timeout | undefined;

  beforeEach(() => {
    // Use fake timers to speed up timeout tests
    vi.useFakeTimers();

    // Temporarily disable native AbortSignal.timeout to use fake timers
    originalAbortSignalTimeout = AbortSignal.timeout;
    // @ts-ignore - Temporarily override for testing
    AbortSignal.timeout = undefined;

    aborter = new Aborter('TestAborter');
  });

  afterEach(() => {
    // Cleanup all operations
    aborter.abortAll();

    // Restore native AbortSignal.timeout
    if (originalAbortSignalTimeout) {
      // @ts-ignore
      AbortSignal.timeout = originalAbortSignalTimeout;
    }

    // Restore real timers
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should register operation and return signal', () => {
      const { abortId, signal } = aborter.register({});

      expect(abortId).toBeDefined();
      expect(abortId).toContain('TestAborter');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should generate unique IDs for each operation', () => {
      const { abortId: id1 } = aborter.register({});
      const { abortId: id2 } = aborter.register({});
      const { abortId: id3 } = aborter.register({});

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should use provided abortId', () => {
      const { abortId } = aborter.register({ abortId: 'custom-id' });

      expect(abortId).toBe('custom-id');
    });

    it('should throw error if same ID is already registered', () => {
      aborter.register({ abortId: 'duplicate-id' });

      expect(() => {
        aborter.register({ abortId: 'duplicate-id' });
      }).toThrow('Operation with ID "duplicate-id" is already registered');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup operation by ID', () => {
      const { abortId } = aborter.register({});

      const result = aborter.cleanup(abortId);

      expect(result).toBe(true);
    });

    it('should cleanup operation by config', () => {
      const config = { abortId: 'test-cleanup' };
      aborter.register(config);

      const result = aborter.cleanup(config);

      expect(result).toBe(true);
    });

    it('should return false if operation not found', () => {
      const result = aborter.cleanup('non-existent-id');

      expect(result).toBe(false);
    });

    it('should allow re-registration after cleanup', () => {
      const config = { abortId: 'reusable-id' };

      aborter.register(config);
      aborter.cleanup(config);

      // Should not throw
      expect(() => {
        aborter.register(config);
      }).not.toThrow();
    });
  });

  describe('Abort operations', () => {
    it('should abort operation by ID', () => {
      const { abortId, signal } = aborter.register({});

      const result = aborter.abort(abortId);

      expect(result).toBe(true);
      expect(signal.aborted).toBe(true);
    });

    it('should abort operation by config', () => {
      const config = { abortId: 'test-abort' };
      const { signal } = aborter.register(config);

      const result = aborter.abort(config);

      expect(result).toBe(true);
      expect(signal.aborted).toBe(true);
    });

    it('should return false if operation not found', () => {
      const result = aborter.abort('non-existent-id');

      expect(result).toBe(false);
    });

    it('should abort with AbortError', () => {
      const { signal } = aborter.register({ abortId: 'test-error' });

      aborter.abort('test-error');

      expect(signal.aborted).toBe(true);
      expect(signal.reason).toBeInstanceOf(AbortError);
      expect(signal.reason.message).toBe('The operation was aborted');
    });

    it('should invoke onAborted callback', () => {
      const onAborted = vi.fn();
      const config = { abortId: 'test-callback', onAborted };

      aborter.register(config);
      aborter.abort(config);

      expect(onAborted).toHaveBeenCalledTimes(1);
      expect(onAborted).toHaveBeenCalledWith(
        expect.objectContaining({
          abortId: 'test-callback',
          onAborted: undefined, // Sanitized
          onAbortedTimeout: undefined
        })
      );
    });
  });

  describe('Abort all operations', () => {
    it('should abort all registered operations', () => {
      const { signal: signal1 } = aborter.register({});
      const { signal: signal2 } = aborter.register({});
      const { signal: signal3 } = aborter.register({});

      aborter.abortAll();

      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(true);
    });

    it('should cleanup all operations after abort', () => {
      aborter.register({});
      aborter.register({});

      aborter.abortAll();

      // Should be able to register with same auto-generated pattern
      expect(() => {
        aborter.register({});
      }).not.toThrow();
    });
  });

  describe('Timeout mechanism', () => {
    it('should abort operation after timeout', async () => {
      const onAbortedTimeout = vi.fn();
      const { signal } = aborter.register({
        abortTimeout: 5000,
        onAbortedTimeout
      });

      expect(signal.aborted).toBe(false);

      // Fast-forward time and wait for abort event
      const abortPromise = new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });

      // Advance timers to trigger timeout
      await vi.advanceTimersByTimeAsync(5000);
      await abortPromise;

      expect(signal.aborted).toBe(true);
      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);
    });

    it('should not timeout if operation completes first', async () => {
      const onAbortedTimeout = vi.fn();
      const { abortId } = aborter.register({
        abortTimeout: 10000,
        onAbortedTimeout
      });

      // Cleanup before timeout
      aborter.cleanup(abortId);

      // Advance time past timeout
      await vi.advanceTimersByTimeAsync(15000);

      expect(onAbortedTimeout).not.toHaveBeenCalled();
    });

    it('should distinguish between timeout and manual abort', async () => {
      const onAborted = vi.fn();
      const onAbortedTimeout = vi.fn();

      // Manual abort
      const config1 = { abortId: 'manual', onAborted };
      aborter.register(config1);
      aborter.abort(config1);

      expect(onAborted).toHaveBeenCalledTimes(1);
      expect(onAbortedTimeout).not.toHaveBeenCalled();

      // Timeout abort
      const config2 = {
        abortId: 'timeout',
        abortTimeout: 5000,
        onAbortedTimeout
      };
      const { signal } = aborter.register(config2);

      // Fast-forward time and wait for abort event
      const abortPromise = new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });

      await vi.advanceTimersByTimeAsync(5000);
      await abortPromise;

      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('External signal composition', () => {
    it('should compose with external signal', () => {
      const externalController = new AbortController();
      const { signal } = aborter.register({
        signal: externalController.signal
      });

      externalController.abort();

      expect(signal.aborted).toBe(true);
    });

    it('should abort when any signal aborts', async () => {
      const externalController = new AbortController();
      const { signal, abortId } = aborter.register({
        signal: externalController.signal,
        abortTimeout: 10000
      });

      // Abort via external signal
      externalController.abort();

      // Flush microtasks to allow cleanup to trigger
      await vi.runAllTimersAsync();

      expect(signal.aborted).toBe(true);

      // Should already be cleaned up by abort listener
      expect(aborter.cleanup(abortId)).toBe(false);
    });

    it('should abort when timeout expires with external signal', async () => {
      const externalController = new AbortController();
      const onAbortedTimeout = vi.fn();

      const { signal } = aborter.register({
        signal: externalController.signal,
        abortTimeout: 5000,
        onAbortedTimeout
      });

      // Fast-forward time and wait for abort event
      const abortPromise = new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });

      await vi.advanceTimersByTimeAsync(5000);
      await abortPromise;

      expect(signal.aborted).toBe(true);
      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Security Fix 1: Race condition with already aborted signal', () => {
    it('should handle already aborted external signal without registration', () => {
      const externalController = new AbortController();
      externalController.abort(new Error('Already aborted'));

      const { signal, abortId } = aborter.register({
        signal: externalController.signal
      });

      // Signal should be aborted immediately
      expect(signal.aborted).toBe(true);
      expect(signal.reason).toBeInstanceOf(Error);
      expect((signal.reason as Error).message).toBe('Already aborted');

      // Cleanup should return false because operation was never registered
      expect(aborter.cleanup(abortId)).toBe(false);
    });

    it('should preserve abort reason from external signal', () => {
      const externalController = new AbortController();
      const customReason = new Error('Custom abort reason');
      externalController.abort(customReason);

      const { signal } = aborter.register({
        signal: externalController.signal
      });

      expect(signal.aborted).toBe(true);
      expect(signal.reason).toBe(customReason);
    });

    it('should not invoke callbacks for already aborted signal', () => {
      const onAborted = vi.fn();
      const onAbortedTimeout = vi.fn();

      const externalController = new AbortController();
      externalController.abort();

      aborter.register({
        signal: externalController.signal,
        onAborted,
        onAbortedTimeout
      });

      // Callbacks should not be invoked because operation was never registered
      expect(onAborted).not.toHaveBeenCalled();
      expect(onAbortedTimeout).not.toHaveBeenCalled();
    });
  });

  describe('Security Fix 2: Memory leak prevention with ID caching', () => {
    it('should cleanup correctly when using auto-generated IDs', async () => {
      const { signal, abortId } = aborter.register({
        abortTimeout: 5000
      });

      // Fast-forward time and wait for abort event
      const abortPromise = new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });

      await vi.advanceTimersByTimeAsync(5000);
      await abortPromise;

      expect(signal.aborted).toBe(true);

      // Cleanup should have been called automatically
      // Try to cleanup again - should return false
      expect(aborter.cleanup(abortId)).toBe(false);
    });

    it('should not leak memory when timeout triggers', async () => {
      const operations = [];

      // Register multiple operations with timeout
      for (let i = 0; i < 10; i++) {
        operations.push(
          aborter.register({
            abortTimeout: 5000
          })
        );
      }

      // Wait for all abort events
      const abortPromises = Promise.all(
        operations.map(
          ({ signal }) =>
            new Promise<void>((resolve) => {
              signal.addEventListener('abort', () => resolve(), { once: true });
            })
        )
      );

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(5000);
      await abortPromises;

      // All should be aborted
      operations.forEach(({ signal }) => {
        expect(signal.aborted).toBe(true);
      });

      // All should be cleaned up (return false on second cleanup)
      operations.forEach(({ abortId }) => {
        expect(aborter.cleanup(abortId)).toBe(false);
      });
    });

    it('should cleanup event listeners when external signal aborts', async () => {
      const externalController = new AbortController();
      const { signal, abortId } = aborter.register({
        signal: externalController.signal,
        abortTimeout: 10000 // Long timeout
      });

      // Abort via external signal
      externalController.abort();

      // Flush microtasks
      await vi.runAllTimersAsync();

      expect(signal.aborted).toBe(true);

      // Should be cleaned up
      expect(aborter.cleanup(abortId)).toBe(false);
    });
  });

  describe('Security Fix 3: Callback error handling', () => {
    it('should catch and handle callback errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const onAborted = vi.fn(() => {
        throw new Error('Callback error');
      });

      const config = { abortId: 'error-test', onAborted };
      aborter.register(config);

      // Should not throw
      expect(() => {
        aborter.abort(config);
      }).not.toThrow();

      // Error should be logged in development
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TestAborter] Error in onAborted callback:'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should silently ignore callback errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const onAborted = vi.fn(() => {
        throw new Error('Callback error');
      });

      const config = { abortId: 'error-test', onAborted };
      aborter.register(config);

      // Should not throw
      expect(() => {
        aborter.abort(config);
      }).not.toThrow();

      // Error should NOT be logged in production
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle timeout callback errors', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const onAbortedTimeout = vi.fn(() => {
        throw new Error('Timeout callback error');
      });

      const { signal } = aborter.register({
        abortTimeout: 5000,
        onAbortedTimeout
      });

      // Fast-forward time and wait for abort event
      const abortPromise = new Promise<void>((resolve) => {
        signal.addEventListener('abort', () => resolve(), { once: true });
      });

      await vi.advanceTimersByTimeAsync(5000);
      await abortPromise;

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[TestAborter] Error in onAbortedTimeout callback:'
        ),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should continue abort flow even if callback throws', () => {
      const onAborted = vi.fn(() => {
        throw new Error('Callback error');
      });

      const { signal } = aborter.register({
        abortId: 'continue-test',
        onAborted
      });

      aborter.abort('continue-test');

      // Abort should still complete
      expect(signal.aborted).toBe(true);
      expect(onAborted).toHaveBeenCalled();
    });
  });

  describe('Auto cleanup', () => {
    it('should auto cleanup on successful completion', async () => {
      const result = await aborter.autoCleanup(async ({ signal }) => {
        expect(signal.aborted).toBe(false);
        return 'success';
      }, {});

      expect(result).toBe('success');
    });

    it('should cleanup even if operation throws', async () => {
      try {
        await aborter.autoCleanup(
          async () => {
            throw new Error('Operation failed');
          },
          { abortId: 'error-test' }
        );
      } catch (error) {
        expect((error as Error).message).toBe('Operation failed');
      }

      // Should be cleaned up even after error
      expect(aborter.cleanup('error-test')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero timeout', () => {
      const { signal } = aborter.register({
        abortTimeout: 0
      });

      // Zero timeout should be treated as no timeout
      expect(signal.aborted).toBe(false);
    });

    it('should handle negative timeout', () => {
      const { signal } = aborter.register({
        abortTimeout: -1
      });

      // Negative timeout should be treated as no timeout
      expect(signal.aborted).toBe(false);
    });

    it('should handle multiple cleanup calls', () => {
      const { abortId } = aborter.register({});

      expect(aborter.cleanup(abortId)).toBe(true);
      expect(aborter.cleanup(abortId)).toBe(false);
      expect(aborter.cleanup(abortId)).toBe(false);
    });

    it('should handle multiple abort calls', () => {
      const onAborted = vi.fn();
      const { abortId } = aborter.register({ onAborted });

      expect(aborter.abort(abortId)).toBe(true);
      expect(aborter.abort(abortId)).toBe(false);
      expect(aborter.abort(abortId)).toBe(false);

      // Callback should only be called once
      expect(onAborted).toHaveBeenCalledTimes(1);
    });
  });
});
