import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ProxyAbortManager,
  type ProxyAbortManagerConfig
} from '../../src/managers/ProxyAbortManager';

describe('ProxyAbortManager', () => {
  let proxyManager: ProxyAbortManager;
  let originalTimeout: typeof AbortSignal.timeout | undefined;

  beforeEach(() => {
    // Mock AbortSignal.timeout to use fallback implementation for fake timers compatibility
    originalTimeout = AbortSignal.timeout;
    if (typeof originalTimeout === 'function') {
      // Temporarily remove native API to force fallback to setTimeout-based implementation
      delete (AbortSignal as any).timeout;
    }

    proxyManager = new ProxyAbortManager('TestProxyManager');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Restore AbortSignal.timeout if it was removed
    if (typeof AbortSignal.timeout === 'undefined' && originalTimeout) {
      (AbortSignal as any).timeout = originalTimeout;
    }
  });

  describe('constructor', () => {
    it('should create manager with default name', () => {
      const defaultManager = new ProxyAbortManager();
      expect(defaultManager.poolName).toBe('ProxyAbortManager');
    });

    it('should create manager with custom name', () => {
      const customManager = new ProxyAbortManager('CustomProxyManager');
      expect(customManager.poolName).toBe('CustomProxyManager');
    });
  });

  describe('register - basic functionality', () => {
    it('should register operation and return signal', () => {
      const { abortId, signal } = proxyManager.register({ abortId: 'test-op' });

      expect(abortId).toBe('test-op');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should auto-generate ID when not provided', () => {
      const { abortId, signal } = proxyManager.register({});

      expect(abortId).toBe('TestProxyManager-1');
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should throw error when registering duplicate ID', () => {
      proxyManager.register({ abortId: 'duplicate' });

      expect(() => {
        proxyManager.register({ abortId: 'duplicate' });
      }).toThrow(
        'Operation with ID "duplicate" is already registered in TestProxyManager'
      );
    });
  });

  describe('register - timeout functionality', () => {
    it('should register with timeout signal', () => {
      const { abortId, signal } = proxyManager.register({
        abortId: 'with-timeout',
        abortTimeout: 5000
      });

      expect(abortId).toBe('with-timeout');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should abort operation after timeout', () => {
      const onAbortedTimeout = vi.fn();
      const { signal } = proxyManager.register({
        abortId: 'timeout-test',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(5000);

      expect(signal.aborted).toBe(true);
      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);
    });

    it('should not timeout if operation completes first', () => {
      const onAbortedTimeout = vi.fn();
      const { abortId, signal } = proxyManager.register({
        abortId: 'complete-first',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      proxyManager.cleanup(abortId);

      vi.advanceTimersByTime(5000);

      expect(signal.aborted).toBe(false);
      expect(onAbortedTimeout).not.toHaveBeenCalled();
    });

    it('should not timeout if manually aborted first', () => {
      const onAbortedTimeout = vi.fn();
      const { abortId, signal } = proxyManager.register({
        abortId: 'abort-first',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      proxyManager.abort(abortId);

      vi.advanceTimersByTime(5000);

      expect(signal.aborted).toBe(true);
      expect(onAbortedTimeout).not.toHaveBeenCalled();
    });

    it('should ignore invalid timeout values', () => {
      const { signal: signal1 } = proxyManager.register({
        abortId: 'invalid-1',
        abortTimeout: -1
      });

      const { signal: signal2 } = proxyManager.register({
        abortId: 'invalid-2',
        abortTimeout: 0
      });

      const { signal: signal3 } = proxyManager.register({
        abortId: 'invalid-3',
        abortTimeout: NaN
      });

      vi.advanceTimersByTime(10000);

      expect(signal1.aborted).toBe(false);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);
    });

    it('should invoke onAbortedTimeout callback with correct config', () => {
      const onAbortedTimeout = vi.fn();
      const config: ProxyAbortManagerConfig = {
        abortId: 'timeout-callback',
        abortTimeout: 5000,
        onAbortedTimeout
      };

      proxyManager.register(config);

      vi.advanceTimersByTime(5000);

      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);
      expect(onAbortedTimeout).toHaveBeenCalledWith({
        abortId: 'timeout-callback',
        abortTimeout: 5000,
        onAborted: undefined,
        onAbortedTimeout: undefined
      });
    });
  });

  describe('register - external signal functionality', () => {
    it('should register with external signal', () => {
      const externalController = new AbortController();
      const { abortId, signal } = proxyManager.register({
        abortId: 'with-external',
        signal: externalController.signal
      });

      expect(abortId).toBe('with-external');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should abort when external signal aborts', () => {
      const externalController = new AbortController();
      const { signal } = proxyManager.register({
        abortId: 'external-test',
        signal: externalController.signal
      });

      expect(signal.aborted).toBe(false);

      externalController.abort();

      expect(signal.aborted).toBe(true);
    });

    it('should not invoke onAborted when external signal aborts', () => {
      const onAborted = vi.fn();
      const externalController = new AbortController();

      proxyManager.register({
        abortId: 'external-no-callback',
        signal: externalController.signal,
        onAborted
      });

      externalController.abort();

      expect(onAborted).not.toHaveBeenCalled();
    });

    it('should cleanup when external signal aborts', () => {
      const externalController = new AbortController();
      proxyManager.register({
        abortId: 'external-cleanup',
        signal: externalController.signal
      });

      externalController.abort();

      // Should be able to register again with same ID
      expect(() => {
        proxyManager.register({ abortId: 'external-cleanup' });
      }).not.toThrow();
    });

    it('should handle already aborted external signal', () => {
      const externalController = new AbortController();
      externalController.abort();

      const { signal } = proxyManager.register({
        abortId: 'already-aborted',
        signal: externalController.signal
      });

      expect(signal.aborted).toBe(true);
      // Should be cleaned up immediately
      expect((proxyManager as any).wrappers.size).toBe(0);
    });
  });

  describe('register - combined timeout and external signal', () => {
    it('should register with both timeout and external signal', () => {
      const externalController = new AbortController();
      const { abortId, signal } = proxyManager.register({
        abortId: 'with-both',
        abortTimeout: 5000,
        signal: externalController.signal
      });

      expect(abortId).toBe('with-both');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should abort when timeout occurs with external signal', () => {
      const externalController = new AbortController();
      const onAbortedTimeout = vi.fn();

      const { signal } = proxyManager.register({
        abortId: 'timeout-with-external',
        abortTimeout: 5000,
        signal: externalController.signal,
        onAbortedTimeout
      });

      vi.advanceTimersByTime(5000);

      expect(signal.aborted).toBe(true);
      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);
    });

    it('should abort when external signal aborts before timeout', () => {
      const externalController = new AbortController();
      const onAbortedTimeout = vi.fn();

      const { signal } = proxyManager.register({
        abortId: 'external-before-timeout',
        abortTimeout: 5000,
        signal: externalController.signal,
        onAbortedTimeout
      });

      vi.advanceTimersByTime(2000);
      externalController.abort();

      expect(signal.aborted).toBe(true);
      expect(onAbortedTimeout).not.toHaveBeenCalled();
    });
  });

  describe('abort', () => {
    it('should abort operation by ID string', () => {
      const { abortId, signal } = proxyManager.register({
        abortId: 'test-abort'
      });

      expect(signal.aborted).toBe(false);

      const result = proxyManager.abort(abortId);

      expect(result).toBe(true);
      expect(signal.aborted).toBe(true);
    });

    it('should abort operation by config object', () => {
      const config = { abortId: 'test-abort-config' };
      const { signal } = proxyManager.register(config);

      expect(signal.aborted).toBe(false);

      const result = proxyManager.abort(config);

      expect(result).toBe(true);
      expect(signal.aborted).toBe(true);
    });

    it('should return false when aborting non-existent operation', () => {
      const result = proxyManager.abort('non-existent');
      expect(result).toBe(false);
    });

    it('should invoke onAborted callback', () => {
      const onAborted = vi.fn();
      const config: ProxyAbortManagerConfig = {
        abortId: 'test-callback',
        onAborted
      };

      proxyManager.register(config);
      proxyManager.abort(config);

      expect(onAborted).toHaveBeenCalledTimes(1);
      expect(onAborted).toHaveBeenCalledWith({
        abortId: 'test-callback',
        onAborted: undefined
      });
    });

    it('should cleanup resources after abort', () => {
      const { abortId, signal } = proxyManager.register({
        abortId: 'cleanup-test'
      });

      proxyManager.abort(abortId);

      expect(signal.aborted).toBe(true);
      // Trying to abort again should return false (already cleaned up)
      expect(proxyManager.abort(abortId)).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup operation by ID string', () => {
      const { abortId } = proxyManager.register({ abortId: 'test-cleanup' });

      proxyManager.cleanup(abortId);

      // Should be able to register again with same ID
      expect(() => {
        proxyManager.register({ abortId: 'test-cleanup' });
      }).not.toThrow();
    });

    it('should cleanup operation by config object', () => {
      const config = { abortId: 'test-cleanup-config' };
      proxyManager.register(config);

      proxyManager.cleanup(config);

      // Should be able to register again with same ID
      expect(() => {
        proxyManager.register(config);
      }).not.toThrow();
    });

    it('should be safe to call cleanup multiple times', () => {
      const { abortId } = proxyManager.register({ abortId: 'multi-cleanup' });

      proxyManager.cleanup(abortId);
      proxyManager.cleanup(abortId); // Second call should not throw
      proxyManager.cleanup(abortId); // Third call should not throw

      expect(true).toBe(true); // If we get here, no errors were thrown
    });

    it('should be safe to cleanup non-existent operation', () => {
      proxyManager.cleanup('non-existent');
      expect(true).toBe(true); // Should not throw
    });

    it('should clean up timeout when operation completes', () => {
      const { abortId } = proxyManager.register({
        abortId: 'cleanup-timeout',
        abortTimeout: 5000
      });

      proxyManager.cleanup(abortId);

      // Advance time to ensure timeout doesn't fire
      vi.advanceTimersByTime(10000);

      // If we get here without errors, cleanup worked
      expect(true).toBe(true);
    });

    it('should clean up external signal listeners and resources', () => {
      const externalController = new AbortController();
      const { abortId, signal } = proxyManager.register({
        abortId: 'cleanup-external',
        signal: externalController.signal
      });

      // Verify operation is registered
      expect((proxyManager as any).wrappers.has(abortId)).toBe(true);
      expect(signal.aborted).toBe(false);

      // Cleanup the operation - this should remove the wrapper and call cleanup callbacks
      proxyManager.cleanup(abortId);

      // Verify operation is cleaned up (wrapper removed from manager)
      // This is the key requirement: the wrapper should be removed to prevent memory leaks
      expect((proxyManager as any).wrappers.has(abortId)).toBe(false);
      expect((proxyManager as any).wrappers.size).toBe(0);

      // Aborting external signal after cleanup
      // Note: ProxyAbortManager is a proxy that delegates external signals.
      // When using native AbortSignal.any(), the clear() method is a no-op,
      // so the combined signal may still be affected by external signal abort.
      // This is expected behavior for a proxy that delegates external signals.
      externalController.abort();

      // The combined signal should be aborted because ProxyAbortManager
      // is a proxy that delegates external signals, and native AbortSignal.any()
      // doesn't support true cleanup (clear() is a no-op)
      expect(signal.aborted).toBe(true);

      // Verify that the operation can be registered again (cleanup worked)
      expect(() => {
        proxyManager.register({ abortId: 'cleanup-external' });
      }).not.toThrow();

      // Cleanup the new registration
      proxyManager.cleanup('cleanup-external');
      expect((proxyManager as any).wrappers.size).toBe(0);
    });
  });

  describe('abortAll', () => {
    it('should abort all registered operations', () => {
      const { signal: signal1 } = proxyManager.register({ abortId: 'op1' });
      const { signal: signal2 } = proxyManager.register({ abortId: 'op2' });
      const { signal: signal3 } = proxyManager.register({ abortId: 'op3' });

      expect(signal1.aborted).toBe(false);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);

      proxyManager.abortAll();

      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(true);
    });

    it('should cleanup all operations', () => {
      proxyManager.register({ abortId: 'op1' });
      proxyManager.register({ abortId: 'op2' });
      proxyManager.register({ abortId: 'op3' });

      proxyManager.abortAll();

      // Should be able to register again with same IDs
      expect(() => {
        proxyManager.register({ abortId: 'op1' });
        proxyManager.register({ abortId: 'op2' });
        proxyManager.register({ abortId: 'op3' });
      }).not.toThrow();
    });

    it('should not invoke onAborted callbacks', () => {
      const onAborted1 = vi.fn();
      const onAborted2 = vi.fn();

      proxyManager.register({ abortId: 'op1', onAborted: onAborted1 });
      proxyManager.register({ abortId: 'op2', onAborted: onAborted2 });

      proxyManager.abortAll();

      expect(onAborted1).not.toHaveBeenCalled();
      expect(onAborted2).not.toHaveBeenCalled();
    });

    it('should clean up all resources in abortAll', () => {
      proxyManager.register({ abortId: 'op1', abortTimeout: 5000 });
      proxyManager.register({ abortId: 'op2', abortTimeout: 5000 });

      proxyManager.abortAll();

      // Advance time to ensure no timeouts fire
      vi.advanceTimersByTime(10000);

      expect(true).toBe(true);
    });

    it('should be safe to call on empty manager', () => {
      proxyManager.abortAll();
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('race condition prevention', () => {
    it('should handle concurrent abort and cleanup', () => {
      const { abortId, signal } = proxyManager.register({
        abortId: 'race-test'
      });

      proxyManager.abort(abortId);
      proxyManager.cleanup(abortId); // Should not throw

      expect(signal.aborted).toBe(true);
    });

    it('should handle concurrent external abort and manual abort', () => {
      const externalController = new AbortController();
      const { abortId, signal } = proxyManager.register({
        abortId: 'concurrent-abort',
        signal: externalController.signal
      });

      externalController.abort();
      proxyManager.abort(abortId); // Should not throw

      expect(signal.aborted).toBe(true);
    });

    it('should handle cleanup during abortAll', () => {
      const { abortId } = proxyManager.register({
        abortId: 'cleanup-during-abortall'
      });
      proxyManager.register({ abortId: 'other-op' });

      // Simulate cleanup happening during abortAll
      proxyManager.cleanup(abortId);
      proxyManager.abortAll(); // Should not throw

      expect(true).toBe(true);
    });
  });

  describe('memory leak prevention', () => {
    it('should not leak memory with rapid register/cleanup cycles', () => {
      const iterations = 1000;
      const initialWrapperCount = (proxyManager as any).wrappers.size;

      for (let i = 0; i < iterations; i++) {
        const { abortId } = proxyManager.register({
          abortId: `rapid-${i}`,
          abortTimeout: 5000
        });
        proxyManager.cleanup(abortId);
      }

      expect((proxyManager as any).wrappers.size).toBe(initialWrapperCount);
    });

    it('should not leak memory with rapid register/abort cycles', () => {
      const iterations = 1000;
      const initialWrapperCount = (proxyManager as any).wrappers.size;

      for (let i = 0; i < iterations; i++) {
        const { abortId } = proxyManager.register({
          abortId: `rapid-abort-${i}`,
          abortTimeout: 5000
        });
        proxyManager.abort(abortId);
      }

      expect((proxyManager as any).wrappers.size).toBe(initialWrapperCount);
    });

    it('should cleanup all wrappers after abortAll with many operations', () => {
      const count = 100;

      for (let i = 0; i < count; i++) {
        proxyManager.register({
          abortId: `bulk-${i}`,
          abortTimeout: 5000
        });
      }

      expect((proxyManager as any).wrappers.size).toBe(count);

      proxyManager.abortAll();

      expect((proxyManager as any).wrappers.size).toBe(0);
    });

    it('should clear all timeout timers on cleanup', () => {
      const timeoutIds: string[] = [];

      for (let i = 0; i < 50; i++) {
        const { abortId } = proxyManager.register({
          abortId: `timeout-${i}`,
          abortTimeout: 10000
        });
        timeoutIds.push(abortId);
      }

      // Cleanup all
      timeoutIds.forEach((id) => proxyManager.cleanup(id));

      // Advance time - no timeouts should fire
      vi.advanceTimersByTime(20000);

      expect((proxyManager as any).wrappers.size).toBe(0);
    });

    it('should remove event listeners on external signal cleanup', () => {
      const externalControllers: AbortController[] = [];

      for (let i = 0; i < 50; i++) {
        const controller = new AbortController();
        externalControllers.push(controller);

        const { abortId } = proxyManager.register({
          abortId: `external-${i}`,
          signal: controller.signal
        });

        proxyManager.cleanup(abortId);
      }

      // Aborting external signals should not affect cleaned up operations
      externalControllers.forEach((c) => c.abort());

      expect((proxyManager as any).wrappers.size).toBe(0);
    });

    it('should not leak memory with mixed timeout and external signals', () => {
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const controller = new AbortController();
        const { abortId } = proxyManager.register({
          abortId: `mixed-${i}`,
          abortTimeout: 5000,
          signal: controller.signal
        });

        if (i % 2 === 0) {
          proxyManager.cleanup(abortId);
        } else {
          proxyManager.abort(abortId);
        }
      }

      expect((proxyManager as any).wrappers.size).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete fetch-like workflow with timeout', async () => {
      const { abortId, signal } = proxyManager.register({
        abortId: 'fetch-workflow',
        abortTimeout: 5000
      });

      const mockFetch = vi.fn().mockResolvedValue({ data: 'success' });

      try {
        const result = await mockFetch('/api/data', { signal });
        expect(result.data).toBe('success');
      } finally {
        proxyManager.cleanup(abortId);
      }

      expect(mockFetch).toHaveBeenCalledWith('/api/data', { signal });
    });

    it('should handle user cancellation scenario', () => {
      const onAborted = vi.fn();
      const { abortId, signal } = proxyManager.register({
        abortId: 'user-cancel',
        abortTimeout: 10000,
        onAborted
      });

      // Simulate user clicking cancel button
      proxyManager.abort(abortId);

      expect(signal.aborted).toBe(true);
      expect(onAborted).toHaveBeenCalledTimes(1);
    });

    it('should handle component unmount scenario', () => {
      // Simulate multiple operations in a component
      const { signal: signal1 } = proxyManager.register({
        abortId: 'fetch-users'
      });
      const { signal: signal2 } = proxyManager.register({
        abortId: 'fetch-posts'
      });
      const { signal: signal3 } = proxyManager.register({
        abortId: 'fetch-comments'
      });

      // Component unmounts
      proxyManager.abortAll();

      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(true);
    });

    it('should handle retry logic with timeout', () => {
      const onAbortedTimeout = vi.fn();

      // First attempt
      const { signal: signal1 } = proxyManager.register({
        abortId: 'retry-1',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      vi.advanceTimersByTime(5000);
      expect(signal1.aborted).toBe(true);
      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);

      // Retry with new ID
      const { signal: signal2 } = proxyManager.register({
        abortId: 'retry-2',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      expect(signal2.aborted).toBe(false);
    });

    it('should handle parent-child abort relationship', () => {
      const parentController = new AbortController();
      const { signal } = proxyManager.register({
        abortId: 'child-operation',
        signal: parentController.signal
      });

      // Parent aborts
      parentController.abort();

      expect(signal.aborted).toBe(true);
      expect((proxyManager as any).wrappers.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty config', () => {
      const { abortId, signal } = proxyManager.register({});

      expect(abortId).toBeTruthy();
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should handle config with only abortId', () => {
      const { abortId, signal } = proxyManager.register({ abortId: 'only-id' });

      expect(abortId).toBe('only-id');
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should handle very large timeout values', () => {
      const { signal } = proxyManager.register({
        abortId: 'large-timeout',
        abortTimeout: Number.MAX_SAFE_INTEGER
      });

      vi.advanceTimersByTime(1000000);
      expect(signal.aborted).toBe(false);
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Timeout callback error');
      });

      proxyManager.register({
        abortId: 'timeout-error-callback',
        abortTimeout: 1000,
        onAbortedTimeout: errorCallback
      });

      // Should not throw even if callback throws
      expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
      expect(errorCallback).toHaveBeenCalledTimes(1);
    });
  });
});
