/**
 * @file anySignal test suite
 *
 * Tests for anySignal utility function including:
 * - Combining multiple abort signals
 * - Handling null/undefined signals
 * - Native AbortSignal.any() support and fallback
 * - Cleanup functionality
 * - Edge cases and error scenarios
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { anySignal } from '../../../src/pools/utils/anySignal';
import type { ClearableSignal } from 'any-signal';

describe('anySignal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should combine multiple signals', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      const controller3 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal,
        controller3.signal
      ]);

      expect(combined).toBeInstanceOf(AbortSignal);
      expect(combined.aborted).toBe(false);
    });

    it('should abort when any signal aborts', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      const controller3 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal,
        controller3.signal
      ]);

      expect(combined.aborted).toBe(false);

      controller2.abort();

      expect(combined.aborted).toBe(true);
    });

    it('should abort when first signal aborts', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([controller1.signal, controller2.signal]);

      controller1.abort();

      expect(combined.aborted).toBe(true);
    });

    it('should abort when last signal aborts', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([controller1.signal, controller2.signal]);

      controller2.abort();

      expect(combined.aborted).toBe(true);
    });
  });

  describe('null/undefined handling', () => {
    it('should filter out null signals', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        null,
        controller2.signal
      ]);

      expect(combined).toBeInstanceOf(AbortSignal);
      expect(combined.aborted).toBe(false);

      controller1.abort();
      expect(combined.aborted).toBe(true);
    });

    it('should filter out undefined signals', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        undefined,
        controller2.signal
      ]);

      expect(combined).toBeInstanceOf(AbortSignal);
      expect(combined.aborted).toBe(false);

      controller2.abort();
      expect(combined.aborted).toBe(true);
    });

    it('should handle array with only null/undefined', () => {
      const combined = anySignal([null, undefined, null]);

      // Should return a signal (fallback library handles empty arrays)
      expect(combined).toBeDefined();
    });

    it('should handle mixed null/undefined/valid signals', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        null,
        controller1.signal,
        undefined,
        controller2.signal,
        null
      ]);

      expect(combined.aborted).toBe(false);

      controller1.abort();
      expect(combined.aborted).toBe(true);
    });
  });

  describe('single signal', () => {
    it('should work with single signal', () => {
      const controller = new AbortController();
      const combined = anySignal([controller.signal]);

      expect(combined.aborted).toBe(false);

      controller.abort();
      expect(combined.aborted).toBe(true);
    });

    it('should work with single signal that is already aborted', () => {
      const controller = new AbortController();
      controller.abort();

      const combined = anySignal([controller.signal]);

      expect(combined.aborted).toBe(true);
    });
  });

  describe('empty array handling', () => {
    it('should handle empty array', () => {
      const combined = anySignal([]);

      // Fallback library handles empty arrays
      expect(combined).toBeDefined();
    });
  });

  describe('cleanup functionality', () => {
    it('should provide clear() method', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal
      ]) as ClearableSignal;

      expect(typeof combined.clear).toBe('function');
    });

    it('should allow calling clear() multiple times', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal
      ]) as ClearableSignal;

      expect(() => {
        combined.clear();
        combined.clear();
        combined.clear();
      }).not.toThrow();
    });

    it('should not throw when clearing after abort', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal
      ]) as ClearableSignal;

      controller1.abort();
      expect(combined.aborted).toBe(true);

      expect(() => combined.clear()).not.toThrow();
    });
  });

  describe('abort reason propagation', () => {
    it('should propagate abort reason', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([controller1.signal, controller2.signal]);

      const reason = new Error('Custom abort reason');
      controller1.abort(reason);

      expect(combined.aborted).toBe(true);
      // Note: AbortSignal.reason might not be available in all environments
      if ('reason' in combined) {
        expect((combined as any).reason).toBe(reason);
      }
    });
  });

  describe('native AbortSignal.any() support', () => {
    it('should use native API when available', () => {
      const originalAny = AbortSignal.any;
      const mockAny = vi.fn().mockImplementation((signals: AbortSignal[]) => {
        return originalAny(signals);
      });

      // Mock native API if available
      if (typeof AbortSignal.any === 'function') {
        (AbortSignal as any).any = mockAny;

        const controller1 = new AbortController();
        const controller2 = new AbortController();

        anySignal([controller1.signal, controller2.signal]);

        // Should use native API
        expect(mockAny).toHaveBeenCalled();

        // Restore
        (AbortSignal as any).any = originalAny;
      }
    });

    it('should provide clear() method even with native API', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal
      ]) as ClearableSignal;

      expect(typeof combined.clear).toBe('function');
      expect(() => combined.clear()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should work with fetch-like operations', async () => {
      vi.useRealTimers();
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([controller1.signal, controller2.signal]);

      const mockFetch = vi
        .fn()
        .mockImplementation(
          async (_url: string, options: { signal?: AbortSignal }) => {
            // Simulate async operation
            await new Promise((resolve) => setTimeout(resolve, 50));
            if (options.signal?.aborted) {
              throw new DOMException('Aborted', 'AbortError');
            }
            return { data: 'success' };
          }
        );

      const promise = mockFetch('/api/data', { signal: combined });

      // Abort during operation
      controller1.abort();

      await expect(promise).rejects.toThrow();

      // Cleanup
      (combined as ClearableSignal).clear();
      vi.useFakeTimers();
    });

    it('should work with timeout signal', () => {
      const controller = new AbortController();
      const timeoutSignal = AbortSignal.timeout
        ? AbortSignal.timeout(5000)
        : (() => {
            const timeoutController = new AbortController();
            setTimeout(() => timeoutController.abort(), 5000);
            return timeoutController.signal;
          })();

      const combined = anySignal([controller.signal, timeoutSignal]);

      expect(combined.aborted).toBe(false);

      // Abort manually before timeout
      controller.abort();
      expect(combined.aborted).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle all signals already aborted', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      const controller3 = new AbortController();

      controller1.abort();
      controller2.abort();
      controller3.abort();

      const combined = anySignal([
        controller1.signal,
        controller2.signal,
        controller3.signal
      ]);

      expect(combined.aborted).toBe(true);
    });

    it('should handle rapid abort calls', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      const controller3 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal,
        controller3.signal
      ]);

      // Rapid abort calls
      controller1.abort();
      controller2.abort();
      controller3.abort();

      expect(combined.aborted).toBe(true);
    });

    it('should handle signal that aborts after combination', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([controller1.signal, controller2.signal]);

      expect(combined.aborted).toBe(false);

      // Abort after some time
      setTimeout(() => {
        controller1.abort();
      }, 100);

      vi.advanceTimersByTime(100);

      expect(combined.aborted).toBe(true);
    });
  });

  describe('memory safety', () => {
    it('should not leak when cleared', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal
      ]) as ClearableSignal;

      // Clear should clean up listeners
      combined.clear();

      // Aborting after clear should not affect the combined signal
      // (though it may already be cleaned up)
      controller1.abort();
    });

    it('should handle multiple clear calls', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const combined = anySignal([
        controller1.signal,
        controller2.signal
      ]) as ClearableSignal;

      combined.clear();
      combined.clear();
      combined.clear();

      expect(true).toBe(true); // Should not throw
    });
  });
});
