/**
 * @file AborterPlugin test suite
 *
 * Tests for AborterPlugin lifecycle integration including:
 * - Lifecycle hook integration (onBefore, onError, onFinally)
 * - Default timeout configuration
 * - Signal injection into context
 * - Error transformation
 * - Security fixes:
 *   - Config immutability (no mutation of user objects)
 *   - Proper cleanup in all scenarios
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AborterPlugin } from '../../src/aborter/AborterPlugin';
import { Aborter } from '../../src/aborter/Aborter';
import { AbortError } from '../../src/aborter/AbortError';
import type { AborterConfig } from '../../src/aborter/AborterInterface';
import { ExecutorContextImpl } from '../../src/executor/impl/ExecutorContextImpl';

describe('AborterPlugin', () => {
  let plugin: AborterPlugin<AborterConfig>;
  let context: ExecutorContextImpl<AborterConfig, unknown>;
  let originalAbortSignalTimeout: typeof AbortSignal.timeout | undefined;

  beforeEach(() => {
    // Use fake timers to speed up timeout tests
    vi.useFakeTimers();

    // Temporarily disable native AbortSignal.timeout to use fake timers
    originalAbortSignalTimeout = AbortSignal.timeout;
    // @ts-ignore - Temporarily override for testing
    AbortSignal.timeout = undefined;

    plugin = new AborterPlugin();
    context = new ExecutorContextImpl<AborterConfig, unknown>({});
  });

  afterEach(() => {
    // Restore native AbortSignal.timeout
    if (originalAbortSignalTimeout) {
      // @ts-ignore
      AbortSignal.timeout = originalAbortSignalTimeout;
    }

    // Restore real timers
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should create plugin with default options', () => {
      const plugin = new AborterPlugin();

      expect(plugin.pluginName).toBe('AborterPlugin');
      expect(plugin.onlyOne).toBe(true);
    });

    it('should create plugin with custom name', () => {
      const plugin = new AborterPlugin({
        pluginName: 'CustomAborter'
      });

      expect(plugin.pluginName).toBe('CustomAborter');
    });

    it('should create plugin with default timeout', () => {
      const plugin = new AborterPlugin({
        timeout: 5000
      });

      expect(plugin['timeout']).toBe(5000);
    });

    it('should create plugin with custom aborter', () => {
      const customAborter = new Aborter('CustomAborter');
      const plugin = new AborterPlugin({
        aborter: customAborter
      });

      expect(plugin['aborter']).toBe(customAborter);
    });

    it('should create plugin with custom config extractor', () => {
      const getConfig = vi.fn((params) => params as AborterConfig);
      const plugin = new AborterPlugin({
        getConfig
      });

      expect(plugin['getConfig']).toBe(getConfig);
    });
  });

  describe('onBefore lifecycle hook', () => {
    it('should register operation and inject signal', () => {
      plugin.onBefore(context);

      const params = context.parameters;
      expect(params).toHaveProperty('signal');
      expect(params).toHaveProperty('abortId');
      expect(params.signal).toBeInstanceOf(AbortSignal);
      expect(params.signal?.aborted).toBe(false);
    });

    it('should apply default timeout if not specified', () => {
      const plugin = new AborterPlugin({ timeout: 3000 });
      const context = new ExecutorContextImpl<AborterConfig, unknown>({});

      plugin.onBefore(context);

      // The timeout should be applied internally
      // We can verify by checking if timeout triggers
      const params = context.parameters;
      expect(params.signal).toBeDefined();
    });

    it('should not override user-provided timeout', () => {
      const plugin = new AborterPlugin({ timeout: 3000 });
      const context = new ExecutorContextImpl<AborterConfig, unknown>({
        abortTimeout: 5000
      });

      plugin.onBefore(context);

      // User timeout should take precedence
      const params = context.parameters;
      expect(params.signal).toBeDefined();
    });

    it('should abort existing operation with same ID', () => {
      const context1 = new ExecutorContextImpl<AborterConfig, unknown>({
        abortId: 'same-id'
      });
      const context2 = new ExecutorContextImpl<AborterConfig, unknown>({
        abortId: 'same-id'
      });

      plugin.onBefore(context1);
      const signal1 = context1.parameters.signal;

      plugin.onBefore(context2);
      const signal2 = context2.parameters.signal;

      // First signal should be aborted
      expect(signal1?.aborted).toBe(true);
      // Second signal should be active
      expect(signal2?.aborted).toBe(false);
    });

    it('should handle empty parameters', () => {
      const context = new ExecutorContextImpl<AborterConfig, unknown>(
        {} as any
      );

      expect(() => {
        plugin.onBefore(context);
      }).not.toThrow();

      expect(context.parameters.signal).toBeDefined();
    });
  });

  describe('onError lifecycle hook', () => {
    it('should return AbortError for abort-related errors', () => {
      plugin.onBefore(context);

      // Simulate abort
      const controller = new AbortController();
      controller.abort();

      context.setError(
        new DOMException('The operation was aborted', 'AbortError')
      );

      const result = plugin.onError(context);

      expect(result).toBeInstanceOf(AbortError);
      expect((result as AbortError).message).toBe('The operation was aborted');
    });

    it('should return existing AbortError unchanged', () => {
      plugin.onBefore(context);

      const abortError = new AbortError('Custom abort', 'test-id');
      context.setError(abortError);

      const result = plugin.onError(context);

      expect(result).toBe(abortError);
    });

    it('should return void for non-abort errors', () => {
      plugin.onBefore(context);

      context.setError(new Error('Regular error'));

      const result = plugin.onError(context);

      expect(result).toBeUndefined();
    });

    it('should handle error without parameters', () => {
      const context = new ExecutorContextImpl<AborterConfig, unknown>(
        null as any
      );
      context.setError(new Error('Test error'));

      const result = plugin.onError(context);

      expect(result).toBeUndefined();
    });

    it('should handle DOMException AbortError', () => {
      plugin.onBefore(context);

      const abortException = new DOMException(
        'Operation cancelled',
        'AbortError'
      );
      context.setError(abortException);

      const result = plugin.onError(context);

      expect(result).toBeInstanceOf(AbortError);
      expect((result as AbortError).message).toBe('Operation cancelled');
    });
  });

  describe('onFinally lifecycle hook', () => {
    it('should cleanup resources', () => {
      plugin.onBefore(context);
      const abortId = context.parameters.abortId;

      plugin.onFinally(context);

      // Cleanup should have been called
      // Try to cleanup again - should return false
      expect(plugin['aborter'].cleanup(abortId!)).toBe(false);
    });

    it('should handle cleanup even if parameters are null', () => {
      const context = new ExecutorContextImpl<AborterConfig, unknown>(
        null as any
      );

      expect(() => {
        plugin.onFinally(context);
      }).not.toThrow();
    });

    it('should cleanup even if operation was aborted', () => {
      plugin.onBefore(context);
      const abortId = context.parameters.abortId;

      // Abort the operation
      plugin['aborter'].abort(abortId!);

      // Cleanup should still work
      expect(() => {
        plugin.onFinally(context);
      }).not.toThrow();
    });
  });

  describe('Security Fix: Config immutability', () => {
    it('should not mutate original config object', () => {
      const plugin = new AborterPlugin({ timeout: 3000 });
      const originalConfig: AborterConfig = {
        abortId: 'test-id'
      };
      const context = new ExecutorContextImpl<AborterConfig, unknown>(
        originalConfig
      );

      plugin.onBefore(context);

      // Original config should not have timeout added
      expect(originalConfig.abortTimeout).toBeUndefined();

      // But context parameters should have signal and abortId
      expect(context.parameters.signal).toBeDefined();
      expect(context.parameters.abortId).toBe('test-id');
    });

    it('should not mutate config when timeout is null', () => {
      const plugin = new AborterPlugin({ timeout: 3000 });
      const originalConfig: AborterConfig = {
        abortId: 'test-id',
        abortTimeout: null as any
      };
      const context = new ExecutorContextImpl<AborterConfig, unknown>(
        originalConfig
      );

      plugin.onBefore(context);

      // Original config should still have null
      expect(originalConfig.abortTimeout).toBeNull();
    });

    it('should not mutate config when timeout is undefined', () => {
      const plugin = new AborterPlugin({ timeout: 3000 });
      const originalConfig: AborterConfig = {
        abortId: 'test-id',
        abortTimeout: undefined
      };
      const context = new ExecutorContextImpl<AborterConfig, unknown>(
        originalConfig
      );

      plugin.onBefore(context);

      // Original config should still have undefined
      expect(originalConfig.abortTimeout).toBeUndefined();
    });

    it('should preserve user timeout in original config', () => {
      const plugin = new AborterPlugin({ timeout: 3000 });
      const originalConfig: AborterConfig = {
        abortId: 'test-id',
        abortTimeout: 5000
      };
      const context = new ExecutorContextImpl<AborterConfig, unknown>(
        originalConfig
      );

      plugin.onBefore(context);

      // Original config should keep user timeout
      expect(originalConfig.abortTimeout).toBe(5000);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete lifecycle', async () => {
      const onAborted = vi.fn();
      const context = new ExecutorContextImpl<AborterConfig, unknown>({
        abortTimeout: 5000,
        onAborted
      });

      plugin.onBefore(context);
      const signal = context.parameters.signal;

      // Fast-forward time and wait for abort event
      const abortPromise = new Promise<void>((resolve) => {
        signal?.addEventListener('abort', () => resolve(), { once: true });
      });

      await vi.advanceTimersByTimeAsync(5000);
      await abortPromise;

      expect(signal?.aborted).toBe(true);

      plugin.onFinally(context);

      // Should be cleaned up
      expect(plugin['aborter'].cleanup(context.parameters.abortId!)).toBe(
        false
      );
    });

    it('should handle error and cleanup', () => {
      plugin.onBefore(context);

      // Simulate error
      context.setError(new DOMException('Aborted', 'AbortError'));

      const error = plugin.onError(context);
      expect(error).toBeInstanceOf(AbortError);

      plugin.onFinally(context);

      // Should be cleaned up
      expect(plugin['aborter'].cleanup(context.parameters.abortId!)).toBe(
        false
      );
    });

    it('should handle external signal abort', () => {
      const externalController = new AbortController();
      const context = new ExecutorContextImpl<AborterConfig, unknown>({
        signal: externalController.signal
      });

      plugin.onBefore(context);
      const signal = context.parameters.signal;

      externalController.abort();

      expect(signal?.aborted).toBe(true);

      plugin.onFinally(context);
    });

    it('should handle already aborted external signal', () => {
      const externalController = new AbortController();
      externalController.abort(new Error('Already aborted'));

      const context = new ExecutorContextImpl<AborterConfig, unknown>({
        signal: externalController.signal
      });

      plugin.onBefore(context);
      const signal = context.parameters.signal;

      // Signal should be aborted immediately
      expect(signal?.aborted).toBe(true);
      expect(signal?.reason).toBeInstanceOf(Error);

      plugin.onFinally(context);
    });
  });

  describe('Custom config extractor', () => {
    it('should use custom extractor', () => {
      const getConfig = vi.fn((params: any) => ({
        abortId: params.requestId,
        abortTimeout: params.timeout
      }));

      const plugin = new AborterPlugin({ getConfig });
      const context = new ExecutorContextImpl<any, unknown>({
        requestId: 'custom-id',
        timeout: 5000
      });

      plugin.onBefore(context);

      expect(getConfig).toHaveBeenCalled();
      expect(context.parameters.abortId).toBe('custom-id');
    });

    it('should handle extractor returning different structure', () => {
      interface CustomParams extends AborterConfig {
        req: {
          id: string;
          timeout: number;
        };
      }

      const getConfig = (params: any) => ({
        abortId: params.req?.id,
        abortTimeout: params.req?.timeout
      });

      const plugin = new AborterPlugin<AborterConfig>({ getConfig });
      const context = new ExecutorContextImpl<CustomParams, unknown>({
        req: {
          id: 'nested-id',
          timeout: 3000
        }
      });

      plugin.onBefore(context);

      expect(context.parameters).toHaveProperty('signal');
      expect(context.parameters).toHaveProperty('abortId');
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid successive calls', () => {
      const contexts = Array.from(
        { length: 10 },
        () => new ExecutorContextImpl<AborterConfig, unknown>({})
      );

      contexts.forEach((ctx) => {
        plugin.onBefore(ctx);
        expect(ctx.parameters.signal).toBeDefined();
      });

      contexts.forEach((ctx) => {
        plugin.onFinally(ctx);
      });
    });

    it('should handle same ID reuse after cleanup', () => {
      const config = { abortId: 'reusable' };

      const context1 = new ExecutorContextImpl<AborterConfig, unknown>(config);
      plugin.onBefore(context1);
      plugin.onFinally(context1);

      const context2 = new ExecutorContextImpl<AborterConfig, unknown>(config);
      expect(() => {
        plugin.onBefore(context2);
      }).not.toThrow();
    });

    it('should handle onFinally called multiple times', () => {
      plugin.onBefore(context);

      expect(() => {
        plugin.onFinally(context);
        plugin.onFinally(context);
        plugin.onFinally(context);
      }).not.toThrow();
    });

    it('should handle onError without onBefore', () => {
      context.setError(new Error('Test error'));

      expect(() => {
        plugin.onError(context);
      }).not.toThrow();
    });
  });
});
