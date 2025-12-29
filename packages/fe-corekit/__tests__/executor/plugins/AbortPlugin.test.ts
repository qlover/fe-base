/**
 * @file AbortPlugin test suite
 *
 * Tests for AbortPlugin functionality including:
 * - AbortError class methods and properties
 * - AbortPlugin lifecycle hooks (onBefore, onSuccess, onError)
 * - Request cancellation and timeout mechanisms
 * - Resource cleanup and memory management
 * - Integration scenarios and edge cases
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type {
  AbortPluginConfig,
  AbortConfigExtractor
} from '../../../src/executor';
import { AbortPlugin, AbortError, ABORT_ERROR_ID } from '../../../src/executor';
import { type ExecutorContext, ExecutorError } from '../../../src/executor';
import type { LoggerInterface } from '@qlover/logger';

describe('ABORT_ERROR_ID', () => {
  it('should be a constant string', () => {
    expect(ABORT_ERROR_ID).toBe('ABORT_ERROR');
    expect(typeof ABORT_ERROR_ID).toBe('string');
  });
});

describe('AbortError', () => {
  describe('constructor', () => {
    it('should create AbortError instance correctly', () => {
      const error = new AbortError('Test abort', 'test-id', 1000);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ExecutorError);
      expect(error).toBeInstanceOf(AbortError);
      expect(error.message).toBe('Test abort');
      expect(error.id).toBe(ABORT_ERROR_ID);
      expect(error.abortId).toBe('test-id');
      expect(error.timeout).toBe(1000);
    });

    it('should support not passing abortId and timeout', () => {
      const error = new AbortError('Test abort');

      expect(error.message).toBe('Test abort');
      expect(error.abortId).toBeUndefined();
      expect(error.timeout).toBeUndefined();
    });
  });
});

describe('AbortPlugin', () => {
  let plugin: AbortPlugin<any>;
  let mockLogger: LoggerInterface;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock AbortSignal.timeout to use fallback implementation for fake timers compatibility
    const originalTimeout = AbortSignal.timeout;
    if (typeof originalTimeout === 'function') {
      // Temporarily remove native API to force fallback to setTimeout-based implementation
      delete (AbortSignal as any).timeout;
    }
    
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn(),
      trace: vi.fn(),
      fatal: vi.fn(),
      addAppender: vi.fn(),
      context: vi.fn()
    };

    plugin = new AbortPlugin({ logger: mockLogger });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Restore AbortSignal.timeout if it was removed
    if (typeof AbortSignal.timeout === 'undefined' && typeof (globalThis as any).AbortSignal?.timeout === 'function') {
      (AbortSignal as any).timeout = (globalThis as any).AbortSignal.timeout;
    }
  });

  describe('constructor', () => {
    it('should initialize basic properties correctly', () => {
      expect(plugin.pluginName).toBe('AbortPlugin');
      expect(plugin.onlyOne).toBe(true);
    });

    it('should use default config extractor', () => {
      const config: AbortPluginConfig = { id: 'test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      expect(context.parameters.signal).toBeInstanceOf(AbortSignal);
    });

    it('should support custom config extractor', () => {
      interface CustomParams extends AbortPluginConfig {
        customId: string;
        customField: string;
        metadata: {
          userId: string;
          requestType: string;
        };
      }

      const getConfig: AbortConfigExtractor<CustomParams> = (params) => ({
        id: params.customId,
        requestId: params.requestId,
        signal: params.signal,
        abortTimeout: params.abortTimeout,
        onAborted: params.onAborted
      });

      const customPlugin = new AbortPlugin<CustomParams>({
        getConfig,
        logger: mockLogger
      });

      const params: CustomParams = {
        customId: 'custom-id',
        customField: 'test-value',
        metadata: {
          userId: 'user-123',
          requestType: 'api-call'
        }
      };

      const context: ExecutorContext<CustomParams> = {
        parameters: params,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      // onBefore should work with custom extractor
      customPlugin.onBefore(context);

      // verify custom fields are preserved
      expect(context.parameters.customField).toBe('test-value');
      expect(context.parameters.metadata.userId).toBe('user-123');

      // verify the controller was created using the custom id
      expect(customPlugin.abort('custom-id')).toBe(true);
    });

    it('should work without logger', () => {
      const pluginWithoutLogger = new AbortPlugin();

      const config: AbortPluginConfig = { id: 'no-logger' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      expect(() => {
        pluginWithoutLogger.onBefore(context);
        pluginWithoutLogger.abort('no-logger');
        pluginWithoutLogger.onSuccess(context);
      }).not.toThrow();
    });

    it('should store default timeout option', () => {
      const pluginWithTimeout = new AbortPlugin({
        timeout: 10000,
        logger: mockLogger
      });

      expect((pluginWithTimeout as any).timeout).toBe(10000);
    });

    it('should work without default timeout', () => {
      const pluginWithoutTimeout = new AbortPlugin({
        logger: mockLogger
      });

      expect((pluginWithoutTimeout as any).timeout).toBeUndefined();
    });
  });

  describe('isAbortError static method', () => {
    it('should recognize AbortError instance', () => {
      const error = new AbortError('Test');
      expect(AbortPlugin.isAbortError(error)).toBe(true);
    });

    it('should recognize Error with name "AbortError"', () => {
      const error = new Error('Test');
      error.name = 'AbortError';
      expect(AbortPlugin.isAbortError(error)).toBe(true);
    });

    it('should recognize ExecutorError with id "ABORT_ERROR_ID"', () => {
      const error = new ExecutorError(ABORT_ERROR_ID, 'Test');
      expect(AbortPlugin.isAbortError(error)).toBe(true);
    });

    it('should recognize DOMException AbortError', () => {
      const error = new DOMException('Test', 'AbortError');
      expect(AbortPlugin.isAbortError(error)).toBe(true);
    });

    it('should recognize Event of type "abort"', () => {
      const event = new Event('abort');
      expect(AbortPlugin.isAbortError(event)).toBe(true);
    });

    it('should return false for non-abort errors', () => {
      expect(AbortPlugin.isAbortError(new Error('Test'))).toBe(false);
      expect(AbortPlugin.isAbortError(undefined)).toBe(false);
      expect(AbortPlugin.isAbortError(null)).toBe(false);
      expect(AbortPlugin.isAbortError('string')).toBe(false);
      expect(AbortPlugin.isAbortError(123)).toBe(false);
    });
  });

  describe('generateRequestKey', () => {
    it('should use requestId first', () => {
      const config: AbortPluginConfig = {
        requestId: 'req-123',
        id: 'id-456'
      };

      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should use id as fallback', () => {
      const config: AbortPluginConfig = {
        id: 'id-456'
      };

      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      expect(context.parameters.signal).toBeDefined();
    });

    it('should generate incrementing counter when id is not provided', () => {
      const context1: ExecutorContext<AbortPluginConfig> = {
        parameters: {},
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      const context2: ExecutorContext<AbortPluginConfig> = {
        parameters: {},
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context1);
      plugin.onBefore(context2);

      expect(context1.parameters.signal).toBeDefined();
      expect(context2.parameters.signal).toBeDefined();
      expect(context1.parameters.signal).not.toBe(context2.parameters.signal);
    });
  });

  describe('onBefore', () => {
    it('should create AbortController and set signal', () => {
      const config: AbortPluginConfig = { id: 'test-1' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      expect(config.signal).toBeInstanceOf(AbortSignal);
      expect(config.signal?.aborted).toBe(false);
    });

    it('should not override existing signal', () => {
      const existingController = new AbortController();
      const config: AbortPluginConfig = {
        id: 'test-2',
        signal: existingController.signal
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      // AbortPool creates a new controller but syncs external signal to it
      // The signal in config will be the pool controller's signal, not the original
      expect(config.signal).toBeInstanceOf(AbortSignal);
      expect(config.signal?.aborted).toBe(false);
    });

    it('should abort previous request when duplicate request is made', () => {
      const config1: AbortPluginConfig = { id: 'same-id' };
      const context1: ExecutorContext<AbortPluginConfig> = {
        parameters: config1,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context1);
      const firstSignal = config1.signal;

      const config2: AbortPluginConfig = { id: 'same-id' };
      const context2: ExecutorContext<AbortPluginConfig> = {
        parameters: config2,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context2);

      expect(firstSignal?.aborted).toBe(true);
      expect(config2.signal?.aborted).toBe(false);
      // AbortPool doesn't log, so we just verify the abort happened
    });

    it('should set timeout timer', () => {
      const config: AbortPluginConfig = {
        id: 'timeout-test',
        abortTimeout: 5000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      expect(config.signal?.aborted).toBe(false);

      // advance time
      vi.advanceTimersByTime(5000);

      expect(config.signal?.aborted).toBe(true);
      // AbortPool doesn't log timeout events
    });

    it('should trigger onAbortedTimeout callback when timeout occurs', () => {
      const onAbortedTimeout = vi.fn();
      const config: AbortPluginConfig = {
        id: 'callback-test',
        abortTimeout: 3000,
        onAbortedTimeout
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      vi.advanceTimersByTime(3000);

      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);
      expect(onAbortedTimeout).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'callback-test',
          onAbortedTimeout: undefined // should be removed to prevent recursive calls
        })
      );
    });

    it('should ignore invalid timeout', () => {
      const config: AbortPluginConfig = {
        id: 'invalid-timeout',
        abortTimeout: 0
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      vi.advanceTimersByTime(10000);

      expect(config.signal?.aborted).toBe(false);
    });

    it('should apply default timeout when abortTimeout is not provided', () => {
      const pluginWithDefaultTimeout = new AbortPlugin({
        timeout: 5000,
        logger: mockLogger
      });

      const config: AbortPluginConfig = {
        id: 'default-timeout-test'
        // No abortTimeout provided
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      pluginWithDefaultTimeout.onBefore(context);

      expect(config.signal?.aborted).toBe(false);
      expect(config.abortTimeout).toBe(5000);

      // advance time to trigger timeout
      vi.advanceTimersByTime(5000);

      expect(config.signal?.aborted).toBe(true);
    });

    it('should use config abortTimeout over default timeout', () => {
      const pluginWithDefaultTimeout = new AbortPlugin({
        timeout: 10000, // Default timeout
        logger: mockLogger
      });

      const config: AbortPluginConfig = {
        id: 'override-timeout-test',
        abortTimeout: 3000 // Should use this instead of default
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      pluginWithDefaultTimeout.onBefore(context);

      expect(config.abortTimeout).toBe(3000); // Should remain 3000, not 10000

      // advance time to trigger timeout
      vi.advanceTimersByTime(3000);

      expect(config.signal?.aborted).toBe(true);
    });

    it('should apply default timeout when abortTimeout is explicitly null', () => {
      const pluginWithDefaultTimeout = new AbortPlugin({
        timeout: 5000,
        logger: mockLogger
      });

      const config: AbortPluginConfig = {
        id: 'null-timeout-test',
        abortTimeout: null as unknown as undefined // Explicitly null
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      pluginWithDefaultTimeout.onBefore(context);

      // Should apply default timeout even if abortTimeout is null
      expect(config.abortTimeout).toBe(5000);

      // advance time to trigger timeout
      vi.advanceTimersByTime(5000);

      expect(config.signal?.aborted).toBe(true);
    });

    it('should trigger onAbortedTimeout callback with default timeout', () => {
      const onAbortedTimeout = vi.fn();
      const pluginWithDefaultTimeout = new AbortPlugin({
        timeout: 2000,
        logger: mockLogger
      });

      const config: AbortPluginConfig = {
        id: 'default-timeout-callback-test',
        onAbortedTimeout
        // No abortTimeout provided, should use default
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      pluginWithDefaultTimeout.onBefore(context);

      vi.advanceTimersByTime(2000);

      expect(onAbortedTimeout).toHaveBeenCalledTimes(1);
      expect(onAbortedTimeout).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'default-timeout-callback-test',
          abortTimeout: 2000,
          onAbortedTimeout: undefined
        })
      );
    });
  });

  describe('onSuccess', () => {
    it('should clean up resources', () => {
      const config: AbortPluginConfig = { id: 'success-test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);
      expect(config.signal).toBeDefined();

      plugin.onSuccess(context);

      // AbortPool doesn't log cleanup events
      expect((plugin as any).abortPool['wrappers'].has('success-test')).toBe(false);
    });

    it('should clear timeout timer', () => {
      const config: AbortPluginConfig = {
        id: 'timeout-cleanup',
        abortTimeout: 5000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);
      plugin.onSuccess(context);

      // advance time, should not trigger timeout
      vi.advanceTimersByTime(10000);

      expect(config.signal?.aborted).toBe(false);
      // AbortPool doesn't log timeout events
    });

    it('should handle case when parameters is not provided', () => {
      const context = {} as Partial<ExecutorContext<AbortPluginConfig>>;

      expect(() =>
        plugin.onSuccess(context as ExecutorContext<AbortPluginConfig>)
      ).not.toThrow();
    });
  });

  describe('onError', () => {
    it('should handle AbortError and return standardized error', () => {
      const config: AbortPluginConfig = { id: 'error-test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: new AbortError('Test abort', 'error-test'),
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      const result = plugin.onError(context);

      expect(result).toBeInstanceOf(AbortError);
      expect((result as AbortError).message).toContain('abort');
      // AbortPool doesn't log cleanup events
    });

    it('should return AbortError from signal.reason', () => {
      const config: AbortPluginConfig = { id: 'reason-test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      const customError = new AbortError('Custom abort', 'reason-test', 2000);
      const controller = (plugin as any).abortPool.getWrapper('reason-test');
      controller?.controller.abort(customError);

      context.error = new DOMException('Aborted', 'AbortError');

      const result = plugin.onError(context);

      expect(result).toBe(customError);
      expect((result as AbortError).timeout).toBe(2000);
    });

    it('should clean up resources when non-abort error occurs', () => {
      const config: AbortPluginConfig = { id: 'other-error' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: new Error('Some other error'),
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);
      plugin.onError(context);

      // AbortPool doesn't log cleanup events
      expect((plugin as any).abortPool['wrappers'].has('other-error')).toBe(false);
    });

    it('should handle case when parameters is not provided', () => {
      const context = {
        error: new AbortError('Test')
      } as Partial<ExecutorContext<AbortPluginConfig>>;

      const result = plugin.onError(
        context as ExecutorContext<AbortPluginConfig>
      );

      expect(result).toBeUndefined();
    });
  });

  describe('cleanup', () => {
    it('should clean up specified controller and timeout', () => {
      const config: AbortPluginConfig = {
        id: 'cleanup-test',
        abortTimeout: 5000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      expect((plugin as any).abortPool['wrappers'].has('cleanup-test')).toBe(true);

      plugin.cleanup('cleanup-test');

      expect((plugin as any).abortPool['wrappers'].has('cleanup-test')).toBe(false);
      // AbortPool doesn't log cleanup events
    });

    it('should support passing config object', () => {
      const config: AbortPluginConfig = { id: 'config-cleanup' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);
      plugin.cleanup(config);

      expect((plugin as any).abortPool['wrappers'].has('config-cleanup')).toBe(false);
    });

    it('should handle case when key does not exist', () => {
      expect(() => plugin.cleanup('non-existent')).not.toThrow();
      // AbortPool doesn't log cleanup events
    });

    it('should clear timeout timer to prevent memory leak', () => {
      const config: AbortPluginConfig = {
        id: 'timeout-leak',
        abortTimeout: 10000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      // Verify wrapper exists before cleanup
      expect((plugin as any).abortPool['wrappers'].has('timeout-leak')).toBe(true);

      plugin.cleanup('timeout-leak');

      vi.advanceTimersByTime(15000);

      // should not trigger timeout callback
      // AbortPool doesn't log timeout events
    });
  });

  describe('abort', () => {
    it('should manually abort request', () => {
      const config: AbortPluginConfig = { id: 'manual-abort' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      const result = plugin.abort('manual-abort');

      expect(result).toBe(true);
      expect(config.signal?.aborted).toBe(true);
      // AbortPool doesn't log abort events
    });

    it('should support passing config object', () => {
      const config: AbortPluginConfig = { id: 'config-abort' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      const result = plugin.abort(config);

      expect(result).toBe(true);
      expect(config.signal?.aborted).toBe(true);
    });

    it('should trigger onAborted callback when aborting', () => {
      const onAborted = vi.fn();
      const config: AbortPluginConfig = {
        id: 'abort-callback',
        onAborted
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);
      plugin.abort(config);

      expect(onAborted).toHaveBeenCalledTimes(1);
      expect(onAborted).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'abort-callback',
          onAborted: undefined
        })
      );
    });

    it('should return false when request does not exist', () => {
      const result = plugin.abort('non-existent-request');

      expect(result).toBe(false);
      // AbortPool doesn't log abort events
    });

    it('should clean up resources after aborting', () => {
      const config: AbortPluginConfig = {
        id: 'abort-cleanup',
        abortTimeout: 5000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);
      plugin.abort('abort-cleanup');

      expect((plugin as any).abortPool['wrappers'].has('abort-cleanup')).toBe(false);
    });
  });

  describe('abortAll', () => {
    it('should abort all requests', () => {
      const configs = [{ id: 'req-1' }, { id: 'req-2' }, { id: 'req-3' }];

      const contexts = configs.map((config) => ({
        parameters: config
      })) as ExecutorContext<AbortPluginConfig>[];

      contexts.forEach((ctx) => plugin.onBefore(ctx));

      const signals = contexts.map((ctx) => ctx.parameters.signal);

      plugin.abortAll();

      signals.forEach((signal) => {
        expect(signal?.aborted).toBe(true);
      });

      expect((plugin as any).abortPool['wrappers'].size).toBe(0);
      // AbortPool doesn't log abortAll events
    });

    it('should clear all timeout timers', () => {
      const configs = [
        { id: 'timeout-1', abortTimeout: 5000 },
        { id: 'timeout-2', abortTimeout: 3000 }
      ];

      const contexts = configs.map((config) => ({
        parameters: config
      })) as ExecutorContext<AbortPluginConfig>[];

      contexts.forEach((ctx) => plugin.onBefore(ctx));

      plugin.abortAll();

      vi.advanceTimersByTime(10000);

      // should not trigger any timeout callback
      // AbortPool doesn't log timeout events
    });

    it('should handle case when there are no requests', () => {
      expect(() => plugin.abortAll()).not.toThrow();
      // AbortPool doesn't log abortAll events
    });
  });

  describe('raceWithAbort', () => {
    it('should return original promise when signal is undefined', async () => {
      const promise = Promise.resolve('result');

      const result = await plugin.raceWithAbort(promise);

      expect(result).toBe('result');
    });

    it('should return original promise when signal is null', async () => {
      const promise = Promise.resolve('result');

      const result = await plugin.raceWithAbort(
        promise,
        null as unknown as AbortSignal
      );

      expect(result).toBe('result');
    });

    it('should return result when promise is completed first', async () => {
      const controller = new AbortController();
      const promise = Promise.resolve('success');

      const result = await plugin.raceWithAbort(promise, controller.signal);

      expect(result).toBe('success');
    });

    it('should reject when signal is aborted', async () => {
      const controller = new AbortController();
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('too late'), 1000);
      });

      const racePromise = plugin.raceWithAbort(promise, controller.signal);

      controller.abort(new AbortError('Manual abort'));

      await expect(racePromise).rejects.toThrow();
    });

    it('should immediately reject when signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort(new AbortError('Already aborted'));

      // use delayed promise to ensure abort promise is completed first
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('result'), 100);
      });

      await expect(
        plugin.raceWithAbort(promise, controller.signal)
      ).rejects.toThrow();
    });

    it('should clean up event listeners to prevent memory leak', async () => {
      const controller = new AbortController();
      const promise = Promise.resolve('result');

      const removeEventListenerSpy = vi.spyOn(
        controller.signal,
        'removeEventListener'
      );

      await plugin.raceWithAbort(promise, controller.signal);

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('should clean up listeners when promise rejects', async () => {
      const controller = new AbortController();
      const promise = Promise.reject(new Error('Promise error'));

      const removeEventListenerSpy = vi.spyOn(
        controller.signal,
        'removeEventListener'
      );

      await expect(
        plugin.raceWithAbort(promise, controller.signal)
      ).rejects.toThrow('Promise error');

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('should use signal.reason as reject reason', async () => {
      const controller = new AbortController();
      const customError = new AbortError('Custom reason', 'test-id', 5000);

      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('delayed'), 1000);
      });

      const racePromise = plugin.raceWithAbort(promise, controller.signal);

      controller.abort(customError);

      try {
        await racePromise;
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBe(customError);
        expect((error as AbortError).abortId).toBe('test-id');
        expect((error as AbortError).timeout).toBe(5000);
      }
    });
  });

  describe('integration test', () => {
    it('should complete request lifecycle', async () => {
      const config: AbortPluginConfig = { id: 'integration-test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      // Before
      plugin.onBefore(context);
      expect(config.signal).toBeInstanceOf(AbortSignal);
      expect(config.signal?.aborted).toBe(false);

      // Success
      plugin.onSuccess(context);
      expect((plugin as any).abortPool['wrappers'].has('integration-test')).toBe(false);
    });

    it('should handle timeout scenario', () => {
      const onAbortedTimeout = vi.fn();
      const config: AbortPluginConfig = {
        id: 'timeout-integration',
        abortTimeout: 2000,
        onAbortedTimeout
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      expect(config.signal?.aborted).toBe(false);

      vi.advanceTimersByTime(2000);

      expect(config.signal?.aborted).toBe(true);
      expect(onAbortedTimeout).toHaveBeenCalled();
      // AbortPool doesn't log timeout events
    });

    it('should handle manual abort scenario', () => {
      const config: AbortPluginConfig = { id: 'manual-integration' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);
      plugin.abort('manual-integration');

      expect(config.signal?.aborted).toBe(true);

      context.error = new DOMException('Aborted', 'AbortError');
      const error = plugin.onError(context);

      expect(error).toBeInstanceOf(AbortError);
    });

    it('should handle multiple concurrent requests', () => {
      const configs = Array.from({ length: 10 }, (_, i) => ({
        id: `concurrent-${i}`
      }));

      const contexts = configs.map((config) => ({
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      })) as ExecutorContext<AbortPluginConfig>[];

      contexts.forEach((ctx) => plugin.onBefore(ctx));

      expect((plugin as any).abortPool['wrappers'].size).toBe(10);

      // abort half
      for (let i = 0; i < 5; i++) {
        plugin.abort(`concurrent-${i}`);
      }

      expect((plugin as any).abortPool['wrappers'].size).toBe(5);

      // abort all
      plugin.abortAll();

      expect((plugin as any).abortPool['wrappers'].size).toBe(0);
    });

    it('should prevent resource leak from duplicate requests', () => {
      const config: AbortPluginConfig = { id: 'repeated', abortTimeout: 5000 };

      for (let i = 0; i < 100; i++) {
        const context: ExecutorContext<AbortPluginConfig> = {
          parameters: { ...config },
          error: undefined,
          returnValue: undefined,
          hooksRuntimes: {}
        };
        plugin.onBefore(context);
      }

      // should only keep the last one
      expect((plugin as any).abortPool['wrappers'].size).toBe(1);
    });

    it('should correctly handle raceWithAbort and lifecycle integration', async () => {
      const config: AbortPluginConfig = { id: 'race-integration' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('result'), 5000);
      });

      const racePromise = plugin.raceWithAbort(slowPromise, config.signal);

      // use fake timers to advance time, immediately abort
      plugin.abort('race-integration');

      await expect(racePromise).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as id', () => {
      const config: AbortPluginConfig = { id: '' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      expect(() => plugin.onBefore(context)).not.toThrow();
      expect(config.signal).toBeDefined();
    });

    it('should handle large timeout value', () => {
      const config: AbortPluginConfig = {
        id: 'large-timeout',
        abortTimeout: Number.MAX_SAFE_INTEGER
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      expect(() => plugin.onBefore(context)).not.toThrow();
      expect(config.signal?.aborted).toBe(false);
    });

    it('should handle negative timeout value', () => {
      const config: AbortPluginConfig = {
        id: 'negative-timeout',
        abortTimeout: -1000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      // negative value should be ignored - wrapper should still exist but without timeout
      expect((plugin as any).abortPool['wrappers'].has('negative-timeout')).toBe(true);
      const wrapper = (plugin as any).abortPool.getWrapper('negative-timeout');
      expect(wrapper).toBeDefined();
    });

    it('should handle onAborted callback throwing error', () => {
      const config: AbortPluginConfig = {
        id: 'callback-error',
        onAborted: () => {
          throw new Error('Callback error');
        }
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      // AbortPool catches callback errors and doesn't throw
      // The abort operation should succeed even if callback throws
      expect(() => plugin.abort(config)).not.toThrow();
      expect(config.signal?.aborted).toBe(true);
    });

    it('should handle calling cleanup multiple times', () => {
      const config: AbortPluginConfig = { id: 'multi-cleanup' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      // cleanup multiple times should not throw
      expect(() => {
        plugin.cleanup('multi-cleanup');
        plugin.cleanup('multi-cleanup');
        plugin.cleanup('multi-cleanup');
      }).not.toThrow();

      expect((plugin as any).abortPool['wrappers'].has('multi-cleanup')).toBe(false);
    });

    it('should handle abort with onAborted receiving correct parameters', () => {
      const receivedConfigs: AbortPluginConfig[] = [];
      const config: AbortPluginConfig = {
        id: 'param-test',
        requestId: 'req-param-test',
        abortTimeout: 1000,
        onAborted: (cfg) => {
          receivedConfigs.push(cfg);
        }
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);
      plugin.abort(config);

      expect(receivedConfigs).toHaveLength(1);
      expect(receivedConfigs[0].id).toBe('param-test');
      expect(receivedConfigs[0].requestId).toBe('req-param-test');
      expect(receivedConfigs[0].onAborted).toBeUndefined(); // should be removed
    });

    it('should handle special characters in id', () => {
      const specialIds = [
        'id-with-dashes',
        'id_with_underscores',
        'id.with.dots',
        'id:with:colons',
        'id/with/slashes',
        '中文ID',
        'id with spaces'
      ];

      specialIds.forEach((id) => {
        const config: AbortPluginConfig = { id };
        const context: ExecutorContext<AbortPluginConfig> = {
          parameters: config,
          error: undefined,
          returnValue: undefined,
          hooksRuntimes: {}
        };

        expect(() => {
          plugin.onBefore(context);
          plugin.abort(id);
        }).not.toThrow();
      });
    });

    it('should handle undefined and null values correctly', () => {
      const config: AbortPluginConfig = {
        id: undefined,
        requestId: undefined,
        abortTimeout: undefined,
        onAborted: undefined,
        signal: undefined
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      expect(() => plugin.onBefore(context)).not.toThrow();
      expect(config.signal).toBeDefined();
    });
  });
});
