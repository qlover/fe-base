import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AbortManager } from '../../src/managers/AbortManager';
import type { AbortManagerConfig } from '../../src/managers/interface/AbortManagerInterface';

describe('AbortManager', () => {
  let manager: AbortManager;
  let originalTimeout: typeof AbortSignal.timeout | undefined;

  beforeEach(() => {
    // Mock AbortSignal.timeout to use fallback implementation for fake timers compatibility
    originalTimeout = AbortSignal.timeout;
    if (typeof originalTimeout === 'function') {
      // Temporarily remove native API to force fallback to setTimeout-based implementation
      delete (AbortSignal as any).timeout;
    }

    manager = new AbortManager('TestManager');
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
      const defaultManager = new AbortManager();
      expect(defaultManager.poolName).toBe('AbortManager');
    });

    it('should create manager with custom name', () => {
      const customManager = new AbortManager('CustomManager');
      expect(customManager.poolName).toBe('CustomManager');
    });
  });

  describe('generateAbortedId', () => {
    it('should generate unique IDs with manager name prefix', () => {
      const id1 = manager.generateAbortedId();
      const id2 = manager.generateAbortedId();
      const id3 = manager.generateAbortedId();

      expect(id1).toBe('TestManager-1');
      expect(id2).toBe('TestManager-2');
      expect(id3).toBe('TestManager-3');
    });

    it('should use custom abortId from config', () => {
      const id = manager.generateAbortedId({ abortId: 'custom-id' });
      expect(id).toBe('custom-id');
    });

    it('should auto-generate ID when config has no abortId', () => {
      const id = manager.generateAbortedId({});
      expect(id).toBe('TestManager-1');
    });
  });

  describe('register', () => {
    it('should register operation and return signal', () => {
      const { abortId, signal } = manager.register({ abortId: 'test-op' });

      expect(abortId).toBe('test-op');
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should auto-generate ID when not provided', () => {
      const { abortId, signal } = manager.register({});

      expect(abortId).toBe('TestManager-1');
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should throw error when registering duplicate ID', () => {
      manager.register({ abortId: 'duplicate' });

      expect(() => {
        manager.register({ abortId: 'duplicate' });
      }).toThrow(
        'Operation with ID "duplicate" is already registered in TestManager'
      );
    });
  });

  describe('abort', () => {
    it('should abort operation by ID string', () => {
      const { abortId, signal } = manager.register({ abortId: 'test-abort' });

      expect(signal.aborted).toBe(false);

      const result = manager.abort(abortId);

      expect(result).toBe(true);
      expect(signal.aborted).toBe(true);
    });

    it('should abort operation by config object', () => {
      const config = { abortId: 'test-abort-config' };
      const { signal } = manager.register(config);

      expect(signal.aborted).toBe(false);

      const result = manager.abort(config);

      expect(result).toBe(true);
      expect(signal.aborted).toBe(true);
    });

    it('should return false when aborting non-existent operation', () => {
      const result = manager.abort('non-existent');
      expect(result).toBe(false);
    });

    it('should invoke onAborted callback', () => {
      const onAborted = vi.fn();
      const config: AbortManagerConfig = {
        abortId: 'test-callback',
        onAborted
      };

      manager.register(config);
      manager.abort(config);

      expect(onAborted).toHaveBeenCalledTimes(1);
      expect(onAborted).toHaveBeenCalledWith({
        abortId: 'test-callback',
        onAborted: undefined
      });
    });

    it('should cleanup resources after abort', () => {
      const { abortId, signal } = manager.register({ abortId: 'cleanup-test' });

      manager.abort(abortId);

      expect(signal.aborted).toBe(true);
      // Trying to abort again should return false (already cleaned up)
      expect(manager.abort(abortId)).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup operation by ID string', () => {
      const { abortId } = manager.register({ abortId: 'test-cleanup' });

      manager.cleanup(abortId);

      // Should be able to register again with same ID
      expect(() => {
        manager.register({ abortId: 'test-cleanup' });
      }).not.toThrow();
    });

    it('should cleanup operation by config object', () => {
      const config = { abortId: 'test-cleanup-config' };
      manager.register(config);

      manager.cleanup(config);

      // Should be able to register again with same ID
      expect(() => {
        manager.register(config);
      }).not.toThrow();
    });

    it('should be safe to call cleanup multiple times', () => {
      const { abortId } = manager.register({ abortId: 'multi-cleanup' });

      manager.cleanup(abortId);
      manager.cleanup(abortId); // Second call should not throw
      manager.cleanup(abortId); // Third call should not throw

      expect(true).toBe(true); // If we get here, no errors were thrown
    });

    it('should be safe to cleanup non-existent operation', () => {
      manager.cleanup('non-existent');
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('abortAll', () => {
    it('should abort all registered operations', () => {
      const { signal: signal1 } = manager.register({ abortId: 'op1' });
      const { signal: signal2 } = manager.register({ abortId: 'op2' });
      const { signal: signal3 } = manager.register({ abortId: 'op3' });

      expect(signal1.aborted).toBe(false);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);

      manager.abortAll();

      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(true);
    });

    it('should cleanup all operations', () => {
      manager.register({ abortId: 'op1' });
      manager.register({ abortId: 'op2' });
      manager.register({ abortId: 'op3' });

      manager.abortAll();

      // Should be able to register again with same IDs
      expect(() => {
        manager.register({ abortId: 'op1' });
        manager.register({ abortId: 'op2' });
        manager.register({ abortId: 'op3' });
      }).not.toThrow();
    });

    it('should not invoke onAborted callbacks', () => {
      const onAborted1 = vi.fn();
      const onAborted2 = vi.fn();

      manager.register({ abortId: 'op1', onAborted: onAborted1 });
      manager.register({ abortId: 'op2', onAborted: onAborted2 });

      manager.abortAll();

      expect(onAborted1).not.toHaveBeenCalled();
      expect(onAborted2).not.toHaveBeenCalled();
    });

    it('should be safe to call on empty manager', () => {
      manager.abortAll();
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('race condition prevention', () => {
    it('should handle concurrent abort and cleanup', () => {
      const { abortId, signal } = manager.register({ abortId: 'race-test' });

      manager.abort(abortId);
      manager.cleanup(abortId); // Should not throw

      expect(signal.aborted).toBe(true);
    });

    it('should handle cleanup during abortAll', () => {
      const { abortId } = manager.register({
        abortId: 'cleanup-during-abortall'
      });
      manager.register({ abortId: 'other-op' });

      // Simulate cleanup happening during abortAll
      manager.cleanup(abortId);
      manager.abortAll(); // Should not throw

      expect(true).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete fetch-like workflow', async () => {
      const { abortId, signal } = manager.register({
        abortId: 'fetch-workflow'
      });

      const mockFetch = vi.fn().mockResolvedValue({ data: 'success' });

      try {
        const result = await mockFetch('/api/data', { signal });
        expect(result.data).toBe('success');
      } finally {
        manager.cleanup(abortId);
      }

      expect(mockFetch).toHaveBeenCalledWith('/api/data', { signal });
    });

    it('should handle user cancellation scenario', () => {
      const onAborted = vi.fn();
      const { abortId, signal } = manager.register({
        abortId: 'user-cancel',
        onAborted
      });

      // Simulate user clicking cancel button
      manager.abort(abortId);

      expect(signal.aborted).toBe(true);
      expect(onAborted).toHaveBeenCalledTimes(1);
    });

    it('should handle component unmount scenario', () => {
      // Simulate multiple operations in a component
      const { signal: signal1 } = manager.register({ abortId: 'fetch-users' });
      const { signal: signal2 } = manager.register({ abortId: 'fetch-posts' });
      const { signal: signal3 } = manager.register({
        abortId: 'fetch-comments'
      });

      // Component unmounts
      manager.abortAll();

      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(true);
    });
  });

  describe('autoCleanup', () => {
    it('should cleanup after resolve', async () => {
      expect((manager as any).wrappers.size).toBe(0);

      const result = await manager.autoCleanup(
        async ({ signal }) => {
          expect(signal).toBeInstanceOf(AbortSignal);
          return 'ok';
        },
        { abortId: 'ac-resolve' }
      );

      expect(result).toBe('ok');
      expect((manager as any).wrappers.size).toBe(0);
    });

    it('should cleanup after reject and keep original error', async () => {
      const err = new Error('boom');

      await expect(
        manager.autoCleanup(
          async () => {
            throw err;
          },
          { abortId: 'ac-reject' }
        )
      ).rejects.toBe(err);

      expect((manager as any).wrappers.size).toBe(0);
    });

    it('should cleanup even if factory throws synchronously', async () => {
      const err = new Error('sync boom');

      await expect(
        manager.autoCleanup(
          () => {
            throw err;
          },
          { abortId: 'ac-throw' }
        )
      ).rejects.toBe(err);

      expect((manager as any).wrappers.size).toBe(0);
    });
  });

  describe('getSignal', () => {
    it('should return signal for registered operation', () => {
      const { abortId, signal } = manager.register({
        abortId: 'get-signal-test'
      });

      const retrievedSignal = manager.getSignal(abortId);

      expect(retrievedSignal).toBe(signal);
      expect(retrievedSignal).toBeInstanceOf(AbortSignal);
    });

    it('should return undefined for non-existent operation', () => {
      const signal = manager.getSignal('non-existent');
      expect(signal).toBeUndefined();
    });

    it('should return undefined after cleanup', () => {
      const { abortId } = manager.register({ abortId: 'cleanup-signal-test' });

      manager.cleanup(abortId);

      const signal = manager.getSignal(abortId);
      expect(signal).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty config', () => {
      const { abortId, signal } = manager.register({});

      expect(abortId).toBeTruthy();
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('should handle config with only abortId', () => {
      const { abortId, signal } = manager.register({ abortId: 'only-id' });

      expect(abortId).toBe('only-id');
      expect(signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe('memory safety and performance', () => {
    describe('memory leak prevention', () => {
      it('should not leak memory with rapid register/cleanup cycles', () => {
        const iterations = 1000;
        const initialWrapperCount = (manager as any).wrappers.size;

        for (let i = 0; i < iterations; i++) {
          const { abortId } = manager.register({
            abortId: `rapid-${i}`
          });
          manager.cleanup(abortId);
        }

        expect((manager as any).wrappers.size).toBe(initialWrapperCount);
      });

      it('should not leak memory with rapid register/abort cycles', () => {
        const iterations = 1000;
        const initialWrapperCount = (manager as any).wrappers.size;

        for (let i = 0; i < iterations; i++) {
          const { abortId } = manager.register({
            abortId: `rapid-abort-${i}`
          });
          manager.abort(abortId);
        }

        expect((manager as any).wrappers.size).toBe(initialWrapperCount);
      });

      it('should cleanup all wrappers after abortAll with many operations', () => {
        const count = 100;

        for (let i = 0; i < count; i++) {
          manager.register({
            abortId: `bulk-${i}`
          });
        }

        expect((manager as any).wrappers.size).toBe(count);

        manager.abortAll();

        expect((manager as any).wrappers.size).toBe(0);
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

        const { abortId } = manager.register(configRef);

        // Verify wrapper exists and has config
        const wrapper = (manager as any).wrappers.get(abortId);
        expect(wrapper).toBeDefined();
        expect(wrapper.config).toBe(configRef);

        // Cleanup should remove wrapper and allow GC
        manager.cleanup(abortId);

        expect((manager as any).wrappers.get(abortId)).toBeUndefined();
      });
    });

    describe('performance - high concurrency', () => {
      it('should handle 1000 concurrent operations efficiently', () => {
        const startTime = Date.now();
        const count = 1000;
        const ids: string[] = [];

        // Register 1000 operations
        for (let i = 0; i < count; i++) {
          const { abortId } = manager.register({
            abortId: `perf-${i}`
          });
          ids.push(abortId);
        }

        const registerTime = Date.now() - startTime;

        // Cleanup all
        const cleanupStart = Date.now();
        ids.forEach((id) => manager.cleanup(id));
        const cleanupTime = Date.now() - cleanupStart;

        // Performance assertions (should be fast)
        expect(registerTime).toBeLessThan(100); // 1000 registers < 100ms
        expect(cleanupTime).toBeLessThan(50); // 1000 cleanups < 50ms
        expect((manager as any).wrappers.size).toBe(0);
      });

      it('should handle rapid abort operations efficiently', () => {
        const count = 500;
        const ids: string[] = [];

        // Register operations
        for (let i = 0; i < count; i++) {
          const { abortId } = manager.register({
            abortId: `abort-perf-${i}`,
            onAborted: () => {
              // Simulate some work
            }
          });
          ids.push(abortId);
        }

        const startTime = Date.now();

        // Abort all
        ids.forEach((id) => manager.abort(id));

        const abortTime = Date.now() - startTime;

        expect(abortTime).toBeLessThan(100); // 500 aborts < 100ms
        expect((manager as any).wrappers.size).toBe(0);
      });

      it('should handle abortAll with many operations efficiently', () => {
        const count = 1000;

        for (let i = 0; i < count; i++) {
          manager.register({
            abortId: `abortall-perf-${i}`
          });
        }

        const startTime = Date.now();
        manager.abortAll();
        const abortAllTime = Date.now() - startTime;

        expect(abortAllTime).toBeLessThan(50); // abortAll < 50ms
        expect((manager as any).wrappers.size).toBe(0);
      });

      it('should maintain O(1) lookup performance', () => {
        const count = 1000;
        const ids: string[] = [];

        // Register many operations
        for (let i = 0; i < count; i++) {
          const { abortId } = manager.register({
            abortId: `lookup-${i}`
          });
          ids.push(abortId);
        }

        // Test lookup performance (should be O(1))
        const lookupStart = Date.now();

        for (let i = 0; i < 100; i++) {
          const randomId = ids[Math.floor(Math.random() * ids.length)];
          manager.abort(randomId);
        }

        const lookupTime = Date.now() - lookupStart;

        expect(lookupTime).toBeLessThan(10); // 100 lookups < 10ms

        // Cleanup remaining
        manager.abortAll();
      });
    });

    describe('callback memory safety', () => {
      it('should not call onAborted after cleanup', () => {
        const onAborted = vi.fn();
        const { abortId } = manager.register({
          abortId: 'callback-cleanup',
          onAborted
        });

        manager.cleanup(abortId);

        // Try to abort after cleanup (should not call callback)
        manager.abort(abortId);

        expect(onAborted).not.toHaveBeenCalled();
      });

      it('should handle callback errors gracefully', () => {
        const errorCallback = vi.fn(() => {
          throw new Error('Callback error');
        });

        const { abortId } = manager.register({
          abortId: 'error-callback',
          onAborted: errorCallback
        });

        // Should not throw even if callback throws
        expect(() => manager.abort(abortId)).not.toThrow();
        expect(errorCallback).toHaveBeenCalledTimes(1);
      });

      it('should not retain callback references after cleanup', () => {
        const callbacks: Array<() => void> = [];

        for (let i = 0; i < 100; i++) {
          const callback = vi.fn();
          callbacks.push(callback);

          const { abortId } = manager.register({
            abortId: `callback-${i}`,
            onAborted: callback
          });

          manager.cleanup(abortId);
        }

        // All callbacks should be unreferenced
        expect((manager as any).wrappers.size).toBe(0);
      });
    });

    describe('stress testing', () => {
      it('should handle interleaved register/abort/cleanup operations', () => {
        const operations = 500;
        const activeIds: string[] = [];

        for (let i = 0; i < operations; i++) {
          // Register
          const { abortId } = manager.register({
            abortId: `stress-${i}`
          });
          activeIds.push(abortId);

          // Randomly cleanup or abort some operations
          if (i > 0 && i % 3 === 0) {
            const idToRemove = activeIds.shift();
            if (idToRemove) {
              if (Math.random() > 0.5) {
                manager.abort(idToRemove);
              } else {
                manager.cleanup(idToRemove);
              }
            }
          }
        }

        // Cleanup remaining
        activeIds.forEach((id) => manager.cleanup(id));

        expect((manager as any).wrappers.size).toBe(0);
      });
    });

    describe('edge cases - memory safety', () => {
      it('should handle cleanup during callback execution', () => {
        const { abortId } = manager.register({
          abortId: 'cleanup-during-callback',
          onAborted: () => {
            // Try to cleanup during callback (should be safe)
            manager.cleanup(abortId);
          }
        });

        expect(() => manager.abort(abortId)).not.toThrow();
      });

      it('should handle abort during cleanup', () => {
        const { abortId } = manager.register({
          abortId: 'abort-during-cleanup'
        });

        // Simulate concurrent abort and cleanup
        manager.cleanup(abortId);
        const result = manager.abort(abortId);

        expect(result).toBe(false); // Already cleaned up
      });

      it('should handle duplicate abortId after cleanup', () => {
        const abortId = 'duplicate-after-cleanup';

        manager.register({ abortId });
        manager.cleanup(abortId);

        // Should be able to register again with same ID
        expect(() => {
          manager.register({ abortId });
        }).not.toThrow();

        manager.cleanup(abortId);
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

        const { abortId } = manager.register(circularConfig);
        manager.cleanup(abortId);

        expect((manager as any).wrappers.size).toBe(0);
      });
    });
  });
});
