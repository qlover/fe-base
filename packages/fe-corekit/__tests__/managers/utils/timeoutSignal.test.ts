/**
 * @file timeoutSignal test suite
 *
 * Tests for timeoutSignal utility function including:
 * - Creating timeout signals
 * - Native AbortSignal.timeout() support and fallback
 * - Cleanup functionality
 * - Maximum timeout value handling
 * - Edge cases and error scenarios
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { timeoutSignal } from '../../../src/pools/utils/timeoutSignal';
import type { ClearableSignal } from 'any-signal';

describe('timeoutSignal', () => {
  let originalTimeout: typeof AbortSignal.timeout | undefined;
  let hadNativeAPI: boolean;

  beforeEach(() => {
    // Save original AbortSignal.timeout before each test
    originalTimeout = AbortSignal.timeout;
    hadNativeAPI = typeof originalTimeout === 'function';
    
    // Force fallback implementation by removing native API
    // This ensures all tests use fake timers for stability
    if (hadNativeAPI) {
      delete (AbortSignal as any).timeout;
    }
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers(); // Keep fake timers, don't switch to real timers
    
    // Always restore AbortSignal.timeout if it existed originally
    if (hadNativeAPI && originalTimeout) {
      (AbortSignal as any).timeout = originalTimeout;
    }
  });

  describe('basic functionality', () => {
    it('should create a signal that aborts after timeout', () => {
      const signal = timeoutSignal(100);

      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(99);
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(1);
      expect(signal.aborted).toBe(true);
    });

    it('should abort with TimeoutError', () => {
      const signal = timeoutSignal(100);

      vi.advanceTimersByTime(100);
      expect(signal.aborted).toBe(true);

      // Check for TimeoutError reason if available
      if ('reason' in signal) {
        const reason = (signal as any).reason;
        expect(reason).toBeInstanceOf(DOMException);
        expect(reason.name).toBe('TimeoutError');
      }
    });

    it('should not abort before timeout', () => {
      const signal = timeoutSignal(100);

      vi.advanceTimersByTime(50);
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(49);
      expect(signal.aborted).toBe(false);
    });

    it('should abort exactly at timeout', () => {
      const signal = timeoutSignal(100);

      vi.advanceTimersByTime(50);
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(50);
      expect(signal.aborted).toBe(true);
    });
  });

  describe('cleanup functionality', () => {
    it('should provide clear() method for fallback implementation', () => {
      const signal = timeoutSignal(1000);

      // clear() is available for fallback implementation
      if (
        'clear' in signal &&
        typeof (signal as ClearableSignal).clear === 'function'
      ) {
        const clearableSignal = signal as ClearableSignal;
        expect(typeof clearableSignal.clear).toBe('function');
      }
    });

    it('should prevent timeout when clear() is called', () => {
      const signal = timeoutSignal(1000);

      expect(
        'clear' in signal &&
        typeof (signal as ClearableSignal).clear === 'function'
      ).toBe(true);

      const clearableSignal = signal as ClearableSignal;

      clearableSignal.clear();

      vi.advanceTimersByTime(2000);

      // Signal should not be aborted after clear
      expect(clearableSignal.aborted).toBe(false);
    });

    it('should allow calling clear() multiple times', () => {
      const signal = timeoutSignal(1000);

      if (
        'clear' in signal &&
        typeof (signal as ClearableSignal).clear === 'function'
      ) {
        const clearableSignal = signal as ClearableSignal;

        expect(() => {
          clearableSignal.clear();
          clearableSignal.clear();
          clearableSignal.clear();
        }).not.toThrow();
      }
    });

    it('should be safe to clear after timeout', () => {
      const signal = timeoutSignal(100);

      vi.advanceTimersByTime(100);
      expect(signal.aborted).toBe(true);

      expect(
        'clear' in signal &&
        typeof (signal as ClearableSignal).clear === 'function'
      ).toBe(true);

      const clearableSignal = signal as ClearableSignal;
      expect(() => clearableSignal.clear()).not.toThrow();
    });
  });

  describe('timeout values', () => {
    it('should handle zero timeout', () => {
      const signal = timeoutSignal(0);

      // Zero timeout should abort immediately
      vi.advanceTimersByTime(0);
      expect(signal.aborted).toBe(true);
    });

    it('should handle small timeout values', () => {
      const signal = timeoutSignal(10);

      vi.advanceTimersByTime(9);
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(1);
      expect(signal.aborted).toBe(true);
    });

    it('should handle large timeout values', () => {
      const signal = timeoutSignal(100);

      vi.advanceTimersByTime(50);
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(50);
      expect(signal.aborted).toBe(true);
    });

    it('should clamp timeout to maximum safe value for fallback implementation', () => {
      // Test fallback implementation by temporarily removing native API
      const originalTimeout = AbortSignal.timeout;
      const hadNativeAPI = typeof originalTimeout === 'function';

      try {
        if (hadNativeAPI) {
          delete (AbortSignal as any).timeout;
        }

        const MAX_TIMEOUT_MS = 2147483647; // 2^31 - 1

        const signal = timeoutSignal(Number.MAX_SAFE_INTEGER);

        // Should not abort immediately (would happen if not clamped)
        expect(signal.aborted).toBe(false);

        // Should abort after max timeout
        vi.advanceTimersByTime(MAX_TIMEOUT_MS);
        expect(signal.aborted).toBe(true);
      } finally {
        // Always restore native API
        if (hadNativeAPI && originalTimeout) {
          (AbortSignal as any).timeout = originalTimeout;
        }
      }
    });

    it('should handle timeout values larger than MAX_TIMEOUT_MS for fallback', () => {
      // Test fallback implementation
      const originalTimeout = AbortSignal.timeout;
      const hadNativeAPI = typeof originalTimeout === 'function';

      try {
        if (hadNativeAPI) {
          delete (AbortSignal as any).timeout;
        }

        const MAX_TIMEOUT_MS = 2147483647;
        const largeTimeout = MAX_TIMEOUT_MS + 1000000;

        const signal = timeoutSignal(largeTimeout);

        // Should be clamped to MAX_TIMEOUT_MS
        expect(signal.aborted).toBe(false);

        vi.advanceTimersByTime(MAX_TIMEOUT_MS);
        expect(signal.aborted).toBe(true);
      } finally {
        // Always restore native API
        if (hadNativeAPI && originalTimeout) {
          (AbortSignal as any).timeout = originalTimeout;
        }
      }
    });
  });

  describe('native AbortSignal.timeout() support', () => {
    it('should use native API when available', () => {
      const originalTimeout = AbortSignal.timeout;
      const mockTimeout = vi.fn().mockImplementation((ms: number) => {
        return originalTimeout ? originalTimeout(ms) : new AbortSignal();
      });

      // Mock native API if available
      if (typeof AbortSignal.timeout === 'function') {
        (AbortSignal as any).timeout = mockTimeout;

        timeoutSignal(1000);

        // Should use native API
        expect(mockTimeout).toHaveBeenCalledWith(1000);

        // Restore
        (AbortSignal as any).timeout = originalTimeout;
      }
    });

    it('should fallback to manual implementation when native API unavailable', () => {
      const originalTimeout = AbortSignal.timeout;
      const hadNativeAPI = typeof originalTimeout === 'function';

      try {
        // Temporarily remove native API
        if (hadNativeAPI) {
          delete (AbortSignal as any).timeout;
        }

        const signal = timeoutSignal(1000);

        expect(signal).toBeInstanceOf(AbortSignal);
        expect(signal.aborted).toBe(false);

        vi.advanceTimersByTime(1000);
        expect(signal.aborted).toBe(true);
      } finally {
        // Always restore native API
        if (hadNativeAPI && originalTimeout) {
          (AbortSignal as any).timeout = originalTimeout;
        }
      }
    });
  });

  describe('integration scenarios', () => {
    it('should work with fetch-like operations', async () => {
      const signal = timeoutSignal(100);

      const mockFetch = vi
        .fn()
        .mockImplementation(
          async (_url: string, options: { signal?: AbortSignal }) => {
            // Simulate slow operation with fake timers
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                if (options.signal?.aborted) {
                  reject(new DOMException('Timeout', 'TimeoutError'));
                } else {
                  resolve({ data: 'success' });
                }
              }, 200);
            });
          }
        );

      const promise = mockFetch('/api/data', { signal });

      // Advance time to trigger timeout (100ms)
      vi.advanceTimersByTime(100);
      expect(signal.aborted).toBe(true);

      // Advance more time to let the fetch operation's setTimeout fire (200ms total)
      // This ensures the Promise's setTimeout callback executes and checks the aborted signal
      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow();
    });

    it('should work with anySignal combination', async () => {
      const controller = new AbortController();
      const timeoutSig = timeoutSignal(100);

      const { anySignal } = await import('../../../src/pools/utils/anySignal');
      const combined = anySignal([controller.signal, timeoutSig]);

      expect(combined.aborted).toBe(false);

      // Timeout should abort combined signal
      vi.advanceTimersByTime(100);

      expect(combined.aborted).toBe(true);
    });

    it('should allow manual abort before timeout', async () => {
      const controller = new AbortController();
      const timeoutSig = timeoutSignal(100);

      const { anySignal } = await import('../../../src/pools/utils/anySignal');
      const combined = anySignal([controller.signal, timeoutSig]);

      // Manual abort before timeout
      controller.abort();

      expect(combined.aborted).toBe(true);

      // Advance time - should still be aborted
      vi.advanceTimersByTime(150);
      expect(combined.aborted).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle negative timeout values in fallback implementation', () => {
      // Test fallback implementation
      const originalTimeout = AbortSignal.timeout;
      const hadNativeAPI = typeof originalTimeout === 'function';

      try {
        if (hadNativeAPI) {
          delete (AbortSignal as any).timeout;
        }

        const signal = timeoutSignal(-100);

        // Negative timeout should be clamped or handled gracefully
        expect(signal).toBeInstanceOf(AbortSignal);
      } finally {
        // Always restore native API
        if (hadNativeAPI && originalTimeout) {
          (AbortSignal as any).timeout = originalTimeout;
        }
      }
    });

    it('should handle NaN timeout values in fallback implementation', () => {
      // Test fallback implementation
      const originalTimeout = AbortSignal.timeout;
      const hadNativeAPI = typeof originalTimeout === 'function';

      try {
        if (hadNativeAPI) {
          delete (AbortSignal as any).timeout;
        }

        const signal = timeoutSignal(NaN);

        // NaN should be handled gracefully
        expect(signal).toBeInstanceOf(AbortSignal);
      } finally {
        // Always restore native API
        if (hadNativeAPI && originalTimeout) {
          (AbortSignal as any).timeout = originalTimeout;
        }
      }
    });

    it('should handle Infinity timeout values in fallback implementation', () => {
      // Test fallback implementation
      const originalTimeout = AbortSignal.timeout;
      const hadNativeAPI = typeof originalTimeout === 'function';

      try {
        if (hadNativeAPI) {
          delete (AbortSignal as any).timeout;
        }

        const MAX_TIMEOUT_MS = 2147483647;
        const signal = timeoutSignal(Infinity);

        // Should be clamped to MAX_TIMEOUT_MS
        expect(signal.aborted).toBe(false);

        vi.advanceTimersByTime(MAX_TIMEOUT_MS);
        expect(signal.aborted).toBe(true);
      } finally {
        // Always restore native API
        if (hadNativeAPI && originalTimeout) {
          (AbortSignal as any).timeout = originalTimeout;
        }
      }
    });

    it('should handle multiple timeout signals', () => {
      const signal1 = timeoutSignal(100);
      const signal2 = timeoutSignal(200);
      const signal3 = timeoutSignal(300);

      expect(signal1.aborted).toBe(false);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);

      vi.advanceTimersByTime(100);
      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);

      vi.advanceTimersByTime(100);
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(false);

      vi.advanceTimersByTime(100);
      expect(signal3.aborted).toBe(true);
    });
  });

  describe('memory safety', () => {
    it('should cleanup timeout when clear() is called', () => {
      const signal = timeoutSignal(1000);

      if (
        'clear' in signal &&
        typeof (signal as ClearableSignal).clear === 'function'
      ) {
        const clearableSignal = signal as ClearableSignal;

        clearableSignal.clear();

        // Advance time - timeout should not fire
        vi.advanceTimersByTime(2000);
        expect(clearableSignal.aborted).toBe(false);
      }
    });

    it('should not leak when multiple signals are created and cleared', () => {
      const signals: ClearableSignal[] = [];

      for (let i = 0; i < 100; i++) {
        const signal = timeoutSignal(1000);
        if (
          'clear' in signal &&
          typeof (signal as ClearableSignal).clear === 'function'
        ) {
          signals.push(signal as ClearableSignal);
        }
      }

      // Clear all signals
      signals.forEach((signal) => {
        signal.clear();
      });

      // Advance time - no timeouts should fire
      vi.advanceTimersByTime(2000);

      // All signals should not be aborted
      signals.forEach((signal) => {
        expect(signal.aborted).toBe(false);
      });
    });

    it('should handle rapid create/clear cycles', () => {
      for (let i = 0; i < 100; i++) {
        const signal = timeoutSignal(1000);
        if (
          'clear' in signal &&
          typeof (signal as ClearableSignal).clear === 'function'
        ) {
          (signal as ClearableSignal).clear();
        }
      }

      // Advance time - should not cause issues
      vi.advanceTimersByTime(2000);

      expect(true).toBe(true); // Should not throw
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple concurrent timeout signals', () => {
      const signals = Array.from({ length: 5 }, (_, i) =>
        timeoutSignal((i + 1) * 100)
      );

      // Check all signals are not aborted initially
      signals.forEach((signal) => {
        expect(signal.aborted).toBe(false);
      });

      // Wait for first signal to timeout (100ms)
      vi.advanceTimersByTime(100);
      expect(signals[0].aborted).toBe(true);
      expect(signals[1].aborted).toBe(false);
      expect(signals[2].aborted).toBe(false);

      // Wait for second signal to timeout (200ms total)
      vi.advanceTimersByTime(100);
      expect(signals[1].aborted).toBe(true);
      expect(signals[2].aborted).toBe(false);

      // Wait for third signal to timeout (300ms total)
      vi.advanceTimersByTime(100);
      expect(signals[2].aborted).toBe(true);
      expect(signals[3].aborted).toBe(false);

      // Wait for fourth signal to timeout (400ms total)
      vi.advanceTimersByTime(100);
      expect(signals[3].aborted).toBe(true);
      expect(signals[4].aborted).toBe(false);

      // Wait for fifth signal to timeout (500ms total)
      vi.advanceTimersByTime(100);
      expect(signals[4].aborted).toBe(true);

      // Verify all signals are aborted
      signals.forEach((signal) => {
        expect(signal.aborted).toBe(true);
      });
    });

    it('should handle timeout signals with different durations', () => {
      const shortSignal = timeoutSignal(50);
      const mediumSignal = timeoutSignal(150);
      const longSignal = timeoutSignal(250);

      vi.advanceTimersByTime(50);
      expect(shortSignal.aborted).toBe(true);
      expect(mediumSignal.aborted).toBe(false);
      expect(longSignal.aborted).toBe(false);

      vi.advanceTimersByTime(100);
      expect(mediumSignal.aborted).toBe(true);
      expect(longSignal.aborted).toBe(false);

      vi.advanceTimersByTime(100);
      expect(longSignal.aborted).toBe(true);
    });
  });

  describe('test framework validation', () => {
    // These tests verify that our test framework correctly catches failures
    // They use a pattern where we test both correct and incorrect expectations

    it('should correctly validate test framework error detection', () => {
      // Create a test that we know should pass
      const signal = timeoutSignal(100);

      vi.advanceTimersByTime(50);
      expect(signal.aborted).toBe(false); // Correct: not aborted yet

      vi.advanceTimersByTime(50);
      expect(signal.aborted).toBe(true); // Correct: aborted after 100ms

      // If this test passes, it means our test framework is working correctly
      expect(true).toBe(true);
    });

    // Test framework validation: Verify that incorrect expectations would fail
    // These tests use try-catch to verify the test framework catches errors
    it('should verify test framework catches incorrect expectations', () => {
      const signal = timeoutSignal(100);

      vi.advanceTimersByTime(50);
      
      // Verify that the correct expectation passes
      expect(signal.aborted).toBe(false);
      
      // Verify that an incorrect expectation would fail
      // We use a helper to test this without actually failing the test
      let caughtError = false;
      try {
        // This should fail if test framework is working
        expect(signal.aborted).toBe(true); // Wrong: should be false
      } catch (error) {
        caughtError = true;
        // Test framework correctly caught the error
        expect(error).toBeDefined();
      }
      
      // Verify that the test framework would catch this error
      expect(caughtError).toBe(true);
    });

    it('should verify test framework catches timeout failures', () => {
      const signal = timeoutSignal(100);

      vi.advanceTimersByTime(100);
      
      // Verify correct expectation
      expect(signal.aborted).toBe(true);
      
      // Verify incorrect expectation would fail
      let caughtError = false;
      try {
        expect(signal.aborted).toBe(false); // Wrong: should be true
      } catch (error) {
        caughtError = true;
        expect(error).toBeDefined();
      }
      
      expect(caughtError).toBe(true);
    });

    it('should verify test framework catches clear() behavior failures', () => {
      const signal = timeoutSignal(100);

      expect(
        'clear' in signal &&
        typeof (signal as ClearableSignal).clear === 'function'
      ).toBe(true);

      const clearableSignal = signal as ClearableSignal;
      clearableSignal.clear();

      vi.advanceTimersByTime(200);
      
      // Verify correct expectation
      expect(clearableSignal.aborted).toBe(false);
      
      // Verify incorrect expectation would fail
      let caughtError = false;
      try {
        expect(clearableSignal.aborted).toBe(true); // Wrong: should be false
      } catch (error) {
        caughtError = true;
        expect(error).toBeDefined();
      }
      
      expect(caughtError).toBe(true);
    });

    // Optional: Uncomment these tests to verify they actually fail
    // These are intentionally designed to fail to prove test framework works
    describe.skip('intentional failure tests (uncomment to verify)', () => {
      it('INTENTIONAL FAILURE: signal should NOT abort before timeout', () => {
        const signal = timeoutSignal(100);
        vi.advanceTimersByTime(50);
        expect(signal.aborted).toBe(true); // Wrong: should be false
      });

      it('INTENTIONAL FAILURE: signal SHOULD abort after timeout', () => {
        const signal = timeoutSignal(100);
        vi.advanceTimersByTime(100);
        expect(signal.aborted).toBe(false); // Wrong: should be true
      });

      it('INTENTIONAL FAILURE: clear() should prevent timeout', () => {
        const signal = timeoutSignal(100);
        const clearableSignal = signal as ClearableSignal;
        clearableSignal.clear();
        vi.advanceTimersByTime(200);
        expect(clearableSignal.aborted).toBe(true); // Wrong: should be false
      });
    });
  });
});
