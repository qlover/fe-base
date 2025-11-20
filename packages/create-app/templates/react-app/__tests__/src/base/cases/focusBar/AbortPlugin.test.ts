import { ExecutorError } from '@qlover/fe-corekit';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type {
  AbortPluginConfig,
  AbortConfigExtractor
} from '@/base/focusBar/impl/AbortPlugin';
import {
  AbortPlugin,
  AbortError,
  ABORT_ERROR_ID
} from '@/base/focusBar/impl/AbortPlugin';
import type { ExecutorContext } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

describe('AbortError', () => {
  describe('构造函数', () => {
    it('应该正确创建 AbortError 实例', () => {
      const error = new AbortError('Test abort', 'test-id', 1000);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ExecutorError);
      expect(error).toBeInstanceOf(AbortError);
      expect(error.message).toBe('Test abort');
      expect(error.id).toBe(ABORT_ERROR_ID);
      expect(error.abortId).toBe('test-id');
      expect(error.timeout).toBe(1000);
    });

    it('应该支持不传递 abortId 和 timeout', () => {
      const error = new AbortError('Test abort');

      expect(error.message).toBe('Test abort');
      expect(error.abortId).toBeUndefined();
      expect(error.timeout).toBeUndefined();
    });
  });

  describe('isTimeout', () => {
    it('应该在设置了有效超时时间时返回 true', () => {
      const error = new AbortError('Timeout', 'id', 5000);
      expect(error.isTimeout()).toBe(true);
    });

    it('应该在超时时间为 0 时返回 false', () => {
      const error = new AbortError('Timeout', 'id', 0);
      expect(error.isTimeout()).toBe(false);
    });

    it('应该在没有超时时间时返回 false', () => {
      const error = new AbortError('Abort', 'id');
      expect(error.isTimeout()).toBe(false);
    });
  });

  describe('getDescription', () => {
    it('应该返回包含 abortId 和 timeout 的描述', () => {
      const error = new AbortError('Operation aborted', 'req-123', 3000);
      const description = error.getDescription();

      expect(description).toContain('Operation aborted');
      expect(description).toContain('Request: req-123');
      expect(description).toContain('Timeout: 3000ms');
    });

    it('应该返回只包含 abortId 的描述', () => {
      const error = new AbortError('Operation aborted', 'req-123');
      const description = error.getDescription();

      expect(description).toContain('Operation aborted');
      expect(description).toContain('Request: req-123');
      expect(description).not.toContain('Timeout');
    });

    it('应该返回只包含 timeout 的描述', () => {
      const error = new AbortError('Operation aborted', undefined, 3000);
      const description = error.getDescription();

      expect(description).toContain('Operation aborted');
      expect(description).toContain('Timeout: 3000ms');
      expect(description).not.toContain('Request:');
    });

    it('应该在没有额外信息时返回原始消息', () => {
      const error = new AbortError('Operation aborted');
      const description = error.getDescription();

      expect(description).toBe('Operation aborted');
    });
  });
});

describe('AbortPlugin', () => {
  let plugin: AbortPlugin;
  let mockLogger: LoggerInterface;

  beforeEach(() => {
    vi.useFakeTimers();
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    } as any;

    plugin = new AbortPlugin({ logger: mockLogger });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('构造函数', () => {
    it('应该正确初始化基本属性', () => {
      expect(plugin.pluginName).toBe('AbortPlugin');
      expect(plugin.onlyOne).toBe(true);
    });

    it('应该使用默认的 config 提取器', () => {
      const config: AbortPluginConfig = { id: 'test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      expect(context.parameters.signal).toBeInstanceOf(AbortSignal);
    });

    it('应该支持自定义 config 提取器', () => {
      interface CustomParams {
        requestConfig: AbortPluginConfig;
        otherData: string;
      }

      const getConfig: AbortConfigExtractor<CustomParams> = (params) =>
        params.requestConfig;

      const customPlugin = new AbortPlugin<CustomParams>({ getConfig });

      const context: ExecutorContext<CustomParams> = {
        parameters: {
          requestConfig: { id: 'custom-id' },
          otherData: 'test'
        }
      } as any;

      customPlugin.onBefore(context);

      expect(context.parameters.requestConfig.signal).toBeInstanceOf(
        AbortSignal
      );
    });
  });

  describe('isAbortError 静态方法', () => {
    it('应该识别 AbortError 实例', () => {
      const error = new AbortError('Test');
      expect(AbortPlugin.isAbortError(error)).toBe(true);
    });

    it('应该识别 name 为 AbortError 的 Error', () => {
      const error = new Error('Test');
      error.name = 'AbortError';
      expect(AbortPlugin.isAbortError(error)).toBe(true);
    });

    it('应该识别 id 为 ABORT_ERROR_ID 的 ExecutorError', () => {
      const error = new ExecutorError(ABORT_ERROR_ID, 'Test');
      expect(AbortPlugin.isAbortError(error)).toBe(true);
    });

    it('应该识别 DOMException AbortError', () => {
      const error = new DOMException('Test', 'AbortError');
      expect(AbortPlugin.isAbortError(error)).toBe(true);
    });

    it('应该识别 abort 类型的 Event', () => {
      const event = new Event('abort');
      expect(AbortPlugin.isAbortError(event)).toBe(true);
    });

    it('应该对非 abort 错误返回 false', () => {
      expect(AbortPlugin.isAbortError(new Error('Test'))).toBe(false);
      expect(AbortPlugin.isAbortError(undefined)).toBe(false);
      expect(AbortPlugin.isAbortError(null)).toBe(false);
      expect(AbortPlugin.isAbortError('string')).toBe(false);
      expect(AbortPlugin.isAbortError(123)).toBe(false);
    });
  });

  describe('generateRequestKey', () => {
    it('应该优先使用 requestId', () => {
      const config: AbortPluginConfig = {
        requestId: 'req-123',
        id: 'id-456'
      };

      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('应该使用 id 作为备选', () => {
      const config: AbortPluginConfig = {
        id: 'id-456'
      };

      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      expect(context.parameters.signal).toBeDefined();
    });

    it('应该在没有 id 时生成自增计数器', () => {
      const context1: ExecutorContext<AbortPluginConfig> = {
        parameters: {}
      } as any;

      const context2: ExecutorContext<AbortPluginConfig> = {
        parameters: {}
      } as any;

      plugin.onBefore(context1);
      plugin.onBefore(context2);

      expect(context1.parameters.signal).toBeDefined();
      expect(context2.parameters.signal).toBeDefined();
      expect(context1.parameters.signal).not.toBe(context2.parameters.signal);
    });
  });

  describe('onBefore', () => {
    it('应该创建 AbortController 并设置 signal', () => {
      const config: AbortPluginConfig = { id: 'test-1' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      expect(config.signal).toBeInstanceOf(AbortSignal);
      expect(config.signal?.aborted).toBe(false);
    });

    it('应该不覆盖已存在的 signal', () => {
      const existingController = new AbortController();
      const config: AbortPluginConfig = {
        id: 'test-2',
        signal: existingController.signal
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      expect(config.signal).toBe(existingController.signal);
    });

    it('应该在重复请求时中止前一个请求', () => {
      const config1: AbortPluginConfig = { id: 'same-id' };
      const context1: ExecutorContext<AbortPluginConfig> = {
        parameters: config1
      } as any;

      plugin.onBefore(context1);
      const firstSignal = config1.signal;

      const config2: AbortPluginConfig = { id: 'same-id' };
      const context2: ExecutorContext<AbortPluginConfig> = {
        parameters: config2
      } as any;

      plugin.onBefore(context2);

      expect(firstSignal?.aborted).toBe(true);
      expect(config2.signal?.aborted).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('aborting previous request')
      );
    });

    it('应该设置超时定时器', () => {
      const config: AbortPluginConfig = {
        id: 'timeout-test',
        abortTimeout: 5000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      expect(config.signal?.aborted).toBe(false);

      // 推进时间
      vi.advanceTimersByTime(5000);

      expect(config.signal?.aborted).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
    });

    it('应该在超时时触发 onAborted 回调', () => {
      const onAborted = vi.fn();
      const config: AbortPluginConfig = {
        id: 'callback-test',
        abortTimeout: 3000,
        onAborted
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      vi.advanceTimersByTime(3000);

      expect(onAborted).toHaveBeenCalledTimes(1);
      expect(onAborted).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'callback-test',
          onAborted: undefined // 应该被移除以防止循环调用
        })
      );
    });

    it('应该忽略无效的超时时间', () => {
      const config: AbortPluginConfig = {
        id: 'invalid-timeout',
        abortTimeout: 0
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      vi.advanceTimersByTime(10000);

      expect(config.signal?.aborted).toBe(false);
    });
  });

  describe('onSuccess', () => {
    it('应该清理资源', () => {
      const config: AbortPluginConfig = { id: 'success-test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);
      expect(config.signal).toBeDefined();

      plugin.onSuccess(context);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cleanup')
      );
    });

    it('应该清除超时定时器', () => {
      const config: AbortPluginConfig = {
        id: 'timeout-cleanup',
        abortTimeout: 5000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);
      plugin.onSuccess(context);

      // 推进时间，不应该触发超时
      vi.advanceTimersByTime(10000);

      expect(config.signal?.aborted).toBe(false);
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
    });

    it('应该处理没有 parameters 的情况', () => {
      const context: ExecutorContext<any> = {} as any;

      expect(() => plugin.onSuccess(context)).not.toThrow();
    });
  });

  describe('onError', () => {
    it('应该处理 AbortError 并返回标准化错误', () => {
      const config: AbortPluginConfig = { id: 'error-test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: new AbortError('Test abort', 'error-test')
      } as any;

      plugin.onBefore(context);

      const result = plugin.onError(context);

      expect(result).toBeInstanceOf(AbortError);
      expect((result as AbortError).message).toContain('abort');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cleanup')
      );
    });

    it('应该返回 signal.reason 中的 AbortError', () => {
      const config: AbortPluginConfig = { id: 'reason-test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      const customError = new AbortError('Custom abort', 'reason-test', 2000);
      const controller = plugin['controllers'].get('reason-test');
      controller?.abort(customError);

      context.error = new DOMException('Aborted', 'AbortError');

      const result = plugin.onError(context);

      expect(result).toBe(customError);
      expect((result as AbortError).timeout).toBe(2000);
    });

    it('应该在非 abort 错误时也清理资源', () => {
      const config: AbortPluginConfig = { id: 'other-error' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config,
        error: new Error('Some other error')
      } as any;

      plugin.onBefore(context);
      plugin.onError(context);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cleanup')
      );
    });

    it('应该处理没有 parameters 的情况', () => {
      const context: ExecutorContext<any> = {
        error: new AbortError('Test')
      } as any;

      const result = plugin.onError(context);

      expect(result).toBeUndefined();
    });
  });

  describe('cleanup', () => {
    it('应该清理指定的 controller 和 timeout', () => {
      const config: AbortPluginConfig = {
        id: 'cleanup-test',
        abortTimeout: 5000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

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

    it('应该支持传入 config 对象', () => {
      const config: AbortPluginConfig = { id: 'config-cleanup' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);
      plugin.cleanup(config);

      expect(plugin['controllers'].has('config-cleanup')).toBe(false);
    });

    it('应该处理不存在的 key', () => {
      expect(() => plugin.cleanup('non-existent')).not.toThrow();
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('应该清除超时定时器防止内存泄漏', () => {
      const config: AbortPluginConfig = {
        id: 'timeout-leak',
        abortTimeout: 10000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      const timeoutId = plugin['timeouts'].get('timeout-leak');
      expect(timeoutId).toBeDefined();

      plugin.cleanup('timeout-leak');

      vi.advanceTimersByTime(15000);

      // 不应该触发超时回调
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
    });
  });

  describe('abort', () => {
    it('应该手动中止请求', () => {
      const config: AbortPluginConfig = { id: 'manual-abort' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      const result = plugin.abort('manual-abort');

      expect(result).toBe(true);
      expect(config.signal?.aborted).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('manual abort')
      );
    });

    it('应该支持传入 config 对象', () => {
      const config: AbortPluginConfig = { id: 'config-abort' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      const result = plugin.abort(config);

      expect(result).toBe(true);
      expect(config.signal?.aborted).toBe(true);
    });

    it('应该在中止时触发 onAborted 回调', () => {
      const onAborted = vi.fn();
      const config: AbortPluginConfig = {
        id: 'abort-callback',
        onAborted
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

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

    it('应该在请求不存在时返回 false', () => {
      const result = plugin.abort('non-existent-request');

      expect(result).toBe(false);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('应该在中止后清理资源', () => {
      const config: AbortPluginConfig = {
        id: 'abort-cleanup',
        abortTimeout: 5000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);
      plugin.abort('abort-cleanup');

      expect(plugin['controllers'].has('abort-cleanup')).toBe(false);
      expect(plugin['timeouts'].has('abort-cleanup')).toBe(false);
    });
  });

  describe('abortAll', () => {
    it('应该中止所有请求', () => {
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

    it('应该清除所有超时定时器', () => {
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

      // 不应该触发任何超时回调
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
    });

    it('应该处理没有请求的情况', () => {
      expect(() => plugin.abortAll()).not.toThrow();
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });
  });

  describe('raceWithAbort', () => {
    it('应该在没有 signal 时返回原 promise', async () => {
      const promise = Promise.resolve('result');

      const result = await plugin.raceWithAbort(promise);

      expect(result).toBe('result');
    });

    it('应该在 promise 先完成时返回结果', async () => {
      const controller = new AbortController();
      const promise = Promise.resolve('success');

      const result = await plugin.raceWithAbort(promise, controller.signal);

      expect(result).toBe('success');
    });

    it('应该在 signal abort 时 reject', async () => {
      const controller = new AbortController();
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('too late'), 1000);
      });

      const racePromise = plugin.raceWithAbort(promise, controller.signal);

      controller.abort(new AbortError('Manual abort'));

      await expect(racePromise).rejects.toThrow();
    });

    it('应该在 signal 已经 aborted 时立即 reject', async () => {
      const controller = new AbortController();
      controller.abort(new AbortError('Already aborted'));

      // 使用延迟的 promise 确保 abort promise 先完成
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('result'), 100);
      });

      await expect(
        plugin.raceWithAbort(promise, controller.signal)
      ).rejects.toThrow();
    });

    it('应该清理事件监听器防止内存泄漏', async () => {
      const controller = new AbortController();
      const promise = Promise.resolve('result');

      const removeEventListenerSpy = vi.spyOn(
        controller.signal,
        'removeEventListener'
      );

      await plugin.raceWithAbort(promise, controller.signal);

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('应该在 promise reject 时也清理监听器', async () => {
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

    it('应该使用 signal.reason 作为 reject 原因', async () => {
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

  describe('集成测试', () => {
    it('应该完整处理一个请求生命周期', async () => {
      const config: AbortPluginConfig = { id: 'integration-test' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      // Before
      plugin.onBefore(context);
      expect(config.signal).toBeInstanceOf(AbortSignal);
      expect(config.signal?.aborted).toBe(false);

      // Success
      plugin.onSuccess(context);
      expect(plugin['controllers'].has('integration-test')).toBe(false);
    });

    it('应该处理超时场景', () => {
      const onAborted = vi.fn();
      const config: AbortPluginConfig = {
        id: 'timeout-integration',
        abortTimeout: 2000,
        onAborted
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      expect(config.signal?.aborted).toBe(false);

      vi.advanceTimersByTime(2000);

      expect(config.signal?.aborted).toBe(true);
      expect(onAborted).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('timeout abort')
      );
    });

    it('应该处理手动中止场景', () => {
      const config: AbortPluginConfig = { id: 'manual-integration' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);
      plugin.abort('manual-integration');

      expect(config.signal?.aborted).toBe(true);

      context.error = new DOMException('Aborted', 'AbortError');
      const error = plugin.onError(context);

      expect(error).toBeInstanceOf(AbortError);
    });

    it('应该处理多个并发请求', () => {
      const configs = Array.from({ length: 10 }, (_, i) => ({
        id: `concurrent-${i}`
      }));

      const contexts = configs.map((config) => ({
        parameters: config
      })) as ExecutorContext<AbortPluginConfig>[];

      contexts.forEach((ctx) => plugin.onBefore(ctx));

      expect(plugin['controllers'].size).toBe(10);

      // 中止一半
      for (let i = 0; i < 5; i++) {
        plugin.abort(`concurrent-${i}`);
      }

      expect(plugin['controllers'].size).toBe(5);

      // 中止全部
      plugin.abortAll();

      expect(plugin['controllers'].size).toBe(0);
      expect(plugin['timeouts'].size).toBe(0);
    });

    it('应该防止重复请求导致的资源泄漏', () => {
      const config: AbortPluginConfig = { id: 'repeated', abortTimeout: 5000 };

      for (let i = 0; i < 100; i++) {
        const context: ExecutorContext<AbortPluginConfig> = {
          parameters: { ...config }
        } as any;
        plugin.onBefore(context);
      }

      // 应该只保留最后一个
      expect(plugin['controllers'].size).toBe(1);
      expect(plugin['timeouts'].size).toBe(1);
    });

    it('应该正确处理 raceWithAbort 与生命周期的集成', async () => {
      const config: AbortPluginConfig = { id: 'race-integration' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('result'), 5000);
      });

      const racePromise = plugin.raceWithAbort(slowPromise, config.signal);

      // 使用 fake timers 推进时间，立即中止
      plugin.abort('race-integration');

      await expect(racePromise).rejects.toThrow();
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串作为 id', () => {
      const config: AbortPluginConfig = { id: '' };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      expect(() => plugin.onBefore(context)).not.toThrow();
      expect(config.signal).toBeDefined();
    });

    it('应该处理非常大的超时值', () => {
      const config: AbortPluginConfig = {
        id: 'large-timeout',
        abortTimeout: Number.MAX_SAFE_INTEGER
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      expect(() => plugin.onBefore(context)).not.toThrow();
      expect(config.signal?.aborted).toBe(false);
    });

    it('应该处理负数超时值', () => {
      const config: AbortPluginConfig = {
        id: 'negative-timeout',
        abortTimeout: -1000
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      // 负数应该被忽略
      expect(plugin['timeouts'].has('negative-timeout')).toBe(false);
    });

    it('应该处理 onAborted 回调抛出错误', () => {
      const config: AbortPluginConfig = {
        id: 'callback-error',
        onAborted: () => {
          throw new Error('Callback error');
        }
      };
      const context: ExecutorContext<AbortPluginConfig> = {
        parameters: config
      } as any;

      plugin.onBefore(context);

      // 应该捕获回调错误，不影响主流程
      expect(() => plugin.abort(config)).toThrow('Callback error');
    });
  });
});
