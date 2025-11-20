import { ExecutorError } from '@qlover/fe-corekit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageSender } from '@/base/focusBar/impl/MessageSender';
import type {
  MessageSenderContext,
  MessageSenderPlugin
} from '@/base/focusBar/impl/MessageSenderExecutor';
import {
  MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';
import type { MessageGetwayInterface } from '@/base/focusBar/interface/MessageGetwayInterface';
import type { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

// 测试用的消息类型
interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

describe('MessageSender', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    // 创建 store
    store = new MessagesStore(() => ({
      messages: []
    }));

    // 创建 mock gateway
    mockGateway = {
      sendMessage: vi.fn().mockResolvedValue({ result: 'Gateway response' })
    };

    // 创建 service
    service = new MessageSender(store, {
      gateway: mockGateway
    });
  });

  describe('构造函数', () => {
    it('应该正确初始化', () => {
      expect(service.getMessageStore()).toBe(store);
      expect(service.getGateway()).toBe(mockGateway);
    });

    it('应该支持不传递 config', () => {
      const minimalService = new MessageSender(store);
      expect(minimalService.getMessageStore()).toBe(store);
      expect(minimalService.getGateway()).toBeUndefined();
    });

    it('应该支持只传递 gateway', () => {
      const serviceWithGateway = new MessageSender(store, {
        gateway: mockGateway
      });
      expect(serviceWithGateway.getGateway()).toBe(mockGateway);
    });

    it('应该正确设置 throwIfError 配置', () => {
      const serviceWithThrow = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });
      expect(serviceWithThrow['config']?.throwIfError).toBe(true);

      const serviceWithoutThrow = new MessageSender(store, {
        gateway: mockGateway
      });
      expect(serviceWithoutThrow['config']?.throwIfError).toBeUndefined();
    });
  });

  describe('send - 基础功能', () => {
    it('应该成功发送消息对象', async () => {
      const message = {
        content: 'Test message'
      };

      const result = await service.send(message);

      expect(result).toBeDefined();
      expect(result.content).toBe('Test message');
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
      expect(result.endTime).toBeGreaterThan(0);
    });

    it('应该调用 gateway 发送消息', async () => {
      const message = { content: 'Test' };

      await service.send(message);

      expect(mockGateway.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockGateway.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test',
          status: MessageStatus.SENDING
        }),
        expect.objectContaining({
          onChunk: expect.any(Function),
          onConnected: expect.any(Function)
        })
      );
    });

    it('应该不自动操作 store', async () => {
      const message = { content: 'Test' };

      await service.send(message);

      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('应该正确设置消息的初始状态', async () => {
      const message = { content: 'Test' };

      const result = await service.send(message);

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);
    });

    it('应该支持发送带有额外属性的消息对象', async () => {
      const message = {
        content: 'Test',
        placeholder: 'Typing...',
        customField: 'custom value'
      };

      const result = await service.send(message);

      expect(result.content).toBe('Test');
      expect(result.placeholder).toBe('Typing...');
      expect((result as any).customField).toBe('custom value');
    });
  });

  describe('send - 错误处理', () => {
    it('默认模式：发送失败时返回失败消息（不抛出错误）', async () => {
      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      const result = await service.send({ content: 'Failed message' });

      expect(result).toBeDefined();
      expect(result.content).toBe('Failed message');
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe(
        service['messageSenderErrorId']
      );
    });

    it('throwIfError=true：发送失败时抛出错误', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      await expect(
        errorService.send({ content: 'Failed message' })
      ).rejects.toBeInstanceOf(ExecutorError);

      await expect(
        errorService.send({ content: 'Failed message' })
      ).rejects.toMatchObject({
        message: error.message
      });
    });

    it('throwIfError=true 时，成功的消息应正常返回', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      mockGateway.sendMessage = vi.fn().mockResolvedValue({
        result: 'Success'
      });

      const result = await errorService.send({ content: 'Success message' });

      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
    });

    it('应该将 UNKNOWN_ASYNC_ERROR 改写为 MESSAGE_SENDER_ERROR', async () => {
      const unknownError = new ExecutorError('Unknown error');
      unknownError.id = 'UNKNOWN_ASYNC_ERROR';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(unknownError);

      const result = await service.send({ content: 'Test' });

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe('MESSAGE_SENDER_ERROR');
    });

    it('不应该修改其他 ExecutorError 的 ID', async () => {
      const customError = new ExecutorError('Custom error');
      customError.id = 'CUSTOM_ERROR_ID';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(customError);

      const result = await service.send({ content: 'Test' });

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe('CUSTOM_ERROR_ID');
    });
  });

  describe('send - 完整流程', () => {
    it('应该完成完整的成功发送流程', async () => {
      const result = await service.send({
        content: 'Hello World',
        placeholder: 'Sending...'
      });

      expect(result.content).toBe('Hello World');
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
      expect(mockGateway.sendMessage).toHaveBeenCalledTimes(1);

      // MessageSender 不自动操作 store
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('应该完成完整的失败发送流程', async () => {
      const error = new Error('Send failed');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      const result = await service.send({
        content: 'Failed Message'
      });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);
      expect(result.error).toBeInstanceOf(ExecutorError);
    });

    it('应该支持连续发送多条消息', async () => {
      const result1 = await service.send({ content: 'Message 1' });
      const result2 = await service.send({ content: 'Message 2' });
      const result3 = await service.send({ content: 'Message 3' });

      expect(result1.status).toBe(MessageStatus.SENT);
      expect(result2.status).toBe(MessageStatus.SENT);
      expect(result3.status).toBe(MessageStatus.SENT);

      // MessageSender 不自动操作 store
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });
  });

  describe('插件系统 (use 方法)', () => {
    it('应该支持使用插件', () => {
      const plugin = {
        pluginName: 'test-plugin'
      };

      const result = service.use(plugin);

      // use 方法应该返回 this 以支持链式调用
      expect(result).toBe(service);
    });

    it('插件应该能够访问和修改 context', async () => {
      let capturedContext: ExecutorContext<MessageSenderContext<any>> | null =
        null;

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'context-capture',
        onBefore(ctx) {
          capturedContext = ctx;
        }
      };

      service.use(plugin);

      await service.send({ content: 'Test' });

      expect(capturedContext).toBeDefined();
      expect(capturedContext!.parameters.store).toBe(store);
      expect(capturedContext!.parameters.currentMessage).toBeDefined();
      expect(capturedContext!.parameters.currentMessage.content).toBe('Test');
    });

    it('插件应该能够修改消息', async () => {
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'message-modifier',
        onBefore({ parameters }) {
          parameters.currentMessage.content = 'Modified by plugin';
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Original' });

      expect(result.content).toBe('Modified by plugin');
    });

    it('插件抛出错误时，throwIfError 为 false 应该返回失败消息', async () => {
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'error-plugin',
        onExec() {
          throw new Error('Plugin error');
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      expect(result.error).toBeInstanceOf(ExecutorError);
    });

    it('插件抛出错误时，throwIfError 为 true 应该抛出错误', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'error-plugin',
        onExec() {
          throw new Error('Plugin error');
        }
      };

      errorService.use(plugin);

      await expect(
        errorService.send({ content: 'Test' })
      ).rejects.toBeInstanceOf(ExecutorError);
    });

    it('插件可以阻止消息发送', async () => {
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'block-plugin',
        onExec(ctx, _send) {
          const parameters = ctx.parameters as MessageSenderContext<any>;
          // 不调用 send()，阻止后续执行
          // send(parameters.currentMessage, ctx);

          return store.mergeMessage(parameters.currentMessage, {
            status: MessageStatus.FAILED,
            error: new Error('Blocked by plugin'),
            loading: false
          });
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      // gateway 不应该被调用
      expect(mockGateway.sendMessage).not.toHaveBeenCalled();

      // 应该返回失败消息
      expect(result.status).toBe(MessageStatus.FAILED);
      expect((result.error as Error)?.message).toBe('Blocked by plugin');
    });

    it('插件可以在发送后处理结果', async () => {
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'result-processor',
        onSuccess(ctx) {
          Object.assign(ctx.returnValue!, {
            result: {
              ...(ctx.returnValue as MessageStoreMsg<any>).result!,
              processedBy: 'plugin'
            }
          });
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });
      expect(result.result).toBeDefined();
      expect((result.result as any).result).toBe('Gateway response');
      expect((result.result as any).processedBy).toBe('plugin');
    });

    it('插件错误不应该影响其他消息的发送', async () => {
      const errorPlugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'conditional-error',
        onExec(ctx, next) {
          if (
            (ctx.parameters as MessageSenderContext<any>).currentMessage
              .content === 'error'
          ) {
            throw new Error('Conditional error');
          }
          return next(ctx);
        }
      };

      service.use(errorPlugin);

      // 第一条消息成功
      const result1 = await service.send({ content: 'success' });
      expect(result1.status).toBe(MessageStatus.SENT);

      // 第二条消息触发插件错误
      const result2 = await service.send({ content: 'error' });
      expect(result2.status).toBe(MessageStatus.FAILED);
      expect(result2.error).toBeInstanceOf(ExecutorError);

      // 第三条消息成功
      const result3 = await service.send({ content: 'success again' });
      expect(result3.status).toBe(MessageStatus.SENT);
    });
  });

  describe('插件错误与 throwIfError 组合测试', () => {
    it('插件在 before 阶段抛出错误 + throwIfError=false', async () => {
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'before-error',
        onBefore() {
          throw new Error('Before error');
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).message).toBe('Before error');
    });

    it('插件在 before 阶段抛出错误 + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'before-error',
        onBefore() {
          throw new Error('Before error');
        }
      };

      errorService.use(plugin);

      await expect(errorService.send({ content: 'Test' })).rejects.toThrow(
        'Before error'
      );
    });

    it('插件在 after 阶段抛出错误 + throwIfError=false', async () => {
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'after-error',
        onSuccess() {
          throw new Error('After error');
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).message).toBe('After error');
    });

    it('插件在 after 阶段抛出错误 + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'after-error',
        onSuccess() {
          throw new Error('After error');
        }
      };

      errorService.use(plugin);

      await expect(
        errorService.send({ content: 'Test' })
      ).rejects.toBeInstanceOf(ExecutorError);
    });

    it('sendMessage 失败 + 插件捕获错误 + throwIfError=false', async () => {
      const sendError = new Error('Send failed');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(sendError);

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'error-handler',
        async onExec(ctx, next) {
          const parameters = ctx.parameters as MessageSenderContext<any>;
          try {
            return await next(ctx);
          } catch {
            // 插件捕获错误但不重新抛出
            parameters.currentMessage = store.mergeMessage(
              parameters.currentMessage,
              {
                status: MessageStatus.FAILED,
                error: new Error('Handled by plugin'),
                loading: false
              }
            );
            return parameters.currentMessage;
          }
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      // 插件处理了错误，所以应该返回插件设置的错误消息
      expect(result.status).toBe(MessageStatus.FAILED);
      expect((result.error as Error)?.message).toBe('Handled by plugin');
    });

    it('多个插件，其中一个抛出错误 + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin1: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'plugin-1',
        onBefore() {
          // do nothing
        }
      };

      const plugin2: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'plugin-2-error',
        onExec() {
          throw new Error('Plugin 2 error');
        }
      };

      const plugin3: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'plugin-3',
        onBefore() {
          // do nothing
        }
      };

      errorService.use(plugin1).use(plugin2).use(plugin3);

      await expect(errorService.send({ content: 'Test' })).rejects.toThrow(
        'Plugin 2 error'
      );
    });

    it('gateway 错误和插件错误同时存在', async () => {
      const sendError = new Error('Gateway error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(sendError);

      // 插件错误后抛出, 得到gateway返回的错误
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'after-error',
        async onExec(ctx, next) {
          await next(ctx);
          throw new ExecutorError('Plugin error');
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });
      // 应该返回插件错误（后抛出的错误）
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as unknown as ExecutorError).message).toBe(
        'Gateway error'
      );

      // 应该返回gateway返回的错误
      // 插件错误后抛出, 得到gateway返回的错误
      const plugin2: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'after-error',
        onBefore() {
          throw new ExecutorError('Plugin error');
        },
        async onExec(ctx, next) {
          return await next(ctx);
        }
      };

      service.use(plugin2);

      const result2 = await service.send({ content: 'Test' });
      // 应该返回插件错误（后抛出的错误）
      expect(result2.error).toBeInstanceOf(Error);
      expect((result2.error as unknown as ExecutorError).message).toBe(
        'Plugin error'
      );
    });

    it('插件返回 ExecutorError 实例 + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'executor-error',
        onExec() {
          throw new ExecutorError('Custom executor error');
        }
      };

      errorService.use(plugin);

      await expect(
        errorService.send({ content: 'Test' })
      ).rejects.toBeInstanceOf(ExecutorError);

      try {
        await errorService.send({ content: 'Test' });
      } catch (error) {
        expect((error as ExecutorError).message).toBe('Custom executor error');
      }
    });

    it('插件执行代码错误 + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'executor-error',
        onBefore() {
          // 模拟真实的代码错误：访问未定义对象的属性
          const undefinedObject: any = undefined;
          undefinedObject.someProperty.nestedProperty = 'value';
        }
      };

      errorService.use(plugin);

      await expect(errorService.send({ content: 'Test' })).rejects.toThrow(
        "Cannot read properties of undefined (reading 'someProperty')"
      );
    });
  });

  describe('边界情况', () => {
    it('应该处理空 content 的消息对象', async () => {
      const result = await service.send({ content: '' });
      expect(result.content).toBe('');
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('应该处理 null/undefined content', async () => {
      const result1 = await service.send({ content: null as any });
      expect(result1.content).toBeNull();

      const result2 = await service.send({ content: undefined });
      expect(result2.content).toBeUndefined();
    });

    it('应该处理空消息对象', async () => {
      const result = await service.send({});
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('应该处理 gateway 未定义的情况', async () => {
      const serviceWithoutGateway = new MessageSender(store);

      const result = await serviceWithoutGateway.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
    });
  });

  describe('时间戳验证', () => {
    it('成功消息的 endTime 应该大于等于 startTime', async () => {
      const result = await service.send({ content: 'Test' });

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);
    });

    it('失败消息的 endTime 应该大于等于 startTime', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await service.send({ content: 'Test' });

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);
    });

    it('插件可以修改 startTime', async () => {
      const customStartTime = Date.now() - 1000;

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'start-time-modifier',
        onBefore({ parameters }) {
          parameters.currentMessage.startTime = customStartTime;
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      expect(result.startTime).toBe(customStartTime);
      expect(result.endTime).toBeGreaterThan(customStartTime);
    });
  });

  describe('网关返回值处理', () => {
    it('应该处理 gateway 返回 null', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(null);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toBeNull();
    });

    it('应该处理 gateway 返回 undefined', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(undefined);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toBeUndefined();
    });

    it('应该处理 gateway 返回复杂对象', async () => {
      const complexResult = {
        data: { nested: { value: 123 } },
        metadata: { timestamp: Date.now() },
        array: [1, 2, 3]
      };

      mockGateway.sendMessage = vi.fn().mockResolvedValue(complexResult);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toEqual(complexResult);
    });

    it('应该处理 gateway 返回原始类型', async () => {
      // 字符串
      mockGateway.sendMessage = vi.fn().mockResolvedValue('string result');
      const result1 = await service.send({ content: 'Test' });
      expect(result1.result).toBe('string result');

      // 数字
      mockGateway.sendMessage = vi.fn().mockResolvedValue(42);
      const result2 = await service.send({ content: 'Test' });
      expect(result2.result).toBe(42);

      // 布尔值
      mockGateway.sendMessage = vi.fn().mockResolvedValue(true);
      const result3 = await service.send({ content: 'Test' });
      expect(result3.result).toBe(true);
    });
  });

  describe('并发场景', () => {
    it('应该支持并发发送多条消息', async () => {
      const promises = [
        service.send({ content: 'Message 1' }),
        service.send({ content: 'Message 2' }),
        service.send({ content: 'Message 3' })
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.status).toBe(MessageStatus.SENT);
        expect(result.loading).toBe(false);
      });
    });

    it('并发发送时，部分失败不影响其他消息', async () => {
      let callCount = 0;
      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error('Second message failed'));
        }
        return Promise.resolve({ result: `Success ${callCount}` });
      });

      const promises = [
        service.send({ content: 'Message 1' }),
        service.send({ content: 'Message 2' }), // 这条会失败
        service.send({ content: 'Message 3' })
      ];

      const results = await Promise.all(promises);

      expect(results[0].status).toBe(MessageStatus.SENT);
      expect(results[1].status).toBe(MessageStatus.FAILED);
      expect(results[2].status).toBe(MessageStatus.SENT);
    });
  });

  describe('消息对象的完整性', () => {
    it('发送的消息应该包含所有必要字段', async () => {
      const result = await service.send({ content: 'Test' });

      // 验证所有必要字段
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('loading');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('endTime');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('error');

      // 验证默认值
      expect(result.id).toBeTruthy();
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('应该支持自定义消息 ID', async () => {
      const customId = 'custom-message-id-123';

      const result = await service.send({
        id: customId,
        content: 'Test'
      });

      expect(result.id).toBe(customId);
    });

    it('失败消息的 error 字段应该被正确设置', async () => {
      const testError = new Error('Test error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      const result = await service.send({ content: 'Test' });

      expect(result.error).toBeDefined();
      expect(result.result).toBeNull();
      expect(result.status).toBe(MessageStatus.FAILED);
    });

    it('返回的对象和传入的对象不能是同一个引用', async () => {
      const message = {
        content: 'Test'
      };
      const result = await service.send(message);
      expect(result).not.toBe(message);

      message.content = 'Test2';
      expect(result.content).toBe('Test');
    });
  });

  describe('插件 Context 完整性', () => {
    it('插件应该能访问完整的 context', async () => {
      let capturedContext: MessageSenderContext<any> | null = null;

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'context-inspector',
        onExec(ctx, next) {
          capturedContext = ctx.parameters as MessageSenderContext<any>;
          return next(ctx);
        }
      };

      service.use(plugin);

      await service.send({ content: 'Test' });

      expect(capturedContext).toBeDefined();
      expect(capturedContext!.store).toBe(store);
      expect(capturedContext!.currentMessage).toBeDefined();
      expect(capturedContext!.currentMessage.content).toBe('Test');
    });

    it('多个插件依次修改 currentMessage 应该累积生效', async () => {
      const plugin1: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'add-prefix',
        onBefore({ parameters }) {
          parameters.currentMessage.content = `[P1] ${parameters.currentMessage.content}`;
        }
      };

      const plugin2: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'add-suffix',
        onBefore({ parameters }) {
          parameters.currentMessage.content = `${parameters.currentMessage.content} [P2]`;
        }
      };

      service.use(plugin1).use(plugin2);

      const result = await service.send({ content: 'Test' });

      expect(result.content).toBe('[P1] Test [P2]');
    });

    it('插件可以在不同生命周期修改不同属性', async () => {
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'lifecycle-modifier',
        onBefore({ parameters }) {
          parameters.currentMessage.placeholder = 'Modified placeholder';
        },
        onSuccess(ctx) {
          const msg = ctx.returnValue as MessageStoreMsg<any>;
          const currentResult =
            typeof msg.result === 'object' && msg.result !== null
              ? msg.result
              : {};
          msg.result = {
            ...currentResult,
            enhancedBy: 'plugin'
          };
        }
      };

      service.use(plugin);

      const result = await service.send({
        content: 'Test',
        placeholder: 'Original'
      });

      expect(result.placeholder).toBe('Modified placeholder');
      expect(result.result).toHaveProperty('enhancedBy', 'plugin');
    });
  });

  describe('消息重试', () => {
    it('应该支持错误消息重试(错误消息保存到store中)', async () => {
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Test error'));

      const result = await service.send({ content: 'failed' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe('Test error');

      // 保存到store中的消息应该有重试次数
      store.addMessage(result);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(result);

      // 再次发送
      mockGateway.sendMessage = vi
        .fn()
        .mockResolvedValue({ result: 'gateway result' });

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'retry-plugin',
        async onBefore({ parameters }) {
          expect(parameters.currentMessage.id).toEqual(result.id);
        }
      };

      service.use(plugin);

      // 重试时传递一个新对象，保留 id，但不传递旧的 error
      const result2 = await service.send({
        id: result.id,
        content: 'success'
      });

      store.updateMessage(result.id!, result2);

      const messages2 = store.getMessages();

      expect(result2.error).toBeNull();
      expect(result2.status).toBe(MessageStatus.SENT);
      expect(result2.result).toMatchObject({
        result: 'gateway result'
      });
      expect(messages2).toHaveLength(1);
      expect(messages2[0].id).toEqual(result.id);
      expect(messages2[0].status).toBe(MessageStatus.SENT);
    });
  });

  describe('getMessageStore', () => {
    it('应该返回 MessagesStore 实例', () => {
      const messageStore = service.getMessageStore();

      expect(messageStore).toBe(store);
    });

    it('应该返回与构造函数中传入的 store 相同的引用', () => {
      const newStore = new MessagesStore<TestMessage>(() => ({
        messages: []
      }));

      const newService = new MessageSender(newStore, {
        gateway: mockGateway
      });

      expect(newService.getMessageStore()).toBe(newStore);
    });
  });

  describe('getGateway', () => {
    it('应该返回配置的 gateway', () => {
      const gateway = service.getGateway();

      expect(gateway).toBe(mockGateway);
    });

    it('应该返回 undefined 如果没有配置 gateway', () => {
      const serviceWithoutGateway = new MessageSender(store);

      expect(serviceWithoutGateway.getGateway()).toBeUndefined();
    });

    it('应该返回构造函数中配置的 gateway', () => {
      const anotherGateway: MessageGetwayInterface = {
        sendMessage: vi.fn().mockResolvedValue({ result: 'Another gateway' })
      };

      const serviceWithAnotherGateway = new MessageSender(store, {
        gateway: anotherGateway
      });

      expect(serviceWithAnotherGateway.getGateway()).toBe(anotherGateway);
    });
  });

  describe('getDuration', () => {
    it('应该返回消息的持续时间', async () => {
      const result = await service.send({ content: 'Test' });

      const duration = service.getDuration(result);

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(duration).toBe(result.endTime - result.startTime);
    });

    it('应该返回 0 如果 endTime 为 0', () => {
      const message = store.createMessage({
        content: 'Test',
        startTime: Date.now(),
        endTime: 0
      });

      const duration = service.getDuration(message);

      expect(duration).toBe(0);
    });

    it('应该计算正确的时间差', () => {
      const startTime = 1000;
      const endTime = 5000;

      const message = store.createMessage({
        content: 'Test',
        startTime: startTime,
        endTime: endTime
      });

      const duration = service.getDuration(message);

      expect(duration).toBe(4000);
    });

    it('应该处理消息持续时间为 0 的情况', () => {
      const sameTime = Date.now();

      const message = store.createMessage({
        content: 'Test',
        startTime: sameTime,
        endTime: sameTime
      });

      const duration = service.getDuration(message);

      expect(duration).toBe(0);
    });
  });

  describe('stop - 停止单个消息', () => {
    it('应该能够停止正在发送的消息', async () => {
      // 创建一个延迟的 gateway 响应
      let resolveGateway: ((value: unknown) => void) | null = null;

      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      // 开始发送消息
      const sendPromise = service.send({ id: 'test-message', content: 'Test' });

      // 等待一小段时间，确保请求已开始
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 停止消息发送
      const stopped = service.stop('test-message');

      // 应该返回 true 表示成功停止
      expect(stopped).toBe(true);

      // 等待发送完成（应该被取消）
      const result = await sendPromise;

      // 消息应该被标记为失败或停止
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });

    it('应该返回 false 如果消息 ID 不存在', () => {
      const stopped = service.stop('non-existent-id');

      expect(stopped).toBe(false);
    });

    it('应该不影响其他正在发送的消息', async () => {
      // 创建两个延迟的 gateway 响应
      const promises: any[] = [];
      let callCount = 0;

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        const index = callCount++;
        return new Promise((resolve) => {
          promises[index] = resolve;
        });
      });

      // 开始发送两条消息
      const sendPromise1 = service.send({
        id: 'message-1',
        content: 'Message 1'
      });
      const sendPromise2 = service.send({
        id: 'message-2',
        content: 'Message 2'
      });

      // 等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 只停止第一条消息
      service.stop('message-1');

      // 完成第二条消息
      promises[1]({ result: 'Success' });

      const result2 = await sendPromise2;

      // 第二条消息应该成功
      expect(result2.status).toBe(MessageStatus.SENT);
      expect(result2.result).toEqual({ result: 'Success' });

      // 第一条消息应该被取消
      const result1 = await sendPromise1;
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result1.status
      );
    });
  });

  describe('stopAll - 停止所有消息', () => {
    it('应该停止所有正在发送的消息', async () => {
      // 创建多个延迟的 gateway 响应
      const promises: any[] = [];
      let callCount = 0;

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        const index = callCount++;
        return new Promise((resolve) => {
          promises[index] = resolve;
        });
      });

      // 开始发送多条消息
      const sendPromise1 = service.send({
        id: 'message-1',
        content: 'Message 1'
      });
      const sendPromise2 = service.send({
        id: 'message-2',
        content: 'Message 2'
      });
      const sendPromise3 = service.send({
        id: 'message-3',
        content: 'Message 3'
      });

      // 等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 停止所有消息
      service.stopAll();

      // 等待所有消息完成
      const results = await Promise.all([
        sendPromise1,
        sendPromise2,
        sendPromise3
      ]);

      // 所有消息都应该被取消或失败
      results.forEach((result) => {
        expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
          result.status
        );
      });
    });

    it('应该能够在没有正在发送的消息时调用', () => {
      // 不应该抛出错误
      expect(() => {
        service.stopAll();
      }).not.toThrow();
    });

    it('停止后应该能够继续发送新消息', async () => {
      // 创建延迟的 gateway 响应
      let resolveGateway: ((value: unknown) => void) | null = null;
      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValueOnce(gatewayPromise);

      // 开始发送消息
      const sendPromise = service.send({
        id: 'message-1',
        content: 'Message 1'
      });

      // 等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 停止所有消息
      service.stopAll();

      await sendPromise;

      // 重置 mock，返回成功
      mockGateway.sendMessage = vi
        .fn()
        .mockResolvedValue({ result: 'Success' });

      // 发送新消息
      const newResult = await service.send({ content: 'New message' });

      // 新消息应该成功
      expect(newResult.status).toBe(MessageStatus.SENT);
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });
  });

  describe('流式消息 - gatewayOptions', () => {
    it('应该支持 onChunk 回调', async () => {
      const chunks: any[] = [];
      let chunkCallCount = 0;

      // Mock streaming response
      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          // Simulate streaming chunks
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ content: 'chunk1' });
            await options.onChunk({ content: 'chunk2' });
            await options.onChunk({ content: 'chunk3' });
          }

          return { result: 'Complete' };
        });

      const result = await service.send(
        { content: 'Streaming message' },
        {
          onChunk: (chunk) => {
            chunks.push(chunk);
            chunkCallCount++;
          }
        }
      );

      expect(result.status).toBe(MessageStatus.SENT);
      expect(chunkCallCount).toBe(3);
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ content: 'chunk1' });
      expect(chunks[1]).toEqual({ content: 'chunk2' });
      expect(chunks[2]).toEqual({ content: 'chunk3' });
    });

    it('应该支持 onConnected 回调', async () => {
      let connected = false;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }
          return { result: 'Success' };
        });

      const result = await service.send(
        { content: 'Test' },
        {
          onConnected: () => {
            connected = true;
          }
        }
      );

      expect(result.status).toBe(MessageStatus.SENT);
      expect(connected).toBe(true);
    });

    it('应该按顺序调用 onConnected 和 onChunk', async () => {
      const callOrder: string[] = [];

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ content: 'chunk1' });
            await options.onChunk({ content: 'chunk2' });
          }

          return { result: 'Complete' };
        });

      await service.send(
        { content: 'Test' },
        {
          onConnected: () => {
            callOrder.push('connected');
          },
          onChunk: () => {
            callOrder.push('chunk');
          }
        }
      );

      expect(callOrder).toEqual(['connected', 'chunk', 'chunk']);
    });

    it('应该支持自定义 signal', async () => {
      const controller = new AbortController();
      let gatewayCallCount = 0;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          gatewayCallCount++;
          // Check if signal is aborted
          options?.signal?.throwIfAborted();

          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              resolve({ result: 'Success' });
            }, 100);

            options?.signal?.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Aborted'));
            });
          });
        });

      const sendPromise = service.send(
        { content: 'Test' },
        { signal: controller.signal }
      );

      // 取消请求
      controller.abort();

      const result = await sendPromise;

      expect(gatewayCallCount).toBe(1);
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
    });

    it('应该合并 config 中的 gatewayOptions 和 send 参数中的 gatewayOptions', async () => {
      let receivedOptions: any = null;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          receivedOptions = options;
          return { result: 'Success' };
        });

      const serviceWithOptions = new MessageSender(store, {
        gateway: mockGateway,
        gatewayOptions: {
          timeout: 5000
        }
      });

      await serviceWithOptions.send({ content: 'Test' }, {
        retry: 3
      } as any);

      expect(receivedOptions).toBeDefined();
      expect(receivedOptions.timeout).toBe(5000);
      expect(receivedOptions.retry).toBe(3);
    });
  });

  describe('Logger 集成', () => {
    it('应该在成功发送时记录日志', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      const result = await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('success')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(result.id!)
      );
    });

    it('应该在发送失败时记录日志', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      const result = await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.debug).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('failed')
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(result.id!)
      );
    });

    it('应该在日志中包含自定义的 senderName', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      const customSenderName = 'CustomSender';

      const serviceWithCustomName = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger,
        senderName: customSenderName
      });

      await serviceWithCustomName.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(customSenderName)
      );
    });

    it('应该在日志中包含消息持续时间', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('speed')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringMatching(/\d+ms/)
      );
    });

    it('应该能够在没有 logger 的情况下正常工作', async () => {
      const serviceWithoutLogger = new MessageSender(store, {
        gateway: mockGateway
      });

      await expect(
        serviceWithoutLogger.send({ content: 'Test' })
      ).resolves.toBeDefined();
    });
  });

  describe('senderName 配置', () => {
    it('应该使用默认的 senderName', () => {
      const defaultService = new MessageSender(store, {
        gateway: mockGateway
      });

      expect(defaultService['senderName']).toBe('MessageSender');
    });

    it('应该使用自定义的 senderName', () => {
      const customName = 'MyCustomSender';

      const customService = new MessageSender(store, {
        gateway: mockGateway,
        senderName: customName
      });

      expect(customService['senderName']).toBe(customName);
    });

    it('应该在错误消息中使用 senderName', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      const customName = 'TestSender';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const customService = new MessageSender(store, {
        gateway: mockGateway,
        senderName: customName,
        logger: mockLogger
      });

      await customService.send({ content: 'Test' });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(`[${customName}]`)
      );
    });
  });

  describe('复杂的流式场景', () => {
    it('应该在流式传输中支持插件拦截', async () => {
      const receivedChunks: any[] = [];

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ text: 'Hello' });
            await options.onChunk({ text: ' World' });
          }

          return { result: 'Complete' };
        });

      const plugin: MessageSenderPlugin<TestMessage> = {
        pluginName: 'stream-interceptor',
        onStream: async (chunk) => {
          // Plugin can modify chunk
          return {
            ...chunk,
            modified: true
          };
        }
      };

      service.use(plugin);

      await service.send(
        { content: 'Test' },
        {
          onChunk: (chunk) => {
            receivedChunks.push(chunk);
          }
        }
      );

      // Chunks should be modified by plugin
      receivedChunks.forEach((chunk) => {
        expect(chunk).toHaveProperty('modified', true);
      });
    });

    it('应该处理流式传输中的错误', async () => {
      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ content: 'chunk1' });
            throw new Error('Streaming error');
          }

          return { result: 'Should not reach here' };
        });

      const result = await service.send(
        { content: 'Test' },
        {
          onChunk: () => {
            // do nothing
          }
        }
      );

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();
    });
  });

  describe('AbortPlugin 集成测试', () => {
    it('应该在构造时自动注册 AbortPlugin', () => {
      const newService = new MessageSender(store, {
        gateway: mockGateway
      });

      // AbortPlugin 应该已经被注册
      expect(newService['abortPlugin']).toBeDefined();
      expect(newService['executor']).toBeDefined();
    });

    it('应该使用消息 ID 作为 abort 标识', async () => {
      const messageId = 'test-id-123';

      let resolveGateway: ((value: unknown) => void) | null = null;
      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      const sendPromise = service.send({
        id: messageId,
        content: 'Test'
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const stopped = service.stop(messageId);

      expect(stopped).toBe(true);

      const result = await sendPromise;
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });
  });

  describe('边界情况和特殊场景', () => {
    it('应该处理 gateway 返回 Promise.reject(undefined)', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(undefined);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();
    });

    it('应该处理消息对象包含函数属性', async () => {
      const messageWithFunction = {
        content: 'Test',
        customMethod: () => 'custom result'
      } as any;

      const result = await service.send(messageWithFunction);

      expect(result.status).toBe(MessageStatus.SENT);
      expect(typeof (result as any).customMethod).toBe('function');
    });

    it('应该处理消息对象包含 Symbol 属性', async () => {
      const symbolKey = Symbol('test');
      const messageWithSymbol = {
        content: 'Test',
        [symbolKey]: 'symbol value'
      } as any;

      const result = await service.send(messageWithSymbol);

      expect(result.status).toBe(MessageStatus.SENT);
      expect((result as any)[symbolKey]).toBe('symbol value');
    });

    it('应该处理极短的发送时间', async () => {
      // Gateway 立即返回
      mockGateway.sendMessage = vi
        .fn()
        .mockResolvedValue({ result: 'Instant' });

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime);
      expect(service.getDuration(result)).toBeGreaterThanOrEqual(0);
    });

    it('应该处理消息 ID 包含特殊字符', async () => {
      const specialId = 'msg-#@!$%^&*()_+-=[]{}|;:,.<>?';

      const result = await service.send({
        id: specialId,
        content: 'Test'
      });

      expect(result.id).toBe(specialId);
      expect(result.status).toBe(MessageStatus.SENT);
    });
  });
});
