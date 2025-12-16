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

  describe('isTimeout', () => {
    it('should return true when timeout is set', () => {
      const error = new AbortError('Timeout', 'id', 5000);
      expect(error.isTimeout()).toBe(true);
    });

    it('should return false when timeout is 0', () => {
      const error = new AbortError('Timeout', 'id', 0);
      expect(error.isTimeout()).toBe(false);
    });

    it('should return false when timeout is not set', () => {
      const error = new AbortError('Abort', 'id');
      expect(error.isTimeout()).toBe(false);
    });
  });

  describe('getDescription', () => {
    it('should return description containing abortId and timeout', () => {
      const error = new AbortError('Operation aborted', 'req-123', 3000);
      const description = error.getDescription();

      expect(description).toContain('Operation aborted');
      expect(description).toContain('Request: req-123');
      expect(description).toContain('Timeout: 3000ms');
    });

    it('should return description containing only abortId', () => {
      const error = new AbortError('Operation aborted', 'req-123');
      const description = error.getDescription();

      expect(description).toContain('Operation aborted');
      expect(description).toContain('Request: req-123');
      expect(description).not.toContain('Timeout');
    });

    it('should return description containing only timeout', () => {
      const error = new AbortError('Operation aborted', undefined, 3000);
      const description = error.getDescription();

      expect(description).toContain('Operation aborted');
      expect(description).toContain('Timeout: 3000ms');
      expect(description).not.toContain('Request:');
    });

    it('should return original message when there is no additional information', () => {
      const error = new AbortError('Operation aborted');
      const description = error.getDescription();

      expect(description).toBe('Operation aborted');
    });
  });
});

describe('AbortPlugin', () => {
  let plugin: AbortPlugin<any>;
  let mockLogger: LoggerInterface;

  beforeEach(() => {
    vi.useFakeTimers();
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

      expect(config.signal).toBe(existingController.signal);
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
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('aborting previous request')
      );
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
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
    });

    it('should trigger onAborted callback when timeout occurs', () => {
      const onAborted = vi.fn();
      const config: AbortPluginConfig = {
        id: 'callback-test',
        abortTimeout: 3000,
        onAborted
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: undefined,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      plugin.onBefore(context);

      vi.advanceTimersByTime(3000);

      expect(onAborted).toHaveBeenCalledTimes(1);
      expect(onAborted).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'callback-test',
          onAborted: undefined // should be removed to prevent recursive calls
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

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cleanup')
      );
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
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
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
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cleanup')
      );
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
      const controller = plugin['controllers'].get('reason-test');
      controller?.abort(customError);

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

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cleanup')
      );
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

      expect(plugin['controllers'].has('cleanup-test')).toBe(true);
      expect(plugin['timeouts'].has('cleanup-test')).toBe(true);

      plugin.cleanup('cleanup-test');

      expect(plugin['controllers'].has('cleanup-test')).toBe(false);
      expect(plugin['timeouts'].has('cleanup-test')).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cleanup: cleanup-test')
      );
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

      expect(plugin['controllers'].has('config-cleanup')).toBe(false);
    });

    it('should handle case when key does not exist', () => {
      expect(() => plugin.cleanup('non-existent')).not.toThrow();
      expect(mockLogger.debug).not.toHaveBeenCalled();
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

      const timeoutId = plugin['timeouts'].get('timeout-leak');
      expect(timeoutId).toBeDefined();

      plugin.cleanup('timeout-leak');

      vi.advanceTimersByTime(15000);

      // should not trigger timeout callback
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
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
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('manual abort')
      );
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
      expect(mockLogger.info).not.toHaveBeenCalled();
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

      expect(plugin['controllers'].has('abort-cleanup')).toBe(false);
      expect(plugin['timeouts'].has('abort-cleanup')).toBe(false);
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

      expect(plugin['controllers'].size).toBe(0);
      expect(plugin['timeouts'].size).toBe(0);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('aborting all 3 requests')
      );
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
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
    });

    it('should handle case when there are no requests', () => {
      expect(() => plugin.abortAll()).not.toThrow();
      expect(mockLogger.debug).not.toHaveBeenCalled();
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
      expect(plugin['controllers'].has('integration-test')).toBe(false);
    });

    it('should handle timeout scenario', () => {
      const onAborted = vi.fn();
      const config: AbortPluginConfig = {
        id: 'timeout-integration',
        abortTimeout: 2000,
        onAborted
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
      expect(onAborted).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
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

      expect(plugin['controllers'].size).toBe(10);

      // abort half
      for (let i = 0; i < 5; i++) {
        plugin.abort(`concurrent-${i}`);
      }

      expect(plugin['controllers'].size).toBe(5);

      // abort all
      plugin.abortAll();

      expect(plugin['controllers'].size).toBe(0);
      expect(plugin['timeouts'].size).toBe(0);
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
      expect(plugin['controllers'].size).toBe(1);
      expect(plugin['timeouts'].size).toBe(1);
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

      // negative value should be ignored
      expect(plugin['timeouts'].has('negative-timeout')).toBe(false);
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

      // should catch callback error without affecting main flow
      expect(() => plugin.abort(config)).toThrow('Callback error');
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

      expect(plugin['controllers'].has('multi-cleanup')).toBe(false);
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
