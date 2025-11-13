import { AsyncExecutor, type ExecutorContext } from '@qlover/fe-corekit';
import { describe, it, expect, beforeEach } from 'vitest';
import type { MessageSenderContext } from '@/base/focusBar/impl/MessageSender';
import {
  MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';
import {
  SenderStrategyPlugin,
  SendFailureStrategy
} from '@/base/focusBar/impl/SenderStrategyPlugin';

// 测试用的消息类型
interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

describe('SenderStrategyPlugin', () => {
  let store: MessagesStore<TestMessage>;
  let context: ExecutorContext<MessageSenderContext<TestMessage>>;

  beforeEach(() => {
    // 创建 store
    store = new MessagesStore(() => ({
      messages: []
    }));
  });

  describe('构造函数', () => {
    it('应该正确初始化默认参数', () => {
      const plugin = new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED);

      expect(plugin.pluginName).toBe('SenderStrategyPlugin');
      expect(plugin['failureStrategy']).toBe(SendFailureStrategy.KEEP_FAILED);
    });
  });

  describe('onBefore - 发送前处理', () => {
    describe('KEEP_FAILED 策略', () => {
      it('应该立即将消息添加到 store', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.KEEP_FAILED
        );

        const message = store.createMessage({
          content: 'Test',
          status: MessageStatus.SENDING,
          loading: true
        });

        context = {
          parameters: {
            messages: store,
            currentMessage: message
          },
          returnValue: undefined,
          error: undefined
        } as any;

        plugin.onBefore(context);

        // 消息应该被添加到 store
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].content).toBe('Test');

        // context 应该标记为已添加
        expect(context.parameters.addedToStore).toBe(true);
      });
    });

    describe('DELETE_FAILED 策略', () => {
      it('应该立即将消息添加到 store', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.DELETE_FAILED
        );

        const message = store.createMessage({
          content: 'Test',
          status: MessageStatus.SENDING,
          loading: true
        });

        context = {
          parameters: {
            messages: store,
            currentMessage: message
          },
          returnValue: undefined,
          error: undefined
        } as any;

        plugin.onBefore(context);

        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(context.parameters.addedToStore).toBe(true);
      });
    });

    describe('ADD_ON_SUCCESS 策略', () => {
      it('应该不添加消息到 store（延迟添加）', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.ADD_ON_SUCCESS
        );

        const message = store.createMessage({
          content: 'Test',
          status: MessageStatus.SENDING,
          loading: true
        });

        context = {
          parameters: {
            messages: store,
            currentMessage: message
          },
          returnValue: undefined,
          error: undefined
        } as any;

        plugin.onBefore(context);

        // 消息不应该被添加到 store
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);

        // context 应该标记为未添加
        expect(context.parameters.addedToStore).toBe(false);
      });
    });
  });

  describe('onSuccess - 发送成功处理', () => {
    describe('消息已在 store 中（addedToStore = true）', () => {
      it('应该更新消息状态为 SENT', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.KEEP_FAILED
        );

        // 先添加消息到 store
        const message = store.addMessage({
          content: 'Test',
          status: MessageStatus.SENDING,
          loading: true
        });

        const gatewayResult = { data: 'Response' };

        context = {
          parameters: {
            messages: store,
            currentMessage: message,
            addedToStore: true,
            gatewayResult
          },
          returnValue: undefined,
          error: undefined
        } as any;

        plugin.onSuccess(context);

        // 消息应该被更新
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].status).toBe(MessageStatus.SENT);
        expect(messages[0].loading).toBe(false);
        expect(messages[0].result).toEqual(gatewayResult);
        expect(messages[0].endTime).toBeGreaterThan(0);

        // returnValue 应该被设置
        expect(context.returnValue).toBeDefined();
        expect((context.returnValue as TestMessage).status).toBe(
          MessageStatus.SENT
        );
      });

      it('应该在更新失败时抛出错误', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.KEEP_FAILED
        );

        // 使用不存在的消息 ID
        const message = store.createMessage({
          id: 'non-existent-id',
          content: 'Test',
          status: MessageStatus.SENDING
        });

        context = {
          parameters: {
            messages: store,
            currentMessage: message,
            addedToStore: true,
            gatewayResult: {}
          },
          returnValue: undefined,
          error: undefined
        } as any;

        expect(() => plugin.onSuccess(context)).toThrow(
          'Failed to update message'
        );
      });
    });

    describe('消息不在 store 中（addedToStore = false，ADD_ON_SUCCESS 策略）', () => {
      it('应该添加消息到 store', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.ADD_ON_SUCCESS
        );

        const message = store.createMessage({
          content: 'Test',
          status: MessageStatus.SENDING,
          loading: true
        });

        const gatewayResult = { data: 'Response' };

        context = {
          parameters: {
            messages: store,
            currentMessage: message,
            addedToStore: false,
            gatewayResult
          },
          returnValue: undefined,
          error: undefined
        } as any;

        plugin.onSuccess(context);

        // 消息应该被添加
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].status).toBe(MessageStatus.SENT);
        expect(messages[0].loading).toBe(false);
        expect(messages[0].result).toEqual(gatewayResult);

        // returnValue 应该被设置
        expect(context.returnValue).toBeDefined();
      });
    });
  });

  describe('onError - 发送失败处理', () => {
    describe('KEEP_FAILED 策略', () => {
      it('应该更新已存在消息的状态为 FAILED', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.KEEP_FAILED
        );

        const message = store.addMessage({
          content: 'Test',
          status: MessageStatus.SENDING,
          loading: true
        });

        const error = new Error('Network error');

        context = {
          parameters: {
            messages: store,
            currentMessage: message,
            addedToStore: true
          },
          returnValue: undefined,
          error: error
        } as any;

        plugin.onError(context);

        // 消息应该被更新为 FAILED
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].status).toBe(MessageStatus.FAILED);
        expect(messages[0].loading).toBe(false);
        expect(messages[0].error).toBe(error);
        expect(messages[0].endTime).toBeGreaterThan(0);

        // returnValue 应该包含失败消息
        expect(context.returnValue).toBeDefined();
        expect((context.returnValue as TestMessage).status).toBe(
          MessageStatus.FAILED
        );
      });

      it('应该在真实异步执行中正确处理错误', async () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.KEEP_FAILED
        );

        const executor = new AsyncExecutor();
        executor.use(plugin);

        const message = store.addMessage({
          content: 'Test',
          status: MessageStatus.SENDING,
          loading: true
        });

        const error = new Error('Network error');

        const context: MessageSenderContext<TestMessage> = {
          messages: store,
          currentMessage: message,
          addedToStore: true
        };

        // 模拟发送失败
        const result = await executor.exec(context, async () => {
          throw error;
        });

        // 错误被捕获，返回失败消息
        expect(result).toBeDefined();
        expect((result as TestMessage).status).toBe(MessageStatus.FAILED);
        expect((result as TestMessage).error).toBe(error);

        // store 中的消息应该被更新为 FAILED
        const messages = store.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].status).toBe(MessageStatus.FAILED);
      });

      it('应该创建临时消息当消息不在 store 中', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.KEEP_FAILED
        );

        const message = store.createMessage({
          id: 'test-id',
          content: 'Test',
          status: MessageStatus.SENDING
        });

        const error = new Error('Network error');

        context = {
          parameters: {
            messages: store,
            currentMessage: message,
            addedToStore: false
          },
          returnValue: undefined,
          error: error
        } as any;

        plugin.onError(context);

        // store 应该为空（消息不在 store 中）
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);

        // 但应该返回临时失败消息
        expect(context.returnValue).toBeDefined();
        const failedMessage = context.returnValue as TestMessage;
        expect(failedMessage.id).toBe('test-id');
        expect(failedMessage.status).toBe(MessageStatus.FAILED);
        expect(failedMessage.error).toBe(error);
      });
    });

    describe('DELETE_FAILED 策略', () => {
      it('应该从 store 中删除失败的消息', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.DELETE_FAILED
        );

        const message = store.addMessage({
          content: 'Test',
          status: MessageStatus.SENDING
        });

        const error = new Error('Network error');

        context = {
          parameters: {
            messages: store,
            currentMessage: message,
            addedToStore: true
          },
          returnValue: undefined,
          error: error
        } as any;

        plugin.onError(context);

        // 消息应该被删除
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);

        // 但应该返回临时失败消息对象
        expect(context.returnValue).toBeDefined();
        const failedMessage = context.returnValue as TestMessage;
        expect(failedMessage.status).toBe(MessageStatus.FAILED);
        expect(failedMessage.error).toBe(error);
      });

      it('应该在真实异步执行中删除失败消息', async () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.DELETE_FAILED
        );

        const executor = new AsyncExecutor();
        executor.use(plugin);

        const message = store.addMessage({
          content: 'Test',
          status: MessageStatus.SENDING
        });

        const error = new Error('Network error');

        const context: MessageSenderContext<TestMessage> = {
          messages: store,
          currentMessage: message,
          addedToStore: true
        };

        // 模拟发送失败
        const result = await executor.exec(context, async () => {
          throw error;
        });

        // 应该返回失败消息对象
        expect(result).toBeDefined();
        expect((result as TestMessage).status).toBe(MessageStatus.FAILED);

        // 但 store 中应该为空（消息被删除）
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);
      });

      it('应该创建临时失败消息当消息不在 store 中', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.DELETE_FAILED
        );

        const message = store.createMessage({
          content: 'Test',
          status: MessageStatus.SENDING
        });

        const error = new Error('Network error');

        context = {
          parameters: {
            messages: store,
            currentMessage: message,
            addedToStore: false
          },
          returnValue: undefined,
          error: error
        } as any;

        plugin.onError(context);

        // store 应该为空
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);

        // 应该返回临时失败消息
        expect(context.returnValue).toBeDefined();
        expect((context.returnValue as TestMessage).status).toBe(
          MessageStatus.FAILED
        );
      });
    });

    describe('ADD_ON_SUCCESS 策略', () => {
      it('应该创建临时失败消息而不添加到 store', () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.ADD_ON_SUCCESS
        );

        const message = store.createMessage({
          content: 'Test',
          status: MessageStatus.SENDING
        });

        const error = new Error('Network error');

        context = {
          parameters: {
            messages: store,
            currentMessage: message,
            addedToStore: false
          },
          returnValue: undefined,
          error: error
        } as any;

        plugin.onError(context);

        // store 应该为空
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);

        // 应该返回临时失败消息
        expect(context.returnValue).toBeDefined();
        const failedMessage = context.returnValue as TestMessage;
        expect(failedMessage.status).toBe(MessageStatus.FAILED);
        expect(failedMessage.error).toBe(error);
        expect(failedMessage.loading).toBe(false);
        expect(failedMessage.endTime).toBeGreaterThan(0);
      });

      it('应该在真实异步执行中不添加失败消息到 store', async () => {
        const plugin = new SenderStrategyPlugin(
          SendFailureStrategy.ADD_ON_SUCCESS
        );

        const executor = new AsyncExecutor();
        executor.use(plugin);

        const message = store.createMessage({
          content: 'Test',
          status: MessageStatus.SENDING
        });

        const error = new Error('Network error');

        const context: MessageSenderContext<TestMessage> = {
          messages: store,
          currentMessage: message,
          addedToStore: false
        };

        // 模拟发送失败
        const result = await executor.exec(context, async () => {
          throw error;
        });

        // 应该返回失败消息对象
        expect(result).toBeDefined();
        expect((result as TestMessage).status).toBe(MessageStatus.FAILED);
        expect((result as TestMessage).error).toBe(error);

        // store 应该为空（消息未添加）
        const messages = store.getMessages();
        expect(messages).toHaveLength(0);
      });
    });
  });

  describe('完整流程测试', () => {
    it('KEEP_FAILED: 发送前添加 -> 成功更新 -> 失败保留', async () => {
      const plugin = new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED);

      // 1. 发送前添加
      const message = store.createMessage({
        content: 'Test',
        status: MessageStatus.SENDING
      });

      const beforeContext = {
        parameters: {
          messages: store,
          currentMessage: message
        },
        returnValue: undefined,
        error: undefined
      } as any;

      plugin.onBefore(beforeContext);
      expect(store.getMessages()).toHaveLength(1);
      expect(beforeContext.parameters.addedToStore).toBe(true);

      // 2. 成功更新
      beforeContext.parameters.gatewayResult = { data: 'ok' };
      plugin.onSuccess(beforeContext);
      expect(store.getMessages()[0].status).toBe(MessageStatus.SENT);

      // 3. 失败保留（假设另一次发送失败）
      const message2 = store.addMessage({
        content: 'Test 2',
        status: MessageStatus.SENDING
      });

      const errorContext = {
        parameters: {
          messages: store,
          currentMessage: message2,
          addedToStore: true
        },
        returnValue: undefined,
        error: new Error('Fail')
      } as any;

      plugin.onError(errorContext);
      expect(store.getMessages()).toHaveLength(2); // 保留两条
      expect(store.getMessages()[1].status).toBe(MessageStatus.FAILED);
    });

    it('DELETE_FAILED: 发送前添加 -> 失败删除', () => {
      const plugin = new SenderStrategyPlugin(
        SendFailureStrategy.DELETE_FAILED
      );

      const message = store.createMessage({
        content: 'Test',
        status: MessageStatus.SENDING
      });

      const beforeContext = {
        parameters: {
          messages: store,
          currentMessage: message
        },
        returnValue: undefined,
        error: undefined
      } as any;

      plugin.onBefore(beforeContext);
      expect(store.getMessages()).toHaveLength(1);

      // 失败删除
      beforeContext.error = new Error('Fail');
      plugin.onError(beforeContext);
      expect(store.getMessages()).toHaveLength(0); // 被删除
    });

    it('ADD_ON_SUCCESS: 发送前不添加 -> 成功才添加 -> 失败不添加', () => {
      const plugin = new SenderStrategyPlugin(
        SendFailureStrategy.ADD_ON_SUCCESS
      );

      const message = store.createMessage({
        content: 'Test',
        status: MessageStatus.SENDING
      });

      const beforeContext = {
        parameters: {
          messages: store,
          currentMessage: message
        },
        returnValue: undefined,
        error: undefined
      } as any;

      // 1. 发送前不添加
      plugin.onBefore(beforeContext);
      expect(store.getMessages()).toHaveLength(0);
      expect(beforeContext.parameters.addedToStore).toBe(false);

      // 2. 成功才添加
      beforeContext.parameters.gatewayResult = { data: 'ok' };
      plugin.onSuccess(beforeContext);
      expect(store.getMessages()).toHaveLength(1);
      expect(store.getMessages()[0].status).toBe(MessageStatus.SENT);

      // 3. 失败不添加（另一条消息失败）
      const message2 = store.createMessage({
        content: 'Test 2',
        status: MessageStatus.SENDING
      });

      const errorContext = {
        parameters: {
          messages: store,
          currentMessage: message2,
          addedToStore: false
        },
        returnValue: undefined,
        error: new Error('Fail')
      } as any;

      plugin.onError(errorContext);
      expect(store.getMessages()).toHaveLength(1); // 仍然只有 1 条（成功的）
    });
  });

  describe('边界情况', () => {
    it('应该正确处理空的 gatewayResult', () => {
      const plugin = new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED);

      const message = store.addMessage({
        content: 'Test',
        status: MessageStatus.SENDING
      });

      const context = {
        parameters: {
          messages: store,
          currentMessage: message,
          addedToStore: true,
          gatewayResult: undefined
        },
        returnValue: undefined,
        error: undefined
      } as any;

      plugin.onSuccess(context);

      const messages = store.getMessages();
      expect(messages[0].status).toBe(MessageStatus.SENT);
      expect(messages[0].result).toBeUndefined();
    });

    it('应该正确处理没有 ID 的消息', () => {
      const plugin = new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED);

      const message = store.createMessage({
        content: 'Test',
        status: MessageStatus.SENDING
      });

      // 移除 ID
      delete (message as any).id;

      const context = {
        parameters: {
          messages: store,
          currentMessage: message,
          addedToStore: false
        },
        returnValue: undefined,
        error: new Error('Fail')
      } as any;

      // 应该不抛出错误
      expect(() => plugin.onError(context)).not.toThrow();
    });
  });
});
