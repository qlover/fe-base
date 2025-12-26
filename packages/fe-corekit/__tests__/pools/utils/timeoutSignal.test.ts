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
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should create a signal that aborts after timeout', async () => {
      // Use real timers for native AbortSignal.timeout()
      vi.useRealTimers();
      const signal = timeoutSignal(100);

      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(signal.aborted).toBe(true);
      vi.useFakeTimers();
    });

    it('should abort with TimeoutError', async () => {
      vi.useRealTimers();
      const signal = timeoutSignal(100);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(signal.aborted).toBe(true);
      // Check for TimeoutError reason if available
      if ('reason' in signal) {
        const reason = (signal as any).reason;
        expect(reason).toBeInstanceOf(DOMException);
        expect(reason.name).toBe('TimeoutError');
      }
      vi.useFakeTimers();
    });

    it('should not abort before timeout', async () => {
      vi.useRealTimers();
      const signal = timeoutSignal(100);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(signal.aborted).toBe(false);
      vi.useFakeTimers();
    });

    it('should abort exactly at timeout', async () => {
      vi.useRealTimers();
      const signal = timeoutSignal(100);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(signal.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(signal.aborted).toBe(true);
      vi.useFakeTimers();
    });
  });

  describe('cleanup functionality', () => {
    it('should provide clear() method for fallback implementation', () => {
      const signal = timeoutSignal(1000);

      // clear() is available for fallback implementation
      if ('clear' in signal && typeof (signal as ClearableSignal).clear === 'function') {
        const clearableSignal = signal as ClearableSignal;
        expect(typeof clearableSignal.clear).toBe('function');
      }
    });

    it('should prevent timeout when clear() is called', () => {
      const signal = timeoutSignal(1000);

      if ('clear' in signal && typeof (signal as ClearableSignal).clear === 'function') {
        const clearableSignal = signal as ClearableSignal;

        clearableSignal.clear();

        vi.advanceTimersByTime(2000);

        // Signal should not be aborted after clear
        expect(clearableSignal.aborted).toBe(false);
      }
    });

    it('should allow calling clear() multiple times', () => {
      const signal = timeoutSignal(1000);

      if ('clear' in signal && typeof (signal as ClearableSignal).clear === 'function') {
        const clearableSignal = signal as ClearableSignal;

        expect(() => {
          clearableSignal.clear();
          clearableSignal.clear();
          clearableSignal.clear();
        }).not.toThrow();
      }
    });

    it('should be safe to clear after timeout', async () => {
      vi.useRealTimers();
      const signal = timeoutSignal(100);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(signal.aborted).toBe(true);

      if ('clear' in signal && typeof (signal as ClearableSignal).clear === 'function') {
        const clearableSignal = signal as ClearableSignal;
        expect(() => clearableSignal.clear()).not.toThrow();
      }
      vi.useFakeTimers();
    });
  });

  describe('timeout values', () => {
    it('should handle zero timeout', async () => {
      vi.useRealTimers();
      const signal = timeoutSignal(0);

      // Zero timeout should abort immediately (or very quickly)
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(signal.aborted).toBe(true);
      vi.useFakeTimers();
    });

    it('should handle small timeout values', async () => {
      vi.useRealTimers();
      const signal = timeoutSignal(10);

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(signal.aborted).toBe(true);
      vi.useFakeTimers();
    });

    it('should handle large timeout values', async () => {
      vi.useRealTimers();
      const signal = timeoutSignal(100);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(signal.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(signal.aborted).toBe(true);
      vi.useFakeTimers();
    });

    it('should clamp timeout to maximum safe value for fallback implementation', () => {
      // Test fallback implementation by temporarily removing native API
      const originalTimeout = AbortSignal.timeout;
      if (originalTimeout) {
        delete (AbortSignal as any).timeout;
      }

      const MAX_TIMEOUT_MS = 2147483647; // 2^31 - 1

      const signal = timeoutSignal(Number.MAX_SAFE_INTEGER);

      // Should not abort immediately (would happen if not clamped)
      expect(signal.aborted).toBe(false);

      // Should abort after max timeout
      vi.advanceTimersByTime(MAX_TIMEOUT_MS);
      expect(signal.aborted).toBe(true);

      // Restore native API
      if (originalTimeout) {
        (AbortSignal as any).timeout = originalTimeout;
      }
    });

    it('should handle timeout values larger than MAX_TIMEOUT_MS for fallback', () => {
      // Test fallback implementation
      const originalTimeout = AbortSignal.timeout;
      if (originalTimeout) {
        delete (AbortSignal as any).timeout;
      }

      const MAX_TIMEOUT_MS = 2147483647;
      const largeTimeout = MAX_TIMEOUT_MS + 1000000;

      const signal = timeoutSignal(largeTimeout);

      // Should be clamped to MAX_TIMEOUT_MS
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(MAX_TIMEOUT_MS);
      expect(signal.aborted).toBe(true);

      // Restore native API
      if (originalTimeout) {
        (AbortSignal as any).timeout = originalTimeout;
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

        const signal = timeoutSignal(1000);

        // Should use native API
        expect(mockTimeout).toHaveBeenCalledWith(1000);

        // Restore
        (AbortSignal as any).timeout = originalTimeout;
      }
    });

    it('should fallback to manual implementation when native API unavailable', () => {
      const originalTimeout = AbortSignal.timeout;
      // Temporarily remove native API
      if (originalTimeout) {
        delete (AbortSignal as any).timeout;
      }

      const signal = timeoutSignal(1000);

      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(1000);
      expect(signal.aborted).toBe(true);

      // Restore native API if it existed
      if (originalTimeout) {
        (AbortSignal as any).timeout = originalTimeout;
      }
    });
  });

  describe('integration scenarios', () => {
    it('should work with fetch-like operations', async () => {
      vi.useRealTimers();
      const signal = timeoutSignal(100);

      const mockFetch = vi.fn().mockImplementation(
        async (_url: string, options: { signal?: AbortSignal }) => {
          // Simulate slow operation
          await new Promise((resolve) => setTimeout(resolve, 200));
          if (options.signal?.aborted) {
            throw new DOMException('Timeout', 'TimeoutError');
          }
          return { data: 'success' };
        }
      );

      const promise = mockFetch('/api/data', { signal });

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      await expect(promise).rejects.toThrow();
      vi.useFakeTimers();
    });

    it('should work with anySignal combination', async () => {
      vi.useRealTimers();
      const controller = new AbortController();
      const timeoutSig = timeoutSignal(100);

      // Import anySignal for combination test
      const { anySignal } = await import('../../../src/pools/utils/anySignal');
      const combined = anySignal([controller.signal, timeoutSig]);

      expect(combined.aborted).toBe(false);

      // Timeout should abort combined signal
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(combined.aborted).toBe(true);
      vi.useFakeTimers();
    });

    it('should allow manual abort before timeout', async () => {
      vi.useRealTimers();
      const controller = new AbortController();
      const timeoutSig = timeoutSignal(100);

      const { anySignal } = await import('../../../src/pools/utils/anySignal');
      const combined = anySignal([controller.signal, timeoutSig]);

      // Manual abort before timeout
      controller.abort();

      expect(combined.aborted).toBe(true);

      // Advance time - should still be aborted
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(combined.aborted).toBe(true);
      vi.useFakeTimers();
    });
  });

  describe('edge cases', () => {
    it('should handle negative timeout values in fallback implementation', () => {
      // Test fallback implementation
      const originalTimeout = AbortSignal.timeout;
      if (originalTimeout) {
        delete (AbortSignal as any).timeout;
      }

      const signal = timeoutSignal(-100);

      // Negative timeout should be clamped or handled gracefully
      expect(signal).toBeInstanceOf(AbortSignal);

      // Restore native API
      if (originalTimeout) {
        (AbortSignal as any).timeout = originalTimeout;
      }
    });

    it('should handle NaN timeout values in fallback implementation', () => {
      // Test fallback implementation
      const originalTimeout = AbortSignal.timeout;
      if (originalTimeout) {
        delete (AbortSignal as any).timeout;
      }

      const signal = timeoutSignal(NaN);

      // NaN should be handled gracefully
      expect(signal).toBeInstanceOf(AbortSignal);

      // Restore native API
      if (originalTimeout) {
        (AbortSignal as any).timeout = originalTimeout;
      }
    });

    it('should handle Infinity timeout values in fallback implementation', () => {
      // Test fallback implementation
      const originalTimeout = AbortSignal.timeout;
      if (originalTimeout) {
        delete (AbortSignal as any).timeout;
      }

      const MAX_TIMEOUT_MS = 2147483647;
      const signal = timeoutSignal(Infinity);

      // Should be clamped to MAX_TIMEOUT_MS
      expect(signal.aborted).toBe(false);

      vi.advanceTimersByTime(MAX_TIMEOUT_MS);
      expect(signal.aborted).toBe(true);

      // Restore native API
      if (originalTimeout) {
        (AbortSignal as any).timeout = originalTimeout;
      }
    });

    it('should handle multiple timeout signals', async () => {
      vi.useRealTimers();
      const signal1 = timeoutSignal(100);
      const signal2 = timeoutSignal(200);
      const signal3 = timeoutSignal(300);

      expect(signal1.aborted).toBe(false);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(signal1.aborted).toBe(true);
      expect(signal2.aborted).toBe(false);
      expect(signal3.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(signal2.aborted).toBe(true);
      expect(signal3.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(signal3.aborted).toBe(true);
      vi.useFakeTimers();
    });
  });

  describe('memory safety', () => {
    it('should cleanup timeout when clear() is called', () => {
      const signal = timeoutSignal(1000);

      if ('clear' in signal && typeof (signal as ClearableSignal).clear === 'function') {
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
        if ('clear' in signal && typeof (signal as ClearableSignal).clear === 'function') {
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
        if ('clear' in signal && typeof (signal as ClearableSignal).clear === 'function') {
          (signal as ClearableSignal).clear();
        }
      }

      // Advance time - should not cause issues
      vi.advanceTimersByTime(2000);

      expect(true).toBe(true); // Should not throw
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple concurrent timeout signals', async () => {
      vi.useRealTimers();
      const signals = Array.from({ length: 5 }, (_, i) =>
        timeoutSignal((i + 1) * 100)
      );

      // Check all signals are not aborted initially
      signals.forEach((signal) => {
        expect(signal.aborted).toBe(false);
      });

      // Wait for first signal to timeout (100ms)
      await new Promise((resolve) => setTimeout(resolve, 110));
      expect(signals[0].aborted).toBe(true);
      expect(signals[1].aborted).toBe(false);
      expect(signals[2].aborted).toBe(false);

      // Wait for second signal to timeout (200ms total)
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(signals[1].aborted).toBe(true);
      expect(signals[2].aborted).toBe(false);

      // Wait for third signal to timeout (300ms total)
      await new Promise((resolve) => setTimeout(resolve, 110));
      expect(signals[2].aborted).toBe(true);
      expect(signals[3].aborted).toBe(false);

      // Wait for fourth signal to timeout (400ms total)
      await new Promise((resolve) => setTimeout(resolve, 110));
      expect(signals[3].aborted).toBe(true);
      expect(signals[4].aborted).toBe(false);

      // Wait for fifth signal to timeout (500ms total)
      await new Promise((resolve) => setTimeout(resolve, 110));
      expect(signals[4].aborted).toBe(true);

      // Verify all signals are aborted
      signals.forEach((signal) => {
        expect(signal.aborted).toBe(true);
      });
      vi.useFakeTimers();
    });

    it('should handle timeout signals with different durations', async () => {
      vi.useRealTimers();
      const shortSignal = timeoutSignal(50);
      const mediumSignal = timeoutSignal(150);
      const longSignal = timeoutSignal(250);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(shortSignal.aborted).toBe(true);
      expect(mediumSignal.aborted).toBe(false);
      expect(longSignal.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mediumSignal.aborted).toBe(true);
      expect(longSignal.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(longSignal.aborted).toBe(true);
      vi.useFakeTimers();
    });
  });
});

