import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  SendFailureStrategy
} from '@/base/focusBar/impl/MessageSender';
import {
  MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';
import type { FocusBarEventInterface } from '@/base/focusBar/interface/FocusBarEventInterface';
import type { MessageGetwayInterface } from '@/base/focusBar/interface/MessageGetwayInterface';

// 测试用的消息类型
interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

describe('MessageSender', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockEvents: FocusBarEventInterface<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    // 创建 store
    store = new MessagesStore(() => ({
      messages: []
    }));

    // 创建 mock events
    mockEvents = {
      onSendBefore: vi.fn(),
      onSendAfter: vi.fn(),
      onSendError: vi.fn()
    };

    // 创建 mock gateway
    mockGateway = {
      sendMessage: vi.fn().mockResolvedValue({ result: 'Gateway response' })
    };

    // 创建 service
    service = new MessageSender(store, mockEvents, mockGateway);
  });

  describe('构造函数', () => {
    it('应该正确初始化', () => {
      expect(service.messages).toBe(store);
      expect(service.gateway).toBe(mockGateway);
    });

    it('应该支持不传递 events 和 gateway', () => {
      const minimalService = new MessageSender(store);
      expect(minimalService.messages).toBe(store);
      expect(minimalService.gateway).toBeUndefined();
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

    it('应该在发送前触发 onSendBefore 事件', async () => {
      await service.send({ content: 'Test' });

      expect(mockEvents.onSendBefore).toHaveBeenCalledTimes(1);
      expect(mockEvents.onSendBefore).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test',
          status: MessageStatus.SENDING,
          loading: true
        })
      );
    });

    it('应该在发送后触发 onSendAfter 事件', async () => {
      await service.send({ content: 'Test' });

      expect(mockEvents.onSendAfter).toHaveBeenCalledTimes(1);
      expect(mockEvents.onSendAfter).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test',
          status: MessageStatus.SENT,
          loading: false
        })
      );
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

    it('应该添加消息到 store', async () => {
      const message = { content: 'Test' };

      await service.send(message);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test');
      expect(messages[0].status).toBe(MessageStatus.SENT);
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
  });

  describe('sendMessage - 错误处理', () => {
    it('应该处理发送失败的情况', async () => {
      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      const result = await service.send({ content: 'Failed message' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });

    it('应该在发送失败时触发 onSendError 事件', async () => {
      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      await service.send({ content: 'Failed message' });

      expect(mockEvents.onSendError).toHaveBeenCalledTimes(1);
      expect(mockEvents.onSendError).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Failed message'
        }),
        error
      );
    });

    it('应该在更新消息失败时返回错误消息（默认不抛出错误）', async () => {
      // Mock updateMessage 返回 undefined（模拟更新失败）
      const originalUpdate = store.updateMessage.bind(store);
      store.updateMessage = vi.fn().mockReturnValue(undefined);

      // 默认情况下不会抛出错误，而是返回包含错误的消息对象
      const result = await service.send({ content: 'Test' });

      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe('Failed to send message');

      // 恢复原始方法
      store.updateMessage = originalUpdate;
    });

    it('应该在更新消息失败且设置 throwCatchError 时抛出错误', async () => {
      // 设置抛出错误模式
      service.throwIfCatchError();

      // Mock updateMessage 返回 undefined
      const originalUpdate = store.updateMessage.bind(store);
      store.updateMessage = vi.fn().mockReturnValue(undefined);

      // 现在应该抛出错误
      await expect(service.send({ content: 'Test' })).rejects.toThrow(
        'Failed to send message'
      );

      // 恢复原始方法
      store.updateMessage = originalUpdate;
    });

    it('应该更新失败消息的状态', async () => {
      const error = new Error('Send failed');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      await service.send({ content: 'Failed' });

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].status).toBe(MessageStatus.FAILED);
      expect(messages[0].error).toBe(error);
    });
  });

  describe('catchMessage', () => {
    it('应该更新已存在消息的状态为 FAILED', () => {
      // 先添加一条消息
      store.addMessage({
        id: 'test-id',
        content: 'Test'
      });

      const error = new Error('Test error');
      const result = service.catchMessage(error, 'test-id');

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
      expect(result.endTime).toBeGreaterThan(0);
    });

    it('应该创建临时消息对象当消息不存在时', () => {
      const error = new Error('Test error');
      const result = service.catchMessage(error, 'non-existent-id');

      expect(result.id).toBe('non-existent-id');
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBe(error);
    });
  });

  describe('throwIfCatchError - 错误处理模式', () => {
    it('默认模式：catchMessage 应该返回失败消息而不抛出错误', () => {
      const error = new Error('Test error');

      // 默认情况下不抛出错误
      expect(() => {
        const result = service.catchMessage(error, 'test-id');
        expect(result.status).toBe(MessageStatus.FAILED);
        expect(result.error).toBe(error);
      }).not.toThrow();
    });

    it('抛出错误模式：设置后 catchMessage 应该抛出错误', () => {
      service.throwIfCatchError();

      const error = new Error('Test error');

      // 设置后应该抛出错误
      expect(() => {
        service.catchMessage(error, 'test-id');
      }).toThrow(error);
    });

    it('默认模式：sendMessage 失败时返回失败消息', async () => {
      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      // 默认情况下不抛出错误，返回失败消息
      const result = await service.send({ content: 'Test' });

      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBe(error);
      expect(result.loading).toBe(false);
    });

    it('抛出错误模式：sendMessage 失败时抛出错误', async () => {
      service.throwIfCatchError();

      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      // 设置后应该抛出错误
      await expect(service.send({ content: 'Test' })).rejects.toThrow(
        error
      );
    });

    it('对比：默认模式适合 UI 错误展示，抛出模式适合测试', async () => {
      const error = new Error('API Error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      // 场景 1：UI 使用 - 默认模式（不抛出错误）
      const service1 = new MessageSender(store, mockEvents, mockGateway);
      const result1 = await service1.send({ content: 'UI Message' });

      expect(result1.status).toBe(MessageStatus.FAILED);
      expect(result1.error).toBe(error);
      // ✅ UI 可以显示错误消息，不会中断应用

      // 场景 2：测试使用 - 抛出错误模式
      const service2 = new MessageSender(store, mockEvents, mockGateway);
      service2.throwIfCatchError();

      await expect(
        service2.send({ content: 'Test Message' })
      ).rejects.toThrow(error);
      // ✅ 测试可以验证错误是否被正确抛出
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

    it('应该将消息添加到 store', () => {
      service['generateSendingMessage']('Test content');

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test content');
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

      // 验证事件触发顺序
      expect(mockEvents.onSendBefore).toHaveBeenCalledTimes(1);
      expect(mockEvents.onSendAfter).toHaveBeenCalledTimes(1);
      expect(mockEvents.onSendError).not.toHaveBeenCalled();

      // 验证 gateway 调用
      expect(mockGateway.sendMessage).toHaveBeenCalledTimes(1);

      // 验证 store 状态
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(result.id);
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
      expect(result.error).toBe(error);

      // 验证事件触发
      expect(mockEvents.onSendBefore).toHaveBeenCalledTimes(1);
      expect(mockEvents.onSendError).toHaveBeenCalledTimes(1);
      expect(mockEvents.onSendAfter).not.toHaveBeenCalled();

      // 验证 store 状态
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].status).toBe(MessageStatus.FAILED);
    });

    it('应该支持连续发送多条消息', async () => {
      await service.send('Message 1');
      await service.send('Message 2');
      await service.send('Message 3');

      const messages = store.getMessages();
      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('Message 1');
      expect(messages[1].content).toBe('Message 2');
      expect(messages[2].content).toBe('Message 3');
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
      const serviceWithoutGateway = new MessageSender(
        store,
        mockEvents,
        undefined
      );

      const result = await serviceWithoutGateway.send('Test');

      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('应该处理 events 未定义的情况', async () => {
      const serviceWithoutEvents = new MessageSender(
        store,
        undefined,
        mockGateway
      );

      const result = await serviceWithoutEvents.send('Test');

      expect(result.status).toBe(MessageStatus.SENT);
    });
  });

  describe('发送失败处理策略 (SendFailureStrategy)', () => {
    describe('KEEP_FAILED - 保留失败消息（默认策略）', () => {
      it('应该在发送失败时保留消息在 store 中', async () => {
        const serviceKeep = new MessageSender(store, mockEvents, mockGateway, {
          failureStrategy: SendFailureStrategy.KEEP_FAILED
        });

        const error = new Error('Network error');
        mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

        const result = await serviceKeep.send({ content: 'Test' });

        // 消息应该在 store 中
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].id).toBe(result.id);
        expect(messages[0].status).toBe(MessageStatus.FAILED);
        expect(messages[0].error).toBe(error);
      });

      it('默认配置应该使用 KEEP_FAILED 策略', async () => {
        // 不传 config，应该默认为 KEEP_FAILED
        const serviceDefault = new MessageSender(
          store,
          mockEvents,
          mockGateway
        );

        const error = new Error('Network error');
        mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

        await serviceDefault.send({ content: 'Test' });

        // 失败消息应该保留
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].status).toBe(MessageStatus.FAILED);
      });
    });

    describe('DELETE_FAILED - 删除失败消息', () => {
      it('应该在发送失败时删除消息', async () => {
        const serviceDelete = new MessageSender(
          store,
          mockEvents,
          mockGateway,
          {
            failureStrategy: SendFailureStrategy.DELETE_FAILED
          }
        );

        const error = new Error('Network error');
        mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

        const result = await serviceDelete.send({ content: 'Test' });

        // 返回的消息应该有失败信息
        expect(result.status).toBe(MessageStatus.FAILED);
        expect(result.error).toBe(error);

        // 但 store 中不应该有这条消息
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);
      });

      it('应该只删除失败的消息，保留成功的消息', async () => {
        const serviceDelete = new MessageSender(
          store,
          mockEvents,
          mockGateway,
          {
            failureStrategy: SendFailureStrategy.DELETE_FAILED
          }
        );

        // 先发送一条成功的消息
        mockGateway.sendMessage = vi.fn().mockResolvedValue({
          result: 'Success 1'
        });
        await serviceDelete.send({ content: 'Success message' });

        // 再发送一条失败的消息
        const error = new Error('Network error');
        mockGateway.sendMessage = vi.fn().mockRejectedValue(error);
        await serviceDelete.send({ content: 'Failed message' });

        // 应该只有成功的消息
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].content).toBe('Success message');
        expect(messages[0].status).toBe(MessageStatus.SENT);
      });
    });

    describe('ADD_ON_SUCCESS - 成功后才添加', () => {
      it('应该在发送成功后才添加消息', async () => {
        const serviceAddOnSuccess = new MessageSender(
          store,
          mockEvents,
          mockGateway,
          {
            failureStrategy: SendFailureStrategy.ADD_ON_SUCCESS
          }
        );

        mockGateway.sendMessage = vi.fn().mockImplementation(async () => {
          // 在发送过程中，store 应该是空的
          const messages = store.getMessages();
          expect(messages).toHaveLength(0);

          return { result: 'Success' };
        });

        const result = await serviceAddOnSuccess.send({
          content: 'Test'
        });

        // 发送成功后，消息才添加到 store
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].id).toBe(result.id);
        expect(messages[0].status).toBe(MessageStatus.SENT);
      });

      it('应该在发送失败时不添加消息', async () => {
        const serviceAddOnSuccess = new MessageSender(
          store,
          mockEvents,
          mockGateway,
          {
            failureStrategy: SendFailureStrategy.ADD_ON_SUCCESS
          }
        );

        const error = new Error('Network error');
        mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

        const result = await serviceAddOnSuccess.send({
          content: 'Test'
        });

        // 返回失败消息对象
        expect(result.status).toBe(MessageStatus.FAILED);
        expect(result.error).toBe(error);

        // 但 store 中不应该有消息
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);
      });

      it('应该在发送过程中不显示消息（无 loading 状态展示）', async () => {
        const serviceAddOnSuccess = new MessageSender(
          store,
          mockEvents,
          mockGateway,
          {
            failureStrategy: SendFailureStrategy.ADD_ON_SUCCESS
          }
        );

        let messageCountDuringSend = -1;

        mockGateway.sendMessage = vi.fn().mockImplementation(async () => {
          // 记录发送过程中 store 的消息数量
          messageCountDuringSend = store.getMessages().length;

          // 模拟网络延迟
          await new Promise((resolve) => setTimeout(resolve, 10));

          return { result: 'Success' };
        });

        await serviceAddOnSuccess.send({ content: 'Test' });

        // 发送过程中 store 应该是空的
        expect(messageCountDuringSend).toBe(0);

        // 发送完成后才有消息
        expect(store.getMessages()).toHaveLength(1);
      });
    });

    describe('策略对比测试', () => {
      it('应该正确应用不同的失败处理策略', async () => {
        const error = new Error('Network error');
        mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

        // 策略 1: KEEP_FAILED
        const store1 = new MessagesStore(() => ({ messages: [] }));
        const service1 = new MessageSender(store1, mockEvents, mockGateway, {
          failureStrategy: SendFailureStrategy.KEEP_FAILED
        });
        await service1.send({ content: 'Test 1' });
        expect(store1.getMessages()).toHaveLength(1); // ✅ 保留失败消息

        // 策略 2: DELETE_FAILED
        const store2 = new MessagesStore(() => ({ messages: [] }));
        const service2 = new MessageSender(store2, mockEvents, mockGateway, {
          failureStrategy: SendFailureStrategy.DELETE_FAILED
        });
        await service2.send({ content: 'Test 2' });
        expect(store2.getMessages()).toHaveLength(0); // ✅ 删除失败消息

        // 策略 3: ADD_ON_SUCCESS
        const store3 = new MessagesStore(() => ({ messages: [] }));
        const service3 = new MessageSender(store3, mockEvents, mockGateway, {
          failureStrategy: SendFailureStrategy.ADD_ON_SUCCESS
        });
        await service3.send({ content: 'Test 3' });
        expect(store3.getMessages()).toHaveLength(0); // ✅ 失败时不添加
      });

      it('应该展示三种策略的使用场景', async () => {
        // 场景 1: 聊天应用 - 使用 KEEP_FAILED
        // 用户可以看到失败消息并重试
        const chatService = new MessageSender(store, mockEvents, mockGateway, {
          failureStrategy: SendFailureStrategy.KEEP_FAILED
        });

        // 场景 2: 表单提交 - 使用 DELETE_FAILED
        // 只显示成功提交的记录
        const formService = new MessageSender(store, mockEvents, mockGateway, {
          failureStrategy: SendFailureStrategy.DELETE_FAILED
        });

        // 场景 3: 实时同步 - 使用 ADD_ON_SUCCESS
        // 只显示已确认同步成功的数据
        const syncService = new MessageSender(store, mockEvents, mockGateway, {
          failureStrategy: SendFailureStrategy.ADD_ON_SUCCESS
        });

        expect(chatService).toBeDefined();
        expect(formService).toBeDefined();
        expect(syncService).toBeDefined();
      });
    });
  });
});
