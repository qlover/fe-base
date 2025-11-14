import { ExecutorError } from '@qlover/fe-corekit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MessageSenderContext } from '@/base/focusBar/impl/MessageSender';
import { MessageSender } from '@/base/focusBar/impl/MessageSender';
import {
  MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';
import type { MessageGetwayInterface } from '@/base/focusBar/interface/MessageGetwayInterface';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

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
      expect(service.messages).toBe(store);
      expect(service.gateway).toBe(mockGateway);
    });

    it('应该支持不传递 config', () => {
      const minimalService = new MessageSender(store);
      expect(minimalService.messages).toBe(store);
      expect(minimalService.gateway).toBeUndefined();
    });

    it('应该支持只传递 gateway', () => {
      const serviceWithGateway = new MessageSender(store, {
        gateway: mockGateway
      });
      expect(serviceWithGateway.gateway).toBe(mockGateway);
    });
  });

  describe('sendMessage - 对象参数方式', () => {
    it('应该成功发送消息（完整对象）', async () => {
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
        })
      );
    });

    it('应该不对 store 进行任何操作', async () => {
      const message = { content: 'Test' };

      await service.send(message);

      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('应该返回一个正确的消息对象', async () => {
      const message = { content: 'Test' };

      const result = await service.send(message);

      expect(result).toBeDefined();
      expect(result.content).toBe('Test');
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
      expect(result.endTime).toBeGreaterThan(0);
    });
  });

  describe('sendMessage - 简化参数方式', () => {
    it('应该支持只传递 content', async () => {
      const result = await service.send('Simple text');

      expect(result).toBeDefined();
      expect(result.content).toBe('Simple text');
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('应该支持传递 content 和 files', async () => {
      const files = [new File(['content'], 'test.txt')];

      const result = await service.send('Text with files', files);

      expect(result.content).toBe('Text with files');
      expect(result.files).toEqual(files);
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('应该正确处理不同类型的 content', async () => {
      // 数字
      const result1 = await service.send(123 as any);
      expect(result1.content).toBe(123);

      // 对象（作为 content）
      const result2 = await service.send(
        { type: 'custom', data: 'value' } as any,
        []
      );
      expect(result2.content).toEqual({ type: 'custom', data: 'value' });

      // 数组（作为 content）
      const result3 = await service.send(['item1', 'item2'] as any, []);
      expect(result3.content).toEqual(['item1', 'item2']);
    });

    it('应该不对 store 进行任何操作', async () => {
      await service.send('Simple text');

      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('应该返回一个正确的消息对象', async () => {
      const result = await service.send('Test');

      expect(result).toBeDefined();
      expect(result.content).toBe('Test');
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
      expect(result.endTime).toBeGreaterThan(0);
    });
  });

  describe('sendMessage - 错误处理', () => {
    it('应该处理发送失败的情况（默认不抛出错误）', async () => {
      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      const result = await service.send({ content: 'Failed message' });

      expect(result).toBeDefined();
      expect(result.content).toBe('Failed message');
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);
    });

    it('应该在设置 throwIfError 时抛出错误', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      let result;
      try {
        result = await errorService.send('Failed message');
      } catch {}

      expect(result).toBeUndefined();

      await expect(errorService.send('Failed message')).rejects.toBeInstanceOf(
        ExecutorError
      );

      await expect(
        errorService.send('Failed message', [])
      ).rejects.toBeInstanceOf(ExecutorError);

      await expect(
        errorService.send({ content: 'Failed message' })
      ).rejects.toBeInstanceOf(ExecutorError);
    });

    it('默认模式：sendMessage 失败时返回失败消息', async () => {
      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      const result = await service.send('Test');
      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe(
        service['messageSenderErrorId']
      );
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);

      const result2 = await service.send({ content: 'Test' });

      expect(result2).toBeDefined();
      expect(result2.status).toBe(MessageStatus.FAILED);
      expect(result2.loading).toBe(false);

      const files: File[] = [new File(['test'], 'test.txt')];
      const result3 = await service.send('Test', files);

      expect(result3).toBeDefined();
      expect(result3.status).toBe(MessageStatus.FAILED);
      expect(result3.files).toEqual(files);
      expect(result3.loading).toBe(false);
    });

    it('抛出错误模式：sendMessage 失败时抛出错误', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      await expect(
        errorService.send({ content: 'Test' })
      ).rejects.toBeInstanceOf(ExecutorError);

      await expect(
        errorService.send({ content: 'Test2' })
      ).rejects.toMatchObject({
        message: error.message
      });
    });
  });

  describe('throwIfError 配置测试', () => {
    it('对比：默认模式适合 UI 错误展示，抛出模式适合测试', async () => {
      const error = new Error('API Error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      // 场景 1：UI 使用 - 默认模式（不抛出错误）
      const service1 = new MessageSender(store, {
        gateway: mockGateway
      });
      const result1 = await service1.send({ content: 'UI Message' });

      expect(result1.status).toBe(MessageStatus.FAILED);
      // ✅ UI 可以显示错误消息，不会中断应用

      // 场景 2：测试使用 - 抛出错误模式
      const store2 = new MessagesStore(() => ({ messages: [] }));
      const service2 = new MessageSender(store2, {
        gateway: mockGateway,
        throwIfError: true
      });

      await expect(
        service2.send({ content: 'Test Message' })
      ).rejects.toBeInstanceOf(ExecutorError);

      await expect(
        service2.send({ content: 'Test Message' })
      ).rejects.toMatchObject({
        message: error.message
      });
      // ✅ 测试可以验证错误是否被正确抛出
    });

    it('throwIfError 为 true 时，成功的消息应该正常返回（不抛出错误）', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      mockGateway.sendMessage = vi.fn().mockResolvedValue({
        result: 'Success'
      });

      // 成功的消息不应该抛出错误
      const result = await errorService.send({ content: 'Success message' });

      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
      // ✅ 即使 throwIfError 为 true，成功的消息也应该正常返回
    });

    it('throwIfError 为 false 时，失败的消息不应该抛出错误', async () => {
      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      // 不应该抛出错误
      const result = await service.send({ content: 'Failed message' });

      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.FAILED);
      expect((result.error as ExecutorError).message).toBe(error.message);
      // ✅ 默认情况下，失败消息以对象形式返回，不抛出
    });
  });

  describe('generateSendingMessage', () => {
    it('应该正确处理消息对象', () => {
      const message = service['generateSendingMessage']({
        content: 'Test',
        placeholder: 'Typing...'
      });

      expect(message.content).toBe('Test');
      expect(message.placeholder).toBe('Typing...');
      expect(message.status).toBe(MessageStatus.SENDING);
      expect(message.loading).toBe(true);
      expect(message.startTime).toBeDefined();
    });

    it('应该正确处理 content 和 files 参数', () => {
      const files = [new File(['test'], 'test.txt')];
      const message = service['generateSendingMessage']('Content', files);

      expect(message.content).toBe('Content');
      expect(message.files).toBe(files);
      expect(message.status).toBe(MessageStatus.SENDING);
    });
  });

  describe('集成测试：完整发送流程', () => {
    it('应该完成完整的成功发送流程', async () => {
      const result = await service.send({
        content: 'Hello World',
        placeholder: 'Sending...'
      });

      // 验证消息状态
      expect(result.content).toBe('Hello World');
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);

      // 验证 gateway 调用
      expect(mockGateway.sendMessage).toHaveBeenCalledTimes(1);

      // 验证 store 状态
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('应该完成完整的失败发送流程', async () => {
      const error = new Error('Send failed');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      const result = await service.send({
        content: 'Failed Message'
      });

      // 验证消息状态
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);
    });

    it('应该支持连续发送多条消息', async () => {
      await service.send('Message 1');
      await service.send('Message 2');
      await service.send('Message 3');

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
      let capturedContext: any = null;

      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'context-capture',
        onExec(ctx) {
          capturedContext = ctx;
        }
      };

      service.use(plugin);

      await service.send({ content: 'Test' });

      expect(capturedContext).toBeDefined();
      expect(capturedContext.parameters.messages).toBe(store);
      expect(capturedContext.parameters.currentMessage).toBeDefined();
      expect(capturedContext.parameters.currentMessage.content).toBe('Test');
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
    it('应该处理空 content', async () => {
      const result = await service.send('');
      expect(result.content).toBe('');
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('应该处理 null/undefined content', async () => {
      const result1 = await service.send(null as any);
      expect(result1.content).toBeNull();

      const result2 = await service.send(undefined as any);
      expect(result2.content).toBeUndefined();
    });

    it('应该处理 gateway 未定义的情况', async () => {
      const serviceWithoutGateway = new MessageSender(store);

      const result = await serviceWithoutGateway.send('Test');

      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('应该处理只配置 gateway 的情况', async () => {
      const serviceWithGateway = new MessageSender(store, {
        gateway: mockGateway
      });

      const result = await serviceWithGateway.send('Test');

      expect(result.status).toBe(MessageStatus.SENT);
    });
  });

  describe('时间戳验证', () => {
    it('成功消息的 endTime 应该大于等于 startTime', async () => {
      const result = await service.send('Test');

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);
    });

    it('失败消息的 endTime 应该大于等于 startTime', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await service.send('Test');

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);
    });

    it('不应该支持自定义 startTime', async () => {
      const customStartTime = Date.now() - 1000;

      const result = await service.send({
        content: 'Test',
        startTime: customStartTime
      });

      expect(result.startTime).not.toBe(customStartTime);
      expect(result.endTime).toBeGreaterThan(customStartTime);

      // But you can use plugin to modify the startTime
      const plugin: ExecutorPlugin<MessageSenderContext<any>> = {
        pluginName: 'start-time-modifier',
        onBefore({ parameters }) {
          parameters.currentMessage.startTime = customStartTime;
        }
      };

      service.use(plugin);

      const result2 = await service.send('Test');

      expect(result2.startTime).toBe(customStartTime);
      expect(result2.endTime).toBeGreaterThan(customStartTime);
    });
  });

  describe('网关返回值处理', () => {
    it('应该处理 gateway 返回 null', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(null);

      const result = await service.send('Test');

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toBeNull();
    });

    it('应该处理 gateway 返回 undefined', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(undefined);

      const result = await service.send('Test');

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

      const result = await service.send('Test');

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toEqual(complexResult);
    });

    it('应该处理 gateway 返回原始类型', async () => {
      // 字符串
      mockGateway.sendMessage = vi.fn().mockResolvedValue('string result');
      const result1 = await service.send('Test');
      expect(result1.result).toBe('string result');

      // 数字
      mockGateway.sendMessage = vi.fn().mockResolvedValue(42);
      const result2 = await service.send('Test');
      expect(result2.result).toBe(42);

      // 布尔值
      mockGateway.sendMessage = vi.fn().mockResolvedValue(true);
      const result3 = await service.send('Test');
      expect(result3.result).toBe(true);
    });
  });

  describe('并发场景', () => {
    it('应该支持并发发送多条消息', async () => {
      const promises = [
        service.send('Message 1'),
        service.send('Message 2'),
        service.send('Message 3')
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
        service.send('Message 1'),
        service.send('Message 2'), // 这条会失败
        service.send('Message 3')
      ];

      const results = await Promise.all(promises);

      expect(results[0].status).toBe(MessageStatus.SENT);
      expect(results[1].status).toBe(MessageStatus.FAILED);
      expect(results[2].status).toBe(MessageStatus.SENT);
    });
  });

  describe('ExecutorError ID 修改逻辑', () => {
    it('应该将 UNKNOWN_ASYNC_ERROR 改写为 MESSAGE_SENDER_ERROR', async () => {
      const unknownError = new ExecutorError('Unknown error');
      unknownError.id = 'UNKNOWN_ASYNC_ERROR';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(unknownError);

      const result = await service.send('Test');

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe(
        service['messageSenderErrorId']
      );
      expect((result.error as ExecutorError).id).toBe('MESSAGE_SENDER_ERROR');
    });

    it('不应该修改其他 ExecutorError 的 ID', async () => {
      const customError = new ExecutorError('Custom error');
      customError.id = 'CUSTOM_ERROR_ID';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(customError);

      const result = await service.send('Test');

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe('CUSTOM_ERROR_ID');
    });
  });

  describe('消息对象的完整性', () => {
    it('发送的消息应该包含所有必要字段', async () => {
      const result = await service.send('Test');

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

      const result = await service.send('Test');

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

      await service.send('Test');

      expect(capturedContext).toBeDefined();
      expect(capturedContext!.messages).toBe(store);
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

      const result = await service.send('Test');

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
          expect(parameters.currentMessage).not.toEqual(result);
        }
      };

      service.use(plugin);

      const result2 = await service.send(
        Object.assign(result, { content: 'success' })
      );

      store.addMessage(result2);

      const messages2 = store.getMessages();

      expect(result2.error).toBeNull();
      expect(result2.status).toBe(MessageStatus.SENT);
      expect(result2.result).toMatchObject({
        result: 'gateway result'
      });
      expect(messages2).toHaveLength(1);
      expect(messages2[0]).not.toEqual(result);
      expect(messages2[0]).toEqual(result2);
    });
  });
});
