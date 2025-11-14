import { ExecutorError } from '@qlover/fe-corekit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MessageSenderContext } from '@/base/focusBar/impl/MessageSender';
import { MessageSender } from '@/base/focusBar/impl/MessageSender';
import {
  MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';
import {
  SendFailureStrategy,
  SenderStrategyPlugin
} from '@/base/focusBar/impl/SenderStrategyPlugin';
import type { MessageGetwayInterface } from '@/base/focusBar/interface/MessageGetwayInterface';

// 测试用的消息类型
interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

describe('SenderStrategyPlugin', () => {
  let sender: MessageSender<TestMessage>;
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
  });

  describe('构造函数', () => {
    it('应该正确初始化插件', () => {
      const plugin = new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED);
      expect(plugin.pluginName).toBe('SenderStrategyPlugin');
    });

    it('应该支持所有三种策略', () => {
      const plugin1 = new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED);
      const plugin2 = new SenderStrategyPlugin(
        SendFailureStrategy.DELETE_FAILED
      );
      const plugin3 = new SenderStrategyPlugin(
        SendFailureStrategy.ADD_ON_SUCCESS
      );

      expect(plugin1).toBeInstanceOf(SenderStrategyPlugin);
      expect(plugin2).toBeInstanceOf(SenderStrategyPlugin);
      expect(plugin3).toBeInstanceOf(SenderStrategyPlugin);
    });
  });

  describe('KEEP_FAILED 策略 - 保留失败消息', () => {
    beforeEach(() => {
      sender = new MessageSender(store, {
        gateway: mockGateway
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));
    });

    it('发送成功时：消息应该被添加到 store 并保持 SENT 状态', async () => {
      const result = await sender.send({ content: 'Success message' });

      // 验证返回的消息
      expect(result.content).toBe('Success message');
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);

      // 验证 store 中的消息
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(result.id);
      expect(messages[0].status).toBe(MessageStatus.SENT);
    });

    it('发送失败时：失败消息应该保留在 store 中', async () => {
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Send failed'));

      const result = await sender.send({ content: 'Failed message' });

      // 验证返回的失败消息
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect(result.loading).toBe(false);

      // 验证 store 中保留了失败消息
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(result.id);
      expect(messages[0].status).toBe(MessageStatus.FAILED);
      expect(messages[0].error).toBeDefined();
    });

    it('发送流程：消息状态应该经历 SENDING -> SENT', async () => {
      let capturedStatus: typeof MessageStatus | null = null;

      // 监听 gateway 调用时的消息状态
      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        capturedStatus = msg.status;
        return Promise.resolve({ result: 'Success' });
      });

      const result = await sender.send({ content: 'Test' });

      // 发送过程中应该是 SENDING
      expect(capturedStatus).toBe(MessageStatus.SENDING);

      // 完成后应该是 SENT
      expect(result.status).toBe(MessageStatus.SENT);

      // store 中的消息也应该是 SENT
      const messages = store.getMessages();
      expect(messages[0].status).toBe(MessageStatus.SENT);
    });

    it('应该在发送前就添加消息到 store', async () => {
      let storeMessagesCount = 0;

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        // 在 gateway 调用时，消息应该已经在 store 中
        storeMessagesCount = store.getMessages().length;
        return Promise.resolve({ result: 'Success' });
      });

      await sender.send({ content: 'Test' });

      // 验证消息在 gateway 调用前就已添加
      expect(storeMessagesCount).toBe(1);
    });

    it('多条消息：成功和失败的消息都应该保留', async () => {
      // 发送成功消息
      await sender.send({ content: 'Success 1' });

      // 发送失败消息
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));
      await sender.send({ content: 'Failed 1' });

      // 再发送成功消息
      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });
      await sender.send({ content: 'Success 2' });

      // 验证所有消息都在 store 中
      const messages = store.getMessages();
      expect(messages).toHaveLength(3);
      expect(messages[0].status).toBe(MessageStatus.SENT);
      expect(messages[1].status).toBe(MessageStatus.FAILED);
      expect(messages[2].status).toBe(MessageStatus.SENT);
    });

    it('失败消息的 error 字段应该被正确设置', async () => {
      const testError = new Error('Network timeout');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      const result = await sender.send({ content: 'Failed' });

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).message).toBe('Network timeout');

      const messages = store.getMessages();
      expect((messages[0].error as ExecutorError).message).toBe(
        'Network timeout'
      );
    });

    it('失败消息的时间戳应该被正确设置', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await sender.send({ content: 'Failed' });
      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);

      const messages = store.getMessages();
      // 返回的消息应该和 store 中的消息是同一个引用
      expect(messages[0]).toBe(result);
      expect(messages[0].endTime).toBe(result.endTime);
    });
  });

  describe('DELETE_FAILED 策略 - 删除失败消息', () => {
    beforeEach(() => {
      sender = new MessageSender(store, {
        gateway: mockGateway
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));
    });

    it('发送成功时：消息应该被添加到 store', async () => {
      const result = await sender.send({ content: 'Success' });

      expect(result.status).toBe(MessageStatus.SENT);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(result.id);
    });

    it('发送失败时：失败消息应该从 store 中删除', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await sender.send({ content: 'Failed' });

      // 返回的消息应该是失败状态
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();

      // store 中不应该有这条消息
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('混合场景：只保留成功的消息', async () => {
      // 成功消息
      await sender.send({ content: 'Success 1' });

      // 失败消息
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));
      await sender.send({ content: 'Failed' });

      // 再次成功
      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });
      await sender.send({ content: 'Success 2' });

      // store 中只有成功的消息
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Success 1');
      expect(messages[1].content).toBe('Success 2');
    });

    it('应该在发送前添加消息，失败后删除', async () => {
      let messagesDuringGateway: TestMessage[] = [];

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        // 在 gateway 调用时，消息应该在 store 中
        messagesDuringGateway = [...store.getMessages()];
        return Promise.reject(new Error('Failed'));
      });

      await sender.send({ content: 'Test' });

      // gateway 调用时消息在 store 中
      expect(messagesDuringGateway).toHaveLength(1);

      // 失败后消息被删除
      expect(store.getMessages()).toHaveLength(0);
    });

    it('连续发送多条失败消息：store 应该保持为空', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      await sender.send({ content: 'Failed 1' });
      await sender.send({ content: 'Failed 2' });
      await sender.send({ content: 'Failed 3' });

      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('失败消息虽然被删除，但应该返回完整的失败信息', async () => {
      const testError = new Error('Send failed');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      const result = await sender.send({ content: 'Failed' });

      // 返回的消息应该包含完整的失败信息
      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect(result.loading).toBe(false);
      expect(result.content).toBe('Failed');
      expect(result.id).toBeDefined();
    });
  });

  describe('ADD_ON_SUCCESS 策略 - 延迟添加', () => {
    beforeEach(() => {
      sender = new MessageSender(store, {
        gateway: mockGateway
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));
    });

    it('发送成功时：消息应该在成功后才添加到 store', async () => {
      let messagesDuringGateway: TestMessage[] = [];

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        // 在 gateway 调用时，消息不应该在 store 中
        messagesDuringGateway = [...store.getMessages()];
        return Promise.resolve({ result: 'Success' });
      });

      const result = await sender.send({ content: 'Test' });

      // gateway 调用时 store 应该为空
      expect(messagesDuringGateway).toHaveLength(0);

      // 成功后消息应该被添加
      expect(result.status).toBe(MessageStatus.SENT);
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(result.id);
    });

    it('发送失败时：消息不应该添加到 store', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await sender.send({ content: 'Failed' });

      // 返回失败消息
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();

      // store 应该为空
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('混合场景：只有成功的消息才会被添加', async () => {
      // 成功消息
      await sender.send({ content: 'Success 1' });

      // 失败消息
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));
      await sender.send({ content: 'Failed' });

      // 再次成功
      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });
      await sender.send({ content: 'Success 2' });

      // store 中只有成功的消息
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Success 1');
      expect(messages[1].content).toBe('Success 2');
    });

    it('发送过程中 store 应该始终为空，直到成功', async () => {
      const statesLog: number[] = [];

      mockGateway.sendMessage = vi.fn().mockImplementation(async () => {
        statesLog.push(store.getMessages().length);
        await new Promise((resolve) => setTimeout(resolve, 10));
        statesLog.push(store.getMessages().length);
        return { result: 'Success' };
      });

      await sender.send({ content: 'Test' });

      // 发送过程中 store 都是空的
      expect(statesLog).toEqual([0, 0]);

      // 完成后才有消息
      expect(store.getMessages()).toHaveLength(1);
    });

    it('失败消息应该返回完整信息，即使没有添加到 store', async () => {
      const testError = new Error('Gateway error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      const result = await sender.send({ content: 'Failed' });

      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect(result.content).toBe('Failed');
      expect(result.loading).toBe(false);
    });

    it('多条消息并发发送：只有成功的才添加', async () => {
      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        if (msg.content?.includes('fail')) {
          return Promise.reject(new Error('Failed'));
        }
        return Promise.resolve({ result: 'Success' });
      });

      const promises = [
        sender.send({ content: 'success 1' }),
        sender.send({ content: 'fail 1' }),
        sender.send({ content: 'success 2' }),
        sender.send({ content: 'fail 2' }),
        sender.send({ content: 'success 3' })
      ];

      await Promise.all(promises);

      const messages = store.getMessages();
      expect(messages).toHaveLength(3);
      expect(messages.every((msg) => msg.status === MessageStatus.SENT)).toBe(
        true
      );
    });
  });

  describe('策略对比测试', () => {
    it('对比：三种策略处理失败消息的不同方式', async () => {
      const testScenario = async (
        strategy: (typeof SendFailureStrategy)[keyof typeof SendFailureStrategy]
      ) => {
        const testStore = new MessagesStore(() => ({ messages: [] }));
        const testGateway = {
          sendMessage: vi.fn().mockRejectedValue(new Error('Failed'))
        };
        const testSender = new MessageSender(testStore, {
          gateway: testGateway
        });
        testSender.use(new SenderStrategyPlugin(strategy));

        const result = await testSender.send({ content: 'Test' });
        const storeMessages = testStore.getMessages();

        return {
          returnedStatus: result.status,
          returnedError: result.error,
          storeCount: storeMessages.length,
          storeStatus: storeMessages[0]?.status
        };
      };

      // KEEP_FAILED: 保留失败消息
      const keepResult = await testScenario(SendFailureStrategy.KEEP_FAILED);
      expect(keepResult.returnedStatus).toBe(MessageStatus.FAILED);
      expect(keepResult.returnedError).toBeDefined();
      expect(keepResult.storeCount).toBe(1);
      expect(keepResult.storeStatus).toBe(MessageStatus.FAILED);

      // DELETE_FAILED: 删除失败消息
      const deleteResult = await testScenario(
        SendFailureStrategy.DELETE_FAILED
      );
      expect(deleteResult.returnedStatus).toBe(MessageStatus.FAILED);
      expect(deleteResult.returnedError).toBeDefined();
      expect(deleteResult.storeCount).toBe(0);

      // ADD_ON_SUCCESS: 不添加失败消息
      const delayResult = await testScenario(
        SendFailureStrategy.ADD_ON_SUCCESS
      );
      expect(delayResult.returnedStatus).toBe(MessageStatus.FAILED);
      expect(delayResult.returnedError).toBeDefined();
      expect(delayResult.storeCount).toBe(0);
    });

    it('对比：三种策略处理成功消息的方式', async () => {
      const testScenario = async (
        strategy: (typeof SendFailureStrategy)[keyof typeof SendFailureStrategy]
      ) => {
        const testStore = new MessagesStore(() => ({ messages: [] }));
        const testGateway = {
          sendMessage: vi.fn().mockResolvedValue({ result: 'Success' })
        };
        const testSender = new MessageSender(testStore, {
          gateway: testGateway
        });
        testSender.use(new SenderStrategyPlugin(strategy));

        const result = await testSender.send({ content: 'Test' });
        const storeMessages = testStore.getMessages();

        return {
          returnedStatus: result.status,
          storeCount: storeMessages.length,
          storeStatus: storeMessages[0]?.status
        };
      };

      // 所有策略对成功消息的处理应该一致
      const keepResult = await testScenario(SendFailureStrategy.KEEP_FAILED);
      const deleteResult = await testScenario(
        SendFailureStrategy.DELETE_FAILED
      );
      const delayResult = await testScenario(
        SendFailureStrategy.ADD_ON_SUCCESS
      );

      // 都应该返回成功消息
      expect(keepResult.returnedStatus).toBe(MessageStatus.SENT);
      expect(deleteResult.returnedStatus).toBe(MessageStatus.SENT);
      expect(delayResult.returnedStatus).toBe(MessageStatus.SENT);

      // 都应该在 store 中
      expect(keepResult.storeCount).toBe(1);
      expect(deleteResult.storeCount).toBe(1);
      expect(delayResult.storeCount).toBe(1);

      // store 中的状态都是 SENT
      expect(keepResult.storeStatus).toBe(MessageStatus.SENT);
      expect(deleteResult.storeStatus).toBe(MessageStatus.SENT);
      expect(delayResult.storeStatus).toBe(MessageStatus.SENT);
    });
  });

  describe('与 MessageSender 的集成测试', () => {
    it('插件应该能正确访问 MessageSenderContext', async () => {
      let capturedContext: MessageSenderContext | null = null;

      class TestPlugin extends SenderStrategyPlugin {
        onBefore(context: any): void {
          capturedContext = context.parameters;
          super.onBefore(context);
        }
      }

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(capturedContext).toBeDefined();
      expect(capturedContext!.messages).toBe(store);
      expect(capturedContext!.currentMessage).toBeDefined();
      expect(capturedContext!.currentMessage.content).toBe('Test');
    });

    it('插件应该能正确更新 context 中的 currentMessage', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      // 返回的消息应该是 store 中的消息（引用相同）
      const messages = store.getMessages();
      expect(messages[0]).toBe(result);
    });

    it('插件应该能正确处理 gateway 返回的结果', async () => {
      const gatewayResult = {
        data: { id: 123, text: 'Response' },
        timestamp: Date.now()
      };

      mockGateway.sendMessage = vi.fn().mockResolvedValue(gatewayResult);

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      expect(result.result).toEqual(gatewayResult);

      const messages = store.getMessages();
      expect(messages[0].result).toEqual(gatewayResult);
    });

    it('多个插件协同工作：策略插件 + 自定义插件', async () => {
      const customPlugin = {
        pluginName: 'custom-modifier',
        onBefore({ parameters }: any) {
          parameters.currentMessage.content = `[Modified] ${parameters.currentMessage.content}`;
        }
      };

      sender = new MessageSender(store, { gateway: mockGateway });
      sender
        .use(customPlugin)
        .use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      expect(result.content).toBe('[Modified] Test');

      const messages = store.getMessages();
      expect(messages[0].content).toBe('[Modified] Test');
    });

    it('应该支持使用简化参数方式发送消息', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // 使用 content + files 方式
      const files = [new File(['test'], 'test.txt')];
      const result = await sender.send('Test content', files);

      expect(result.content).toBe('Test content');
      expect(result.files).toEqual(files);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test content');
    });
  });

  describe('生命周期钩子测试', () => {
    it('onBefore: 应该在发送前被调用', async () => {
      const callLog: string[] = [];

      class TestPlugin extends SenderStrategyPlugin {
        onBefore(context: any): void {
          callLog.push('onBefore');
          super.onBefore(context);
        }
      }

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        callLog.push('gateway');
        return Promise.resolve({ result: 'Success' });
      });

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(callLog).toEqual(['onBefore', 'gateway']);
    });

    it('onSuccess: 应该在发送成功后被调用', async () => {
      const callLog: string[] = [];

      class TestPlugin extends SenderStrategyPlugin {
        onSuccess(context: any): void {
          callLog.push('onSuccess');
          super.onSuccess(context);
        }
      }

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        callLog.push('gateway');
        return Promise.resolve({ result: 'Success' });
      });

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(callLog).toEqual(['gateway', 'onSuccess']);
    });

    it('onError: 应该在发送失败后被调用', async () => {
      const callLog: string[] = [];

      class TestPlugin extends SenderStrategyPlugin {
        onError(context: any): any {
          callLog.push('onError');
          return super.onError(context);
        }
      }

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        callLog.push('gateway');
        return Promise.reject(new Error('Failed'));
      });

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(callLog).toEqual(['gateway', 'onError']);
    });

    it('onSuccess 应该在 onBefore 设置的 addedToStore 标志下工作', async () => {
      let addedToStoreInOnSuccess: boolean | undefined;

      class TestPlugin extends SenderStrategyPlugin {
        onSuccess(context: any): void {
          addedToStoreInOnSuccess = context.parameters.addedToStore;
          super.onSuccess(context);
        }
      }

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(addedToStoreInOnSuccess).toBe(true);
    });

    it('onError 应该正确设置 returnValue', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      // returnValue 应该是失败消息
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理空 content', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: '' });

      expect(result.content).toBe('');
      expect(result.status).toBe(MessageStatus.SENT);

      const messages = store.getMessages();
      expect(messages[0].content).toBe('');
    });

    it('应该处理 null/undefined content', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result1 = await sender.send({ content: null as any });
      expect(result1.content).toBeNull();

      const result2 = await sender.send({ content: undefined });
      expect(result2.content).toBeUndefined();
    });

    it('应该处理没有 gateway 的情况', async () => {
      const senderWithoutGateway = new MessageSender(store);
      senderWithoutGateway.use(
        new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED)
      );

      const result = await senderWithoutGateway.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
    });

    it('KEEP_FAILED: 应该处理 updateMessage 返回 null 的情况', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // Mock updateMessage 返回 null
      const originalUpdate = store.updateMessage;
      store.updateMessage = vi.fn().mockReturnValue(null);

      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });

      await expect(sender.send({ content: 'Test' })).rejects.toThrow(
        'Failed to call updateMessage in store'
      );

      // 恢复原始方法
      store.updateMessage = originalUpdate;
    });

    it('KEEP_FAILED: 失败时 updateMessage 返回 null 应该抛出错误', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // Mock updateMessage 返回 null
      const originalUpdate = store.updateMessage;
      store.updateMessage = vi.fn().mockReturnValue(null);

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      await expect(sender.send({ content: 'Test' })).rejects.toThrow(
        'Failed to call updateMessage in store'
      );

      // 恢复原始方法
      store.updateMessage = originalUpdate;
    });

    it('DELETE_FAILED: 删除消息失败时应该仍然返回失败消息', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Send failed'));

      // 应该捕获 deleteMessage 的错误并继续
      await expect(sender.send({ content: 'Test' })).rejects.toThrow(
        'Send failed'
      );
    });

    it('应该处理消息 ID 的变化', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // 创建一个自定义 ID 的消息
      const customId = 'custom-123';
      const result = await sender.send({
        id: customId,
        content: 'Test'
      });

      expect(result.id).toBe(customId);

      const messages = store.getMessages();
      expect(messages[0].id).toBe(customId);
    });

    it('应该处理并发发送场景', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const promises = [
        sender.send({ content: 'Msg 1' }),
        sender.send({ content: 'Msg 2' }),
        sender.send({ content: 'Msg 3' })
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.status).toBe(MessageStatus.SENT);
      });

      const messages = store.getMessages();
      expect(messages).toHaveLength(3);
    });
  });

  describe('实际应用场景', () => {
    it('聊天应用：使用 KEEP_FAILED 策略保留失败消息以便重试', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // 模拟网络错误
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Network timeout'));

      const failedResult = await sender.send({ content: 'Hello' });

      // 失败消息保留在 store 中，用户可以看到并重试
      expect(store.getMessages()).toHaveLength(1);
      expect(store.getMessages()[0].status).toBe(MessageStatus.FAILED);

      // 用户点击重试
      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });

      const retryResult = await sender.send(failedResult);

      // 重试成功
      expect(retryResult.status).toBe(MessageStatus.SENT);
      expect(store.getMessages()).toHaveLength(1);
    });

    it('表单提交：使用 DELETE_FAILED 策略保持界面干净', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      // 提交失败
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Validation failed'));

      const result = await sender.send({ content: 'Form data' });

      // 失败消息不在列表中，但返回错误信息供 UI 显示
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(store.getMessages()).toHaveLength(0);
    });

    it('后台任务：使用 ADD_ON_SUCCESS 策略只显示成功结果', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      // 发送多个任务
      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        if (msg.content === 'Task 2') {
          return Promise.reject(new Error('Task failed'));
        }
        return Promise.resolve({ result: 'Task completed' });
      });

      await sender.send({ content: 'Task 1' });
      await sender.send({ content: 'Task 2' });
      await sender.send({ content: 'Task 3' });

      // 只有成功的任务出现在列表中
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Task 1');
      expect(messages[1].content).toBe('Task 3');
    });

    it('引用不变：返回的对象和内部使用的应该是同一个对象', async () => {
      const message = {
        content: 'Test'
      };
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));
      const result = await sender.send(message);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBe(result);
      expect(messages[0]).not.toBe(message);
    });
  });

  describe('消息状态转换', () => {
    it('KEEP_FAILED: SENDING -> SENT 状态转换', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let sendingMessage: TestMessage | null = null;

      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        sendingMessage = { ...msg };
        return Promise.resolve({ result: 'OK' });
      });

      const result = await sender.send({ content: 'Test' });

      // 发送过程中是 SENDING
      expect(sendingMessage!.status).toBe(MessageStatus.SENDING);

      // 完成后是 SENT
      expect(result.status).toBe(MessageStatus.SENT);
      expect(store.getMessages()[0].status).toBe(MessageStatus.SENT);
    });

    it('KEEP_FAILED: SENDING -> FAILED 状态转换', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let sendingMessage: TestMessage | null = null;

      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        sendingMessage = { ...msg };
        return Promise.reject(new Error('Failed'));
      });

      const result = await sender.send({ content: 'Test' });

      // 发送过程中是 SENDING
      expect(sendingMessage!.status).toBe(MessageStatus.SENDING);

      // 失败后是 FAILED
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(store.getMessages()[0].status).toBe(MessageStatus.FAILED);
    });

    it('DELETE_FAILED: SENDING -> SENT (不删除)', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      const result = await sender.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(store.getMessages()).toHaveLength(1);
    });

    it('DELETE_FAILED: SENDING -> FAILED -> deleted', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await sender.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(store.getMessages()).toHaveLength(0);
    });

    it('ADD_ON_SUCCESS: 成功时才进入 store', async () => {
      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      const statusLog: number[] = [];

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        statusLog.push(store.getMessages().length); // 应该是 0
        return Promise.resolve({ result: 'OK' });
      });

      await sender.send({ content: 'Test' });

      statusLog.push(store.getMessages().length); // 应该是 1

      expect(statusLog).toEqual([0, 1]);
    });
  });

  describe('错误信息完整性', () => {
    it('失败消息应该包含完整的错误信息', async () => {
      const testError = new Error('Detailed error message');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).message).toBe(
        'Detailed error message'
      );
    });

    it('不同策略返回的错误信息应该一致', async () => {
      const testError = new Error('Test error');
      const testGateway = {
        sendMessage: vi.fn().mockRejectedValue(testError)
      };

      const strategies = [
        SendFailureStrategy.KEEP_FAILED,
        SendFailureStrategy.DELETE_FAILED,
        SendFailureStrategy.ADD_ON_SUCCESS
      ];

      for (const strategy of strategies) {
        const testStore = new MessagesStore(() => ({ messages: [] }));
        const testSender = new MessageSender(testStore, {
          gateway: testGateway
        });
        testSender.use(new SenderStrategyPlugin(strategy));

        const result = await testSender.send({ content: 'Test' });

        expect(result.status).toBe(MessageStatus.FAILED);
        expect(result.error).toBeInstanceOf(ExecutorError);
        expect((result.error as ExecutorError).message).toBe('Test error');
      }
    });
  });

  describe('context.parameters.addedToStore 标志', () => {
    it('KEEP_FAILED: addedToStore 应该为 true', async () => {
      let capturedFlag: boolean | undefined;

      class TestPlugin extends SenderStrategyPlugin {
        onSuccess(context: any): void {
          capturedFlag = context.parameters.addedToStore;
          super.onSuccess(context);
        }
      }

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(capturedFlag).toBe(true);
    });

    it('DELETE_FAILED: addedToStore 应该为 true', async () => {
      let capturedFlag: boolean | undefined;

      class TestPlugin extends SenderStrategyPlugin {
        onSuccess(context: any): void {
          capturedFlag = context.parameters.addedToStore;
          super.onSuccess(context);
        }
      }

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new TestPlugin(SendFailureStrategy.DELETE_FAILED));

      await sender.send({ content: 'Test' });

      expect(capturedFlag).toBe(true);
    });

    it('ADD_ON_SUCCESS: addedToStore 应该为 false', async () => {
      let capturedFlag: boolean | undefined;

      class TestPlugin extends SenderStrategyPlugin {
        onSuccess(context: any): void {
          capturedFlag = context.parameters.addedToStore;
          super.onSuccess(context);
        }
      }

      sender = new MessageSender(store, { gateway: mockGateway });
      sender.use(new TestPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      await sender.send({ content: 'Test' });

      expect(capturedFlag).toBe(false);
    });
  });
});
