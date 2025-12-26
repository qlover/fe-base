import { AbortPool } from '../../src/pools/AbortPool';
import type { AbortPoolConfig } from '../../src/pools/AbortPool';

describe('AbortPool', () => {
  let pool: AbortPool;

  beforeEach(() => {
    pool = new AbortPool('TestPool');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create pool with default name', () => {
      const defaultPool = new AbortPool();
      expect(defaultPool.poolName).toBe('AbortPool');
    });

    it('should create pool with custom name', () => {
      const customPool = new AbortPool('CustomPool');
      expect(customPool.poolName).toBe('CustomPool');
    });
  });

  describe('generateAbortedId', () => {
    it('should generate unique IDs with pool name prefix', () => {
      const id1 = pool.generateAbortedId();
      const id2 = pool.generateAbortedId();
      const id3 = pool.generateAbortedId();

      expect(id1).toBe('TestPool-1');
      expect(id2).toBe('TestPool-2');
      expect(id3).toBe('TestPool-3');
    });

    it('should use custom abortId from config', () => {
      const id = pool.generateAbortedId({ abortId: 'custom-id' });
      expect(id).toBe('custom-id');
    });

    it('should auto-generate ID when config has no abortId', () => {
      const id = pool.generateAbortedId({});
      expect(id).toBe('TestPool-1');
    });
  });

  describe('register', () => {
    it('should register operation and return signal', () => {
      const { abortId, signal } = pool.register({ abortId: 'test-op' });

      expect(abortId).toBe('test-op');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should auto-generate ID when not provided', () => {
      const { abortId, signal } = pool.register({});

      expect(abortId).toBe('TestPool-1');
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should throw error when registering duplicate ID', () => {
      pool.register({ abortId: 'duplicate' });

      expect(() => {
        pool.register({ abortId: 'duplicate' });
      }).toThrow(
        'Operation with ID "duplicate" is already registered in TestPool'
      );
    });

    it('should register with timeout signal', () => {
      const { abortId, signal } = pool.register({
        abortId: 'with-timeout',
        abortTimeout: 5000
      });

      expect(abortId).toBe('with-timeout');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should register with external signal', () => {
      const externalController = new AbortController();
      const { abortId, signal } = pool.register({
        abortId: 'with-external',
        signal: externalController.signal
      });

      expect(abortId).toBe('with-external');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should register with both timeout and external signal', () => {
      const externalController = new AbortController();
      const { abortId, signal } = pool.register({
        abortId: 'with-both',
        abortTimeout: 5000,
        signal: externalController.signal
      });

      expect(abortId).toBe('with-both');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });
  });

  describe('abort', () => {
    it('should abort operation by ID string', () => {
      const { abortId, signal } = pool.register({ abortId: 'test-abort' });

      expect(signal.aborted).toBe(false);

      const result = pool.abort(abortId);

      expect(result).toBe(true);
      expect(signal.aborted).toBe(true);
    });

    it('should abort operation by config object', () => {
      const config = { abortId: 'test-abort-config' };
      const { signal } = pool.register(config);

      expect(signal.aborted).toBe(false);

      const result = pool.abort(config);

      expect(result).toBe(true);
      expect(signal.aborted).toBe(true);
    });

    it('should return false when aborting non-existent operation', () => {
      const result = pool.abort('non-existent');
      expect(result).toBe(false);
    });

    it('should invoke onAborted callback', () => {
      const onAborted = vi.fn();
      const config: AbortPoolConfig = {
        abortId: 'test-callback',
        onAborted
      };

      pool.register(config);
      pool.abort(config);

      expect(onAborted).toHaveBeenCalledTimes(1);
      expect(onAborted).toHaveBeenCalledWith({
        abortId: 'test-callback',
        onAborted: undefined
      });
    });

    it('should cleanup resources after abort', () => {
      const { abortId, signal } = pool.register({ abortId: 'cleanup-test' });

      pool.abort(abortId);

      expect(signal.aborted).toBe(true);
      // Trying to abort again should return false (already cleaned up)
      expect(pool.abort(abortId)).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup operation by ID string', () => {
      const { abortId } = pool.register({ abortId: 'test-cleanup' });

      pool.cleanup(abortId);

      // Should be able to register again with same ID
      expect(() => {
        pool.register({ abortId: 'test-cleanup' });
      }).not.toThrow();
    });

    it('should cleanup operation by config object', () => {
      const config = { abortId: 'test-cleanup-config' };
      pool.register(config);

      pool.cleanup(config);

      // Should be able to register again with same ID
      expect(() => {
        pool.register(config);
      }).not.toThrow();
    });

    it('should be safe to call cleanup multiple times', () => {
      const { abortId } = pool.register({ abortId: 'multi-cleanup' });

      pool.cleanup(abortId);
      pool.cleanup(abortId); // Second call should not throw
      pool.cleanup(abortId); // Third call should not throw

      expect(true).toBe(true); // If we get here, no errors were thrown
    });

    it('should be safe to cleanup non-existent operation', () => {
      pool.cleanup('non-existent');
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('abortAll', () => {
    it('should abort all registered operations', () => {
      const { signal: signal1 } = pool.register({ abortId: 'op1' });
      const { signal: signal2 } = pool.register({ abortId: 'op2' });
      const { signal: signal3 } = pool.register({ abortId: 'op3' });

      expect(signal1.aborted).toBe(false);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);

      pool.abortAll();

      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(true);
    });

    it('should cleanup all operations', () => {
      pool.register({ abortId: 'op1' });
      pool.register({ abortId: 'op2' });
      pool.register({ abortId: 'op3' });

      pool.abortAll();

      // Should be able to register again with same IDs
      expect(() => {
        pool.register({ abortId: 'op1' });
        pool.register({ abortId: 'op2' });
        pool.register({ abortId: 'op3' });
      }).not.toThrow();
    });

    it('should not invoke onAborted callbacks', () => {
      const onAborted1 = vi.fn();
      const onAborted2 = vi.fn();

      pool.register({ abortId: 'op1', onAborted: onAborted1 });
      pool.register({ abortId: 'op2', onAborted: onAborted2 });

      pool.abortAll();

      expect(onAborted1).not.toHaveBeenCalled();
      expect(onAborted2).not.toHaveBeenCalled();
    });

    it('should be safe to call on empty pool', () => {
      pool.abortAll();
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('timeout functionality', () => {
    it('should abort operation after timeout', () => {
      const onAbortedTimeout = vi.fn();
      const { signal } = pool.register({
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
      const { abortId, signal } = pool.register({
        abortId: 'complete-first',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      pool.cleanup(abortId);

      vi.advanceTimersByTime(5000);

      expect(signal.aborted).toBe(false);
      expect(onAbortedTimeout).not.toHaveBeenCalled();
    });

    it('should not timeout if manually aborted first', () => {
      const onAbortedTimeout = vi.fn();
      const { abortId, signal } = pool.register({
        abortId: 'abort-first',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      pool.abort(abortId);

      vi.advanceTimersByTime(5000);

      expect(signal.aborted).toBe(true);
      expect(onAbortedTimeout).not.toHaveBeenCalled();
    });

    it('should ignore invalid timeout values', () => {
      const { signal: signal1 } = pool.register({
        abortId: 'invalid-1',
        abortTimeout: -1
      });

      const { signal: signal2 } = pool.register({
        abortId: 'invalid-2',
        abortTimeout: 0
      });

      const { signal: signal3 } = pool.register({
        abortId: 'invalid-3',
        abortTimeout: NaN
      });

      vi.advanceTimersByTime(10000);

      expect(signal1.aborted).toBe(false);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);
    });
  });

  describe('external signal synchronization', () => {
    it('should abort when external signal aborts', () => {
      const externalController = new AbortController();
      const { signal } = pool.register({
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

      pool.register({
        abortId: 'external-no-callback',
        signal: externalController.signal,
        onAborted
      });

      externalController.abort();

      expect(onAborted).not.toHaveBeenCalled();
    });

    it('should abort when timeout occurs with external signal', () => {
      const externalController = new AbortController();
      const onAbortedTimeout = vi.fn();

      const { signal } = pool.register({
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

      const { signal } = pool.register({
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

  describe('race condition prevention', () => {
    it('should handle concurrent abort and cleanup', () => {
      const { abortId, signal } = pool.register({ abortId: 'race-test' });

      pool.abort(abortId);
      pool.cleanup(abortId); // Should not throw

      expect(signal.aborted).toBe(true);
    });

    it('should handle concurrent external abort and manual abort', () => {
      const externalController = new AbortController();
      const { abortId, signal } = pool.register({
        abortId: 'concurrent-abort',
        signal: externalController.signal
      });

      externalController.abort();
      pool.abort(abortId); // Should not throw

      expect(signal.aborted).toBe(true);
    });

    it('should handle cleanup during abortAll', () => {
      const { abortId } = pool.register({ abortId: 'cleanup-during-abortall' });
      pool.register({ abortId: 'other-op' });

      // Simulate cleanup happening during abortAll
      pool.cleanup(abortId);
      pool.abortAll(); // Should not throw

      expect(true).toBe(true);
    });
  });

  describe('memory leak prevention', () => {
    it('should clean up timeout when operation completes', () => {
      const { abortId } = pool.register({
        abortId: 'cleanup-timeout',
        abortTimeout: 5000
      });

      pool.cleanup(abortId);

      // Advance time to ensure timeout doesn't fire
      vi.advanceTimersByTime(10000);

      // If we get here without errors, cleanup worked
      expect(true).toBe(true);
    });

    it('should clean up external signal listeners', () => {
      const externalController = new AbortController();
      const { abortId, signal } = pool.register({
        abortId: 'cleanup-external',
        signal: externalController.signal
      });

      pool.cleanup(abortId);

      // Aborting external signal should not affect cleaned up operation
      externalController.abort();

      // Signal should not be aborted (cleanup removed listeners)
      expect(signal.aborted).toBe(false);
    });

    it('should clean up all resources in abortAll', () => {
      pool.register({ abortId: 'op1', abortTimeout: 5000 });
      pool.register({ abortId: 'op2', abortTimeout: 5000 });

      pool.abortAll();

      // Advance time to ensure no timeouts fire
      vi.advanceTimersByTime(10000);

      expect(true).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete fetch-like workflow', async () => {
      const { abortId, signal } = pool.register({
        abortId: 'fetch-workflow',
        abortTimeout: 5000
      });

      const mockFetch = vi.fn().mockResolvedValue({ data: 'success' });

      try {
        const result = await mockFetch('/api/data', { signal });
        expect(result.data).toBe('success');
      } finally {
        pool.cleanup(abortId);
      }

      expect(mockFetch).toHaveBeenCalledWith('/api/data', { signal });
    });

    it('should handle user cancellation scenario', () => {
      const onAborted = vi.fn();
      const { abortId, signal } = pool.register({
        abortId: 'user-cancel',
        abortTimeout: 10000,
        onAborted
      });

      // Simulate user clicking cancel button
      pool.abort(abortId);

      expect(signal.aborted).toBe(true);
      expect(onAborted).toHaveBeenCalledTimes(1);
    });

    it('should handle component unmount scenario', () => {
      // Simulate multiple operations in a component
      const { signal: signal1 } = pool.register({ abortId: 'fetch-users' });
      const { signal: signal2 } = pool.register({ abortId: 'fetch-posts' });
      const { signal: signal3 } = pool.register({ abortId: 'fetch-comments' });

      // Component unmounts
      pool.abortAll();

      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(true);
    });

    it('should handle retry logic with timeout', () => {
      const onAbortedTimeout = vi.fn();

      // First attempt
      const { signal: signal1 } = pool.register({
        abortId: 'retry-1',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      vi.advanceTimersByTime(5000);
      expect(signal1.aborted).toBe(true);
      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);

      // Retry with new ID
      const { signal: signal2 } = pool.register({
        abortId: 'retry-2',
        abortTimeout: 5000,
        onAbortedTimeout
      });

      expect(signal2.aborted).toBe(false);
    });
  });

  describe('autoCleanup', () => {
    it('should cleanup after resolve', async () => {
      expect((pool as any).wrappers.size).toBe(0);

      const result = await pool.autoCleanup(
        async ({ signal }) => {
          expect(signal).toBeInstanceOf(AbortSignal);
          return 'ok';
        },
        { abortId: 'ac-resolve' }
      );

      expect(result).toBe('ok');
      expect((pool as any).wrappers.size).toBe(0);
    });

    it('should cleanup after reject and keep original error', async () => {
      const err = new Error('boom');

      await expect(
        pool.autoCleanup(
          async () => {
            throw err;
          },
          { abortId: 'ac-reject' }
        )
      ).rejects.toBe(err);

      expect((pool as any).wrappers.size).toBe(0);
    });

    it('should cleanup even if factory throws synchronously', async () => {
      const err = new Error('sync boom');

      await expect(
        pool.autoCleanup(
          () => {
            throw err;
          },
          { abortId: 'ac-throw' }
        )
      ).rejects.toBe(err);

      expect((pool as any).wrappers.size).toBe(0);
    });

    it('should run user finalizers before pool.cleanup (pool cleanup last)', async () => {
      const calls: string[] = [];

      await pool.autoCleanup(
        ({ abortId, finalizer }) => {
          finalizer(() => {
            calls.push('user');
            // Pool cleanup should not have happened yet
            expect((pool as any).wrappers.has(abortId)).toBe(true);
          });

          return Promise.resolve('ok');
        },
        { abortId: 'ac-order' }
      );

      expect(calls).toEqual(['user']);
      expect((pool as any).wrappers.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty config', () => {
      const { abortId, signal } = pool.register({});

      expect(abortId).toBeTruthy();
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should handle config with only abortId', () => {
      const { abortId, signal } = pool.register({ abortId: 'only-id' });

      expect(abortId).toBe('only-id');
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should handle very large timeout values', () => {
      const { signal } = pool.register({
        abortId: 'large-timeout',
        abortTimeout: Number.MAX_SAFE_INTEGER
      });

      vi.advanceTimersByTime(1000000);
      expect(signal.aborted).toBe(false);
    });

    it('should handle already aborted external signal', () => {
      const externalController = new AbortController();
      externalController.abort();

      const { signal } = pool.register({
        abortId: 'already-aborted',
        signal: externalController.signal
      });

      expect(signal.aborted).toBe(true);
    });
  });

  describe('memory safety and performance', () => {
    describe('memory leak prevention - advanced', () => {
      it('should not leak memory with rapid register/cleanup cycles', () => {
        const iterations = 1000;
        const initialWrapperCount = (pool as any).wrappers.size;

        for (let i = 0; i < iterations; i++) {
          const { abortId } = pool.register({
            abortId: `rapid-${i}`,
            abortTimeout: 5000
          });
          pool.cleanup(abortId);
        }

        expect((pool as any).wrappers.size).toBe(initialWrapperCount);
      });

      it('should not leak memory with rapid register/abort cycles', () => {
        const iterations = 1000;
        const initialWrapperCount = (pool as any).wrappers.size;

        for (let i = 0; i < iterations; i++) {
          const { abortId } = pool.register({
            abortId: `rapid-abort-${i}`,
            abortTimeout: 5000
          });
          pool.abort(abortId);
        }

        expect((pool as any).wrappers.size).toBe(initialWrapperCount);
      });

      it('should cleanup all wrappers after abortAll with many operations', () => {
        const count = 100;

        for (let i = 0; i < count; i++) {
          pool.register({
            abortId: `bulk-${i}`,
            abortTimeout: 5000
          });
        }

        expect((pool as any).wrappers.size).toBe(count);

        pool.abortAll();

        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should not retain config references after cleanup', () => {
        const largeData = new Array(1000).fill('data');
        const configRef = {
          abortId: 'config-ref-test',
          data: largeData,
          onAborted: () => {
            // Reference to largeData
            console.log(largeData.length);
          }
        };

        const { abortId } = pool.register(configRef);

        // Verify wrapper exists and has config
        const wrapper = (pool as any).wrappers.get(abortId);
        expect(wrapper).toBeDefined();
        expect(wrapper.config).toBe(configRef);

        // Cleanup should remove wrapper and allow GC
        pool.cleanup(abortId);

        expect((pool as any).wrappers.get(abortId)).toBeUndefined();
      });

      it('should clear all timeout timers on cleanup', () => {
        const timeoutIds: string[] = [];

        for (let i = 0; i < 50; i++) {
          const { abortId } = pool.register({
            abortId: `timeout-${i}`,
            abortTimeout: 10000
          });
          timeoutIds.push(abortId);
        }

        // Cleanup all
        timeoutIds.forEach((id) => pool.cleanup(id));

        // Advance time - no timeouts should fire
        vi.advanceTimersByTime(20000);

        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should remove event listeners on external signal cleanup', () => {
        const externalControllers: AbortController[] = [];

        for (let i = 0; i < 50; i++) {
          const controller = new AbortController();
          externalControllers.push(controller);

          const { abortId } = pool.register({
            abortId: `external-${i}`,
            signal: controller.signal
          });

          pool.cleanup(abortId);
        }

        // Aborting external signals should not affect cleaned up operations
        externalControllers.forEach((c) => c.abort());

        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should handle cleanup of already aborted operations', () => {
        const { abortId, signal } = pool.register({
          abortId: 'already-aborted-cleanup',
          abortTimeout: 5000
        });

        pool.abort(abortId);
        expect(signal.aborted).toBe(true);

        // Cleanup after abort should be safe
        pool.cleanup(abortId);
        pool.cleanup(abortId); // Double cleanup should be safe

        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should not leak memory with mixed timeout and external signals', () => {
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
          const controller = new AbortController();
          const { abortId } = pool.register({
            abortId: `mixed-${i}`,
            abortTimeout: 5000,
            signal: controller.signal
          });

          if (i % 2 === 0) {
            pool.cleanup(abortId);
          } else {
            pool.abort(abortId);
          }
        }

        expect((pool as any).wrappers.size).toBe(0);
      });
    });

    describe('performance - high concurrency', () => {
      it('should handle 1000 concurrent operations efficiently', () => {
        const startTime = Date.now();
        const count = 1000;
        const ids: string[] = [];

        // Register 1000 operations
        for (let i = 0; i < count; i++) {
          const { abortId } = pool.register({
            abortId: `perf-${i}`,
            abortTimeout: 10000
          });
          ids.push(abortId);
        }

        const registerTime = Date.now() - startTime;

        // Cleanup all
        const cleanupStart = Date.now();
        ids.forEach((id) => pool.cleanup(id));
        const cleanupTime = Date.now() - cleanupStart;

        // Performance assertions (should be fast)
        expect(registerTime).toBeLessThan(100); // 1000 registers < 100ms
        expect(cleanupTime).toBeLessThan(50); // 1000 cleanups < 50ms
        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should handle rapid abort operations efficiently', () => {
        const count = 500;
        const ids: string[] = [];

        // Register operations
        for (let i = 0; i < count; i++) {
          const { abortId } = pool.register({
            abortId: `abort-perf-${i}`,
            abortTimeout: 10000,
            onAborted: () => {
              // Simulate some work
            }
          });
          ids.push(abortId);
        }

        const startTime = Date.now();

        // Abort all
        ids.forEach((id) => pool.abort(id));

        const abortTime = Date.now() - startTime;

        expect(abortTime).toBeLessThan(100); // 500 aborts < 100ms
        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should handle abortAll with many operations efficiently', () => {
        const count = 1000;

        for (let i = 0; i < count; i++) {
          pool.register({
            abortId: `abortall-perf-${i}`,
            abortTimeout: 10000
          });
        }

        const startTime = Date.now();
        pool.abortAll();
        const abortAllTime = Date.now() - startTime;

        expect(abortAllTime).toBeLessThan(50); // abortAll < 50ms
        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should maintain O(1) lookup performance', () => {
        const count = 1000;
        const ids: string[] = [];

        // Register many operations
        for (let i = 0; i < count; i++) {
          const { abortId } = pool.register({
            abortId: `lookup-${i}`
          });
          ids.push(abortId);
        }

        // Test lookup performance (should be O(1))
        const lookupStart = Date.now();

        for (let i = 0; i < 100; i++) {
          const randomId = ids[Math.floor(Math.random() * ids.length)];
          pool.abort(randomId);
        }

        const lookupTime = Date.now() - lookupStart;

        expect(lookupTime).toBeLessThan(10); // 100 lookups < 10ms

        // Cleanup remaining
        pool.abortAll();
      });
    });

    describe('callback memory safety', () => {
      it('should not call onAborted after cleanup', () => {
        const onAborted = vi.fn();
        const { abortId } = pool.register({
          abortId: 'callback-cleanup',
          onAborted
        });

        pool.cleanup(abortId);

        // Try to abort after cleanup (should not call callback)
        pool.abort(abortId);

        expect(onAborted).not.toHaveBeenCalled();
      });

      it('should handle callback errors gracefully', () => {
        const errorCallback = vi.fn(() => {
          throw new Error('Callback error');
        });

        const { abortId } = pool.register({
          abortId: 'error-callback',
          onAborted: errorCallback
        });

        // Should not throw even if callback throws
        expect(() => pool.abort(abortId)).not.toThrow();
        expect(errorCallback).toHaveBeenCalledTimes(1);
      });

      it('should handle timeout callback errors gracefully', () => {
        const errorCallback = vi.fn(() => {
          throw new Error('Timeout callback error');
        });

        pool.register({
          abortId: 'timeout-error-callback',
          abortTimeout: 1000,
          onAbortedTimeout: errorCallback
        });

        // Should not throw even if callback throws
        expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
        expect(errorCallback).toHaveBeenCalledTimes(1);
      });

      it('should not retain callback references after cleanup', () => {
        const callbacks: Array<() => void> = [];

        for (let i = 0; i < 100; i++) {
          const callback = vi.fn();
          callbacks.push(callback);

          const { abortId } = pool.register({
            abortId: `callback-${i}`,
            onAborted: callback
          });

          pool.cleanup(abortId);
        }

        // All callbacks should be unreferenced
        expect((pool as any).wrappers.size).toBe(0);
      });
    });

    describe('stress testing', () => {
      it('should handle interleaved register/abort/cleanup operations', () => {
        const operations = 500;
        const activeIds: string[] = [];

        for (let i = 0; i < operations; i++) {
          // Register
          const { abortId } = pool.register({
            abortId: `stress-${i}`,
            abortTimeout: 10000
          });
          activeIds.push(abortId);

          // Randomly cleanup or abort some operations
          if (i > 0 && i % 3 === 0) {
            const idToRemove = activeIds.shift();
            if (idToRemove) {
              if (Math.random() > 0.5) {
                pool.abort(idToRemove);
              } else {
                pool.cleanup(idToRemove);
              }
            }
          }
        }

        // Cleanup remaining
        activeIds.forEach((id) => pool.cleanup(id));

        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should handle concurrent timeout expirations', () => {
        const count = 50;
        const callbacks: Array<() => void> = [];

        for (let i = 0; i < count; i++) {
          const callback = vi.fn();
          callbacks.push(callback);

          pool.register({
            abortId: `concurrent-timeout-${i}`,
            abortTimeout: 1000,
            onAbortedTimeout: callback
          });
        }

        // All timeouts expire at once
        vi.advanceTimersByTime(1000);

        // All callbacks should be called
        callbacks.forEach((cb) => {
          expect(cb).toHaveBeenCalledTimes(1);
        });

        expect((pool as any).wrappers.size).toBe(0);
      });

      it('should handle mixed abort scenarios under stress', () => {
        const count = 100;
        const externalControllers: AbortController[] = [];

        for (let i = 0; i < count; i++) {
          const controller = new AbortController();
          externalControllers.push(controller);

          pool.register({
            abortId: `mixed-stress-${i}`,
            abortTimeout: 5000 + i * 10,
            signal: controller.signal,
            onAborted: vi.fn(),
            onAbortedTimeout: vi.fn()
          });
        }

        // Abort some externally
        for (let i = 0; i < 30; i++) {
          externalControllers[i].abort();
        }

        // Abort some manually
        for (let i = 30; i < 60; i++) {
          pool.abort(`mixed-stress-${i}`);
        }

        // Let some timeout
        vi.advanceTimersByTime(5000);

        // Cleanup remaining
        pool.abortAll();

        expect((pool as any).wrappers.size).toBe(0);
      });
    });

    describe('edge cases - memory safety', () => {
      it('should handle cleanup during callback execution', () => {
        const { abortId } = pool.register({
          abortId: 'cleanup-during-callback',
          onAborted: () => {
            // Try to cleanup during callback (should be safe)
            pool.cleanup(abortId);
          }
        });

        expect(() => pool.abort(abortId)).not.toThrow();
      });

      it('should handle abort during cleanup', () => {
        const { abortId } = pool.register({
          abortId: 'abort-during-cleanup'
        });

        // Simulate concurrent abort and cleanup
        pool.cleanup(abortId);
        const result = pool.abort(abortId);

        expect(result).toBe(false); // Already cleaned up
      });

      it('should handle duplicate abortId after cleanup', () => {
        const abortId = 'duplicate-after-cleanup';

        pool.register({ abortId });
        pool.cleanup(abortId);

        // Should be able to register again with same ID
        expect(() => {
          pool.register({ abortId });
        }).not.toThrow();

        pool.cleanup(abortId);
      });

      it('should not leak with circular reference in config', () => {
        const circularConfig: any = {
          abortId: 'circular-ref',
          onAborted: () => {
            // Reference to circularConfig
            console.log(circularConfig.abortId);
          }
        };
        circularConfig.self = circularConfig;

        const { abortId } = pool.register(circularConfig);
        pool.cleanup(abortId);

        expect((pool as any).wrappers.size).toBe(0);
      });
    });
  });
});
