import {
  ExecutorError,
  Aborter,
  AborterPlugin,
  type AborterConfig
} from '@qlover/fe-corekit';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  SendFailureStrategy,
  SenderStrategyPlugin,
  MessageSenderExecutor,
  type MessageGetwayInterface,
  type MessageStoreMsg,
  type MessageSenderContext,
  type MessageSenderOptions
} from '../../src/core/message-sender';

function toAborterConfig(
  parameters: unknown | MessageSenderOptions<TestMessage>
): AborterConfig {
  const options = parameters as MessageSenderOptions<TestMessage>;
  return {
    abortId: options.currentMessage.id,
    onAborted: options.gatewayOptions?.onAborted,
    abortTimeout: options.gatewayOptions?.timeout,
    signal: options.gatewayOptions?.signal
  };
}

interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

describe('SenderStrategyPlugin', () => {
  let sender: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;
  let aborter: Aborter;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.useFakeTimers();
    store = new MessagesStore(() => ({
      messages: []
    }));

    mockGateway = {
      sendMessage: vi.fn().mockResolvedValue({ result: 'Gateway response' })
    };
    aborter = new Aborter('TestAborter');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should correctly initialize the plugin', () => {
      const plugin = new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED);
      expect(plugin.pluginName).toBe('SenderStrategyPlugin');
    });

    it('should support all three strategies', () => {
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

  describe('KEEP_FAILED strategy - keep failed message', () => {
    beforeEach(() => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));
    });

    it('when sending successfully: the message should be added to the store and kept SENT status', async () => {
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

    it('when sending failed: the failed message should be kept in the store', async () => {
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Send failed'));

      const result = await sender.send({ content: 'Failed message' });

      // verify the returned failed message
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect(result.loading).toBe(false);

      // verify the failed message is kept in the store
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(result.id);
      expect(messages[0].status).toBe(MessageStatus.FAILED);
      expect(messages[0].error).toBeDefined();
    });

    it('the message status should经历 SENDING -> SENT', async () => {
      let capturedStatus: typeof MessageStatus | null = null;

      // listen to the message status when the gateway is called
      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        capturedStatus = msg.status;
        return Promise.resolve({ result: 'Success' });
      });

      const result = await sender.send({ content: 'Test' });

      // the status should be SENDING during sending
      expect(capturedStatus).toBe(MessageStatus.SENDING);

      // after sending, the status should be SENT
      expect(result.status).toBe(MessageStatus.SENT);

      // the message in the store should also be SENT
      const messages = store.getMessages();
      expect(messages[0].status).toBe(MessageStatus.SENT);
    });

    it('should add the message to the store before sending', async () => {
      let storeMessagesCount = 0;

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        // when the gateway is called, the message should already be in the store
        storeMessagesCount = store.getMessages().length;
        return Promise.resolve({ result: 'Success' });
      });

      await sender.send({ content: 'Test' });

      // verify the message is added to the store before the gateway is called
      expect(storeMessagesCount).toBe(1);
    });

    it('multiple messages: both successful and failed messages should be kept', async () => {
      // 发送成功消息
      await sender.send({ content: 'Success 1' });

      // send failed message
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));
      await sender.send({ content: 'Failed 1' });

      // send successful message again
      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });
      await sender.send({ content: 'Success 2' });

      // verify all messages are in the store
      const messages = store.getMessages();
      expect(messages).toHaveLength(3);
      expect(messages[0].status).toBe(MessageStatus.SENT);
      expect(messages[1].status).toBe(MessageStatus.FAILED);
      expect(messages[2].status).toBe(MessageStatus.SENT);
    });

    it('the error field of the failed message should be correctly set', async () => {
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

    it('the timestamp of the failed message should be correctly set', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await sender.send({ content: 'Failed' });
      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);

      const messages = store.getMessages();
      // result returns a new object, but the content is the same, so compare the key properties instead of the entire object
      expect(messages[0].id).toBe(result.id);
      expect(messages[0].content).toBe(result.content);
      expect(messages[0].status).toBe(result.status);
      expect(messages[0].startTime).toBe(result.startTime);
      expect(messages[0].endTime).toBe(result.endTime);
      expect(messages[0].loading).toBe(result.loading);
      expect((messages[0].error as ExecutorError)?.message).toBe(
        (result.error as ExecutorError)?.message
      );
    });
  });

  describe('DELETE_FAILED strategy - delete failed message', () => {
    beforeEach(() => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));
    });

    it('when sending successfully: the message should be added to the store', async () => {
      const result = await sender.send({ content: 'Success' });

      expect(result.status).toBe(MessageStatus.SENT);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(result.id);
    });

    it('when sending failed: the failed message should be deleted from the store', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await sender.send({ content: 'Failed' });

      // the returned message should be in the failed status
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();

      // the message should not be in the store
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('mixed scenario: only keep successful messages', async () => {
      // successful message
      await sender.send({ content: 'Success 1' });

      // failed message
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));
      await sender.send({ content: 'Failed' });

      // send successful message again
      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });
      await sender.send({ content: 'Success 2' });

      // only successful messages are in the store
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Success 1');
      expect(messages[1].content).toBe('Success 2');
    });

    it('should add the message to the store before sending, and delete it after failure', async () => {
      let messagesDuringGateway: TestMessage[] = [];

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        // when the gateway is called, the message should be in the store
        messagesDuringGateway = [...store.getMessages()];
        return Promise.reject(new Error('Failed'));
      });

      await sender.send({ content: 'Test' });

      // when the gateway is called, the message is in the store
      expect(messagesDuringGateway).toHaveLength(1);

      // the message is deleted after failure
      expect(store.getMessages()).toHaveLength(0);
    });

    it('continuous sending multiple failed messages: the store should remain empty', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      await sender.send({ content: 'Failed 1' });
      await sender.send({ content: 'Failed 2' });
      await sender.send({ content: 'Failed 3' });

      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('the failed message should return complete failure information even if it is deleted', async () => {
      const testError = new Error('Send failed');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      const result = await sender.send({ content: 'Failed' });

      // the returned message should contain complete failure information
      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect(result.loading).toBe(false);
      expect(result.content).toBe('Failed');
      expect(result.id).toBeDefined();
    });
  });

  describe('ADD_ON_SUCCESS strategy - delay adding', () => {
    beforeEach(() => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));
    });

    it('when sending successfully: the message should be added to the store after success', async () => {
      let messagesDuringGateway: TestMessage[] = [];

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        // when the gateway is called, the message should not be in the store
        messagesDuringGateway = [...store.getMessages()];
        return Promise.resolve({ result: 'Success' });
      });

      const result = await sender.send({ content: 'Test' });

      // when the gateway is called, the store should be empty
      expect(messagesDuringGateway).toHaveLength(0);

      // the message should be added after success
      expect(result.status).toBe(MessageStatus.SENT);
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(result.id);
    });

    it('when sending failed: the message should not be added to the store', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await sender.send({ content: 'Failed' });

      // the returned message should be in the failed status
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();

      // the store should be empty
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('mixed scenario: only successful messages will be added', async () => {
      await sender.send({ content: 'Success 1' });

      // failed message
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));
      await sender.send({ content: 'Failed' });

      // send successful message again
      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });
      await sender.send({ content: 'Success 2' });

      // only successful messages are in the store
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Success 1');
      expect(messages[1].content).toBe('Success 2');
    });

    it('during sending, the store should always be empty until success', async () => {
      const statesLog: number[] = [];

      mockGateway.sendMessage = vi.fn().mockImplementation(async () => {
        statesLog.push(store.getMessages().length);
        await vi.advanceTimersByTimeAsync(10);
        statesLog.push(store.getMessages().length);
        return { result: 'Success' };
      });

      await sender.send({ content: 'Test' });

      // during sending, the store should be empty
      expect(statesLog).toEqual([0, 0]);

      // after sending, there should be a message
      expect(store.getMessages()).toHaveLength(1);
    });

    it('the failed message should return complete information even if it is not added to the store', async () => {
      const testError = new Error('Gateway error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      const result = await sender.send({ content: 'Failed' });

      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect(result.content).toBe('Failed');
      expect(result.loading).toBe(false);
    });

    it('multiple messages concurrent sending: only successful messages will be added', async () => {
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

  describe('strategy comparison test', () => {
    it('comparison: different ways to handle failed messages with three strategies', async () => {
      const testScenario = async (
        strategy: (typeof SendFailureStrategy)[keyof typeof SendFailureStrategy]
      ) => {
        const testStore = new MessagesStore(() => ({ messages: [] }));
        const testGateway = {
          sendMessage: vi.fn().mockRejectedValue(new Error('Failed'))
        };
        const testSender = new MessageSender(testStore, {
          gateway: testGateway,
          executor: new MessageSenderExecutor()
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

      // KEEP_FAILED: keep failed message
      const keepResult = await testScenario(SendFailureStrategy.KEEP_FAILED);
      expect(keepResult.returnedStatus).toBe(MessageStatus.FAILED);
      expect(keepResult.returnedError).toBeDefined();
      expect(keepResult.storeCount).toBe(1);
      expect(keepResult.storeStatus).toBe(MessageStatus.FAILED);

      // DELETE_FAILED: delete failed message
      const deleteResult = await testScenario(
        SendFailureStrategy.DELETE_FAILED
      );
      expect(deleteResult.returnedStatus).toBe(MessageStatus.FAILED);
      expect(deleteResult.returnedError).toBeDefined();
      expect(deleteResult.storeCount).toBe(0);

      // ADD_ON_SUCCESS: do not add failed message
      const delayResult = await testScenario(
        SendFailureStrategy.ADD_ON_SUCCESS
      );
      expect(delayResult.returnedStatus).toBe(MessageStatus.FAILED);
      expect(delayResult.returnedError).toBeDefined();
      expect(delayResult.storeCount).toBe(0);
    });

    it('comparison: different ways to handle successful messages with three strategies', async () => {
      const testScenario = async (
        strategy: (typeof SendFailureStrategy)[keyof typeof SendFailureStrategy]
      ) => {
        const testStore = new MessagesStore(() => ({ messages: [] }));
        const testGateway = {
          sendMessage: vi.fn().mockResolvedValue({ result: 'Success' })
        };
        const testSender = new MessageSender(testStore, {
          gateway: testGateway,
          executor: new MessageSenderExecutor()
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

      // all strategies should handle successful messages the same
      const keepResult = await testScenario(SendFailureStrategy.KEEP_FAILED);
      const deleteResult = await testScenario(
        SendFailureStrategy.DELETE_FAILED
      );
      const delayResult = await testScenario(
        SendFailureStrategy.ADD_ON_SUCCESS
      );

      // all strategies should return successful messages
      expect(keepResult.returnedStatus).toBe(MessageStatus.SENT);
      expect(deleteResult.returnedStatus).toBe(MessageStatus.SENT);
      expect(delayResult.returnedStatus).toBe(MessageStatus.SENT);

      // all strategies should be in the store
      expect(keepResult.storeCount).toBe(1);
      expect(deleteResult.storeCount).toBe(1);
      expect(delayResult.storeCount).toBe(1);

      // the status in the store should be SENT
      expect(keepResult.storeStatus).toBe(MessageStatus.SENT);
      expect(deleteResult.storeStatus).toBe(MessageStatus.SENT);
      expect(delayResult.storeStatus).toBe(MessageStatus.SENT);
    });
  });

  describe('integration test with MessageSender', () => {
    it('the plugin should be able to correctly access MessageSenderContext', async () => {
      let capturedContext: MessageSenderOptions<TestMessage> | null = null;

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        public onBefore(context: MessageSenderContext<TestMessage>): void {
          capturedContext = context.parameters;
          super.onBefore(context);
        }
      }

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(capturedContext).toBeDefined();
      expect(capturedContext!.store).toBe(store);
      expect(capturedContext!.currentMessage).toBeDefined();
      expect(capturedContext!.currentMessage.content).toBe('Test');
    });

    it('the plugin should be able to correctly update the currentMessage in the context', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      // the returned message should be the message in the store (reference the same)
      const messages = store.getMessages();
      expect(messages[0]).toBe(result);
    });

    it('the plugin should be able to correctly handle the result returned by the gateway', async () => {
      const gatewayResult = {
        data: { id: 123, text: 'Response' },
        timestamp: Date.now()
      };

      mockGateway.sendMessage = vi.fn().mockResolvedValue(gatewayResult);

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      expect(result.result).toEqual(gatewayResult);

      const messages = store.getMessages();
      expect(messages[0].result).toEqual(gatewayResult);
    });

    it('multiple plugins working together: strategy plugin + custom plugin', async () => {
      const customPlugin = {
        pluginName: 'custom-modifier',
        onBefore({ parameters }: MessageSenderContext<TestMessage>) {
          parameters.currentMessage.content = `[Modified] ${parameters.currentMessage.content}`;
        }
      };

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender
        .use(customPlugin)
        .use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      expect(result.content).toBe('[Modified] Test');

      const messages = store.getMessages();
      expect(messages[0].content).toBe('[Modified] Test');
    });

    it('should support sending messages using simplified parameters', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // use content + files way
      const files = [new File(['test'], 'test.txt')];
      const result = await sender.send({
        content: 'Test content',
        files: files
      });

      expect(result.content).toBe('Test content');
      expect(result.files).toEqual(files);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test content');
    });
  });

  describe('lifecycle hook test', () => {
    it('onBefore: should be called before sending', async () => {
      const callLog: string[] = [];

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        public onBefore(context: MessageSenderContext<TestMessage>): void {
          callLog.push('onBefore');
          super.onBefore(context);
        }
      }

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        callLog.push('gateway');
        return Promise.resolve({ result: 'Success' });
      });

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(callLog).toEqual(['onBefore', 'gateway']);
    });

    it('onSuccess: should be called after sending successfully', async () => {
      const callLog: string[] = [];

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        public onSuccess(context: MessageSenderContext<TestMessage>): void {
          callLog.push('onSuccess');
          super.onSuccess(context);
        }
      }

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        callLog.push('gateway');
        return Promise.resolve({ result: 'Success' });
      });

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(callLog).toEqual(['gateway', 'onSuccess']);
    });

    it('onError: should be called after sending failed', async () => {
      const callLog: string[] = [];

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        public onError(
          context: MessageSenderContext<TestMessage>
        ): ExecutorError | void {
          callLog.push('onError');
          return super.onError(context);
        }
      }

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        callLog.push('gateway');
        return Promise.reject(new Error('Failed'));
      });

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(callLog).toEqual(['gateway', 'onError']);
    });

    it('onSuccess should work under the addedToStore flag set by onBefore', async () => {
      let addedToStoreInOnSuccess: boolean | undefined;

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        public onSuccess(context: MessageSenderContext<TestMessage>): void {
          addedToStoreInOnSuccess = context.parameters.addedToStore;
          super.onSuccess(context);
        }
      }

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(addedToStoreInOnSuccess).toBe(true);
    });

    it('onError should correctly set returnValue', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      // returnValue should be the failed message
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty content', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: '' });

      expect(result.content).toBe('');
      expect(result.status).toBe(MessageStatus.SENT);

      const messages = store.getMessages();
      expect(messages[0].content).toBe('');
    });

    it('should handle null/undefined content', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result1 = await sender.send({ content: null as unknown as string });
      expect(result1.content).toBeNull();

      const result2 = await sender.send({ content: undefined });
      expect(result2.content).toBeUndefined();
    });

    it('should handle no gateway cases', async () => {
      const senderWithoutGateway = new MessageSender(store, {
        executor: new MessageSenderExecutor()
      });
      senderWithoutGateway.use(
        new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED)
      );

      const result = await senderWithoutGateway.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
    });

    it('KEEP_FAILED: should handle updateMessage returning null cases', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // Mock updateMessage returning null
      const originalUpdate = store.updateMessage;
      store.updateMessage = vi.fn().mockReturnValue(null);

      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });

      await expect(sender.send({ content: 'Test' })).rejects.toThrow(
        'Failed to call updateMessage in store'
      );

      // Restore original method
      store.updateMessage = originalUpdate;
    });

    it('KEEP_FAILED: should throw error when updateMessage returns null', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // Mock updateMessage returning null
      const originalUpdate = store.updateMessage;
      store.updateMessage = vi.fn().mockReturnValue(null);

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      await expect(sender.send({ content: 'Test' })).rejects.toThrow(
        'Failed to call updateMessage in store'
      );

      // Restore original method
      store.updateMessage = originalUpdate;
    });

    it('DELETE_FAILED: should return failed message when deleteMessage fails', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Send failed'));

      // Should catch deleteMessage error and continue
      await expect(sender.send({ content: 'Test' })).rejects.toThrow(
        'Send failed'
      );
    });

    it('should handle message ID changes', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // Create a custom ID message
      const customId = 'custom-123';
      const result = await sender.send({
        id: customId,
        content: 'Test'
      });

      expect(result.id).toBe(customId);

      const messages = store.getMessages();
      expect(messages[0].id).toBe(customId);
    });

    it('should handle concurrent send scenarios', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
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

  describe('Real-world scenarios', () => {
    it('should use KEEP_FAILED strategy to keep failed messages for retry', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      // Mock network error
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Network timeout'));

      const failedResult = await sender.send({ content: 'Hello' });

      // Failed message remains in store, user can see and retry
      expect(store.getMessages()).toHaveLength(1);
      expect(store.getMessages()[0].status).toBe(MessageStatus.FAILED);

      // User clicks retry
      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'OK' });

      const retryResult = await sender.send(failedResult);

      // Retry successful
      expect(retryResult.status).toBe(MessageStatus.SENT);
      expect(store.getMessages()).toHaveLength(1);
    });

    it('should use DELETE_FAILED strategy to remove failed messages from the store and keep successful messages', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      // Submission failed
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Validation failed'));

      const result = await sender.send({ content: 'Form data' });

      // Failed message not in list, but returns error information for UI display
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(store.getMessages()).toHaveLength(0);
    });

    it('should use ADD_ON_SUCCESS strategy to add successful messages to the store only after successful send operation', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      // Send multiple tasks
      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        if (msg.content === 'Task 2') {
          return Promise.reject(new Error('Task failed'));
        }
        return Promise.resolve({ result: 'Task completed' });
      });

      await sender.send({ content: 'Task 1' });
      await sender.send({ content: 'Task 2' });
      await sender.send({ content: 'Task 3' });

      // Only successful tasks appear in the list
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Task 1');
      expect(messages[1].content).toBe('Task 3');
    });

    it('should return the same object as the internal object', async () => {
      const message = {
        content: 'Test'
      };
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));
      const result = await sender.send(message);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBe(result);
      expect(messages[0]).not.toBe(message);
    });
  });

  describe('Message status transitions', () => {
    it('KEEP_FAILED: SENDING -> SENT transition', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let sendingMessage: TestMessage | null = null;

      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        sendingMessage = { ...msg };
        return Promise.resolve({ result: 'OK' });
      });

      const result = await sender.send({ content: 'Test' });

      // Sending process is SENDING
      expect(sendingMessage!.status).toBe(MessageStatus.SENDING);

      // After completion is SENT
      expect(result.status).toBe(MessageStatus.SENT);
      expect(store.getMessages()[0].status).toBe(MessageStatus.SENT);
    });

    it('KEEP_FAILED: SENDING -> FAILED transition', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let sendingMessage: TestMessage | null = null;

      mockGateway.sendMessage = vi.fn().mockImplementation((msg) => {
        sendingMessage = { ...msg };
        return Promise.reject(new Error('Failed'));
      });

      const result = await sender.send({ content: 'Test' });

      // Sending process is SENDING
      expect(sendingMessage!.status).toBe(MessageStatus.SENDING);

      // After failure is FAILED
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(store.getMessages()[0].status).toBe(MessageStatus.FAILED);
    });

    it('DELETE_FAILED: SENDING -> SENT (not deleted)', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      const result = await sender.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(store.getMessages()).toHaveLength(1);
    });

    it('DELETE_FAILED: SENDING -> FAILED -> deleted', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await sender.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(store.getMessages()).toHaveLength(0);
    });

    it('ADD_ON_SUCCESS: only enter store when successful', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      const statusLog: number[] = [];

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        statusLog.push(store.getMessages().length); // Should be 0
        return Promise.resolve({ result: 'OK' });
      });

      await sender.send({ content: 'Test' });

      statusLog.push(store.getMessages().length); // Should be 1

      expect(statusLog).toEqual([0, 1]);
    });
  });

  describe('Error information completeness', () => {
    it('failed message should contain complete error information', async () => {
      const testError = new Error('Detailed error message');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const result = await sender.send({ content: 'Test' });

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).message).toBe(
        'Detailed error message'
      );
    });

    it('different strategies should return the same error information', async () => {
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
          gateway: testGateway,
          executor: new MessageSenderExecutor()
        });
        testSender.use(new SenderStrategyPlugin(strategy));

        const result = await testSender.send({ content: 'Test' });

        expect(result.status).toBe(MessageStatus.FAILED);
        expect(result.error).toBeInstanceOf(ExecutorError);
        expect((result.error as ExecutorError).message).toBe('Test error');
      }
    });
  });

  describe('context.parameters.addedToStore flag', () => {
    it('KEEP_FAILED: addedToStore should be true', async () => {
      let capturedFlag: boolean | undefined;

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        public onSuccess(context: MessageSenderContext<TestMessage>): void {
          capturedFlag = context.parameters.addedToStore;
          super.onSuccess(context);
        }
      }

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(capturedFlag).toBe(true);
    });

    it('DELETE_FAILED: addedToStore should be true', async () => {
      let capturedFlag: boolean | undefined;

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        public onSuccess(context: MessageSenderContext<TestMessage>): void {
          capturedFlag = context.parameters.addedToStore;
          super.onSuccess(context);
        }
      }

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.DELETE_FAILED));

      await sender.send({ content: 'Test' });

      expect(capturedFlag).toBe(true);
    });

    it('ADD_ON_SUCCESS: addedToStore should be false', async () => {
      let capturedFlag: boolean | undefined;

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        public onSuccess(context: MessageSenderContext<TestMessage>): void {
          capturedFlag = context.parameters.addedToStore;
          super.onSuccess(context);
        }
      }

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      await sender.send({ content: 'Test' });

      expect(capturedFlag).toBe(false);
    });
  });

  describe('streaming test - onStream', () => {
    it('KEEP_FAILED: onStream should update the message in the store (update result field)', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const chunks: unknown[] = [];

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            // streaming update should update result, not the user's content
            await options.onChunk({ id: msg.id, result: 'chunk 1' });
            await options.onChunk({ id: msg.id, result: 'chunk 2' });
            await options.onChunk({ id: msg.id, result: 'chunk 3' });
          }

          return { result: 'Complete' };
        });

      await sender.send(
        { content: 'Streaming message' },
        {
          onChunk: (chunk) => {
            chunks.push(chunk);
          }
        }
      );

      expect(chunks).toHaveLength(3);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Streaming message');
      expect(messages[0].result).toEqual({ result: 'Complete' });
    });

    it('DELETE_FAILED: onStream should update the message in the store (update result field)', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ id: msg.id, result: 'chunk 1' });
            await options.onChunk({ id: msg.id, result: 'chunk 2' });
          }

          return { result: 'Complete' };
        });

      await sender.send({ content: 'Streaming' }, { onChunk: () => {} });

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Streaming');
      expect(messages[0].result).toEqual({ result: 'Complete' });
    });

    it('ADD_ON_SUCCESS: onStream should not update the store', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      let storeCountDuringChunk = 0;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ id: msg.id, content: 'chunk 1' });
            storeCountDuringChunk = store.getMessages().length;
          }

          return { result: 'Complete' };
        });

      await sender.send({ content: 'Streaming' }, { onChunk: () => {} });

      // during streaming, the store should be empty
      expect(storeCountDuringChunk).toBe(0);

      // after sending, there should be a message
      expect(store.getMessages()).toHaveLength(1);
    });

    it('onStream should handle non-message object chunks', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const receivedChunks: unknown[] = [];

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            // send non-message object chunk
            await options.onChunk('string chunk');
            await options.onChunk(123);
            await options.onChunk({ random: 'object' });
          }

          return { result: 'Complete' };
        });

      await sender.send(
        { content: 'Test' },
        {
          onChunk: (chunk) => {
            receivedChunks.push(chunk);
          }
        }
      );

      // should return the non-message object chunk as is
      expect(receivedChunks).toHaveLength(3);
      expect(receivedChunks[0]).toBe('string chunk');
      expect(receivedChunks[1]).toBe(123);
      expect(receivedChunks[2]).toEqual({ random: 'object' });
    });

    it('onStream should start streaming status during streaming', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let streamingDuringChunk = false;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ id: msg.id, content: 'chunk 1' });
            streamingDuringChunk = store.state.streaming || false;
          }

          return { result: 'Complete' };
        });

      await sender.send({ content: 'Test' }, { onChunk: () => {} });

      // during streaming, streaming should be true
      expect(streamingDuringChunk).toBe(true);

      // after sending, streaming should be false
      expect(store.state.streaming).toBe(false);
    });

    it('onStream should handle new message addition (message not in the store)', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            // send a new message ID (simulate the AI response message returned by the server)
            await options.onChunk({
              id: 'new-message-id',
              content: 'AI response message'
            });
          }

          return { result: 'Complete' };
        });

      await sender.send({ content: 'User message' }, { onChunk: () => {} });

      const messages = store.getMessages();
      // should have user message + server new message (AI response)
      expect(messages).toHaveLength(2);

      const userMessage = messages.find((m) => m.content === 'User message');
      const aiMessage = messages.find((m) => m.id === 'new-message-id');

      expect(userMessage).toBeDefined();
      expect(aiMessage).toBeDefined();
      expect(aiMessage?.content).toBe('AI response message');
    });
  });

  describe('streaming test - onConnected', () => {
    it('onConnected should set message to non-loading status', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let messageDuringConnected: TestMessage | undefined;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onConnected) {
            await options.onConnected();
            messageDuringConnected = store.getMessageById(msg.id);
          }

          return { result: 'Success' };
        });

      await sender.send({ content: 'Test' }, { onConnected: () => {} });

      expect(messageDuringConnected).toBeDefined();
      expect(messageDuringConnected?.loading).toBe(false);
      expect(messageDuringConnected?.status).toBe(MessageStatus.SENDING);
    });

    it('onConnected should start streaming status', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let streamingDuringConnected = false;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
            streamingDuringConnected = store.state.streaming || false;
          }

          return { result: 'Success' };
        });

      await sender.send({ content: 'Test' }, { onConnected: () => {} });

      expect(streamingDuringConnected).toBe(true);
      expect(store.state.streaming).toBe(false); // after sending, streaming should be false
    });

    it('ADD_ON_SUCCESS: onConnected should not affect the store', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      let storeCountDuringConnected = -1;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
            storeCountDuringConnected = store.getMessages().length;
          }

          return { result: 'Success' };
        });

      await sender.send({ content: 'Test' }, { onConnected: () => {} });

      // during connected, the store should be empty
      expect(storeCountDuringConnected).toBe(0);

      // after sending, there should be a message
      expect(store.getMessages()).toHaveLength(1);
    });
  });

  describe('Fallback logic - onConnected not called when the first chunk is sent', () => {
    it('should automatically trigger the connection establishment logic when the first chunk is sent', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let messageBeforeFirstChunk: TestMessage | undefined;
      let messageAfterFirstChunk: TestMessage | undefined;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          // intentionally not calling onConnected

          if (options?.onChunk) {
            messageBeforeFirstChunk = store.getMessageById(msg.id);
            await options.onChunk({ id: msg.id, content: 'chunk 1' });
            messageAfterFirstChunk = store.getMessageById(msg.id);
          }

          return { result: 'Complete' };
        });

      await sender.send({ content: 'Test' }, { onChunk: () => {} });

      // before the first chunk, the message should be loading
      expect(messageBeforeFirstChunk).toBeDefined();
      expect(messageBeforeFirstChunk?.loading).toBe(true);

      // after the first chunk, Fallback should be triggered, set to non-loading
      expect(messageAfterFirstChunk).toBeDefined();
      expect(messageAfterFirstChunk?.loading).toBe(false);
      expect(messageAfterFirstChunk?.status).toBe(MessageStatus.SENDING);
    });

    it('Fallback should not be triggered when the second chunk is sent', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const loadingStates: boolean[] = [];

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onChunk) {
            await options.onChunk({ id: msg.id, result: 'chunk 1' });
            loadingStates.push(store.getMessageById(msg.id)?.loading || false);

            await options.onChunk({ id: msg.id, result: 'chunk 2' });
            loadingStates.push(store.getMessageById(msg.id)?.loading || false);
          }

          return { result: 'Complete' };
        });

      await sender.send({ content: 'Test' }, { onChunk: () => {} });

      // after the first chunk, it should be false, and the second chunk should also be false
      expect(loadingStates).toEqual([false, false]);
    });
  });

  describe('Abort error handling - MessageStatus.STOPPED', () => {
    it('stopped message should set status to STOPPED', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor(),
        aborter: aborter
      });

      sender.use(
        new AborterPlugin({
          aborter: sender.aborter,
          getConfig: toAborterConfig
        })
      );
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let resolveGateway: ((value: unknown) => void) | null = null;
      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      const sendPromise = sender.send({ id: 'test-msg-3', content: 'Test' });

      // wait for the message to start sending
      await vi.advanceTimersByTimeAsync(0);

      // stop the message
      const stopped = sender.stop('test-msg-3');
      expect(stopped).toBe(true);

      // @ts-expect-error resolve the gateway promise to allow the abort to complete
      resolveGateway?.('Should not reach');

      const result = await sendPromise;
      expect(result.status).toBe(MessageStatus.STOPPED);
      expect(result.loading).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('KEEP_FAILED: stopped message should be kept in the store', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor(),
        aborter: aborter
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let resolveGateway: (value: unknown) => void;
      mockGateway.sendMessage = vi.fn().mockReturnValue(
        new Promise<unknown>((resolve) => {
          resolveGateway = resolve;
        })
      );

      const options = { id: 'test-msg', content: 'Test' };
      const { signal } = aborter.register({
        abortId: options.id
      });

      const sendPromise = sender.send(options, { signal });
      await vi.advanceTimersByTimeAsync(0);

      sender.stop(options.id);

      // @ts-expect-error resolve the gateway promise to allow the abort to complete
      resolveGateway?.('Should not reach');

      const result = await sendPromise;
      const messages = store.getMessages();

      expect(messages).toHaveLength(1);
      expect(messages[0].status).toBe(MessageStatus.STOPPED);
      expect(messages[0].id).toBe(result.id);
    });

    it('DELETE_FAILED: stopped message should not be deleted (only delete FAILED)', async () => {
      const controller = new AbortController();

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED));

      let resolveGateway: ((value: unknown) => void) | null = null;
      mockGateway.sendMessage = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveGateway = resolve;
        })
      );

      const sendPromise = sender.send(
        { id: 'test-msg', content: 'Test' },
        {
          signal: controller.signal
        }
      );
      await vi.advanceTimersByTimeAsync(0);

      controller.abort();

      // @ts-expect-error resolve the gateway promise to allow the abort to complete
      resolveGateway?.('Should not reach');

      const result = await sendPromise;

      // STOPPED message should be kept (different from FAILED)
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].status).toBe(MessageStatus.STOPPED);
      expect(result).toBeDefined();
    });

    it('ADD_ON_SUCCESS: stopped message should not be added to the store', async () => {
      const aborterPlugin = new AborterPlugin({
        pluginName: 'test-aborter',
        getConfig: toAborterConfig
      });

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor(),
        aborter: aborterPlugin.getAborter()
      });

      sender.use(aborterPlugin);
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.ADD_ON_SUCCESS));

      let resolveGateway: ((value: unknown) => void) | null = null;
      mockGateway.sendMessage = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveGateway = resolve;
        })
      );

      const sendPromise = sender.send({ id: 'test-msg', content: 'Test' });
      await vi.advanceTimersByTimeAsync(0);

      const stopped = sender.stop('test-msg');
      expect(stopped).toBe(true);

      // @ts-expect-error resolve the gateway promise to allow the abort to complete
      resolveGateway?.('Should not reach');

      await sendPromise;

      // the store should be empty
      expect(store.getMessages()).toHaveLength(0);
    });

    it('should call the gatewayOptions.onAborted callback', async () => {
      const controller = new AbortController();
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });

      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let abortedMessage: TestMessage | undefined;
      let onAbortedCalled = false;

      let resolveGateway: ((value: unknown) => void) | null = null;
      mockGateway.sendMessage = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveGateway = resolve;
        })
      );

      const sendPromise = sender.send(
        { id: 'test-msg', content: 'Test' },
        {
          signal: controller.signal,
          onAborted: (msg) => {
            onAbortedCalled = true;
            abortedMessage = msg as TestMessage;
          }
        }
      );

      await vi.advanceTimersByTimeAsync(0);
      controller.abort();

      // @ts-expect-error resolve the gateway promise to allow the abort to complete
      resolveGateway?.('Should not reach');

      await sendPromise;

      expect(onAbortedCalled).toBe(true);
      expect(abortedMessage).toBeDefined();
      expect(abortedMessage?.status).toBe(MessageStatus.STOPPED);
    });

    it('onAborted callback error should not affect the main process', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor(),
        aborter: aborter
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let resolveGateway: ((value: unknown) => void) | null = null;
      mockGateway.sendMessage = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveGateway = resolve;
        })
      );

      const sendConfig = { id: 'test-msg', content: 'Test' };
      const signal = aborter.register({ abortId: sendConfig.id }).signal;
      const sendPromise = sender.send(sendConfig, {
        signal,
        onAborted: () => {
          throw new Error('Callback error');
        }
      });

      await vi.advanceTimersByTimeAsync(0);
      const stopped = sender.stop('test-msg');
      expect(stopped).toBe(true);

      // @ts-expect-error resolve the gateway promise to allow the abort to complete
      resolveGateway?.('Should not reach');

      // should not throw an error
      await expect(sendPromise).resolves.toBeDefined();

      const result = await sendPromise;
      expect(result.status).toBe(MessageStatus.STOPPED);
    });
  });

  describe('Logger integration test', () => {
    it('should log when streaming starts', async () => {
      const mockLogger = {
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

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(
        new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED, mockLogger)
      );

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }
          return { result: 'Success' };
        });

      await sender.send({ content: 'Test' }, { onConnected: () => {} });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('startStreaming')
      );
    });

    it('should log when streaming ends', async () => {
      const mockLogger = {
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

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(
        new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED, mockLogger)
      );

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }
          return { result: 'Success' };
        });

      await sender.send({ content: 'Test' }, { onConnected: () => {} });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('endStreaming')
      );
    });

    it('should log when each chunk is sent', async () => {
      const mockLogger = {
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

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(
        new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED, mockLogger)
      );

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ id: msg.id, result: 'chunk 1' });
            await options.onChunk({ id: msg.id, result: 'chunk 2' });
            await options.onChunk({ id: msg.id, result: 'chunk 3' });
          }

          return { result: 'Complete' };
        });

      await sender.send({ content: 'Test' }, { onChunk: () => {} });

      // should log for each chunk
      const streamLogCalls = mockLogger.debug.mock.calls.filter((call) =>
        call[0].includes('onStream')
      );
      expect(streamLogCalls).toHaveLength(3);

      // check the number of chunks in the log
      expect(streamLogCalls[0][0]).toContain('#1');
      expect(streamLogCalls[1][0]).toContain('#2');
      expect(streamLogCalls[2][0]).toContain('#3');
    });

    it('should log when Fallback is triggered', async () => {
      const mockLogger = {
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

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(
        new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED, mockLogger)
      );

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          // intentionally not calling onConnected, trigger Fallback
          if (options?.onChunk) {
            await options.onChunk({ id: msg.id, result: 'chunk 1' });
          }
          return { result: 'Complete' };
        });

      await sender.send({ content: 'Test' }, { onChunk: () => {} });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fallback')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Connection established on first chunk')
      );
    });
  });

  describe('cleanup method test', () => {
    it('cleanup should stop streaming status', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }
          return { result: 'Success' };
        });

      await sender.send({ content: 'Test' }, { onConnected: () => {} });

      // after sending, streaming should be false
      expect(store.state.streaming).toBe(false);
    });

    it('cleanup should be called after success', async () => {
      let cleanupCalled = false;

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        protected cleanup(context: MessageSenderContext<TestMessage>): void {
          cleanupCalled = true;
          super.cleanup(context);
        }
      }

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(cleanupCalled).toBe(true);
    });

    it('cleanup should be called after failure', async () => {
      let cleanupCalled = false;

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        protected cleanup(context: MessageSenderContext<TestMessage>): void {
          cleanupCalled = true;
          super.cleanup(context);
        }
      }

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      await sender.send({ content: 'Test' });

      expect(cleanupCalled).toBe(true);
    });

    it('cleanup should be called after stopped', async () => {
      let cleanupCalled = false;

      class TestPlugin extends SenderStrategyPlugin<TestMessage> {
        /**
         * @override
         */
        protected cleanup(context: MessageSenderContext<TestMessage>): void {
          cleanupCalled = true;
          super.cleanup(context);
        }
      }

      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor(),
        aborter: aborter
      });
      sender.use(new TestPlugin(SendFailureStrategy.KEEP_FAILED));

      let resolveGateway: ((value: unknown) => void) | null = null;
      mockGateway.sendMessage = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveGateway = resolve;
        })
      );

      const sendConfig = { id: 'test-msg', content: 'Test' };
      const signal = aborter.register({ abortId: sendConfig.id }).signal;
      const sendPromise = sender.send(sendConfig, { signal });
      await vi.advanceTimersByTimeAsync(0);

      const stopped = sender.stop('test-msg');
      expect(stopped).toBe(true);

      // @ts-expect-error resolve the gateway promise to allow the abort to complete
      resolveGateway?.('Should not reach');

      await sendPromise;

      expect(cleanupCalled).toBe(true);
    });
  });

  describe('complex streaming scenario', () => {
    it('should support mixed content streaming', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      const allChunks: unknown[] = [];

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            // mixed message object and normal data
            await options.onChunk({ id: msg.id, result: 'chunk 1' });
            await options.onChunk('text data');
            await options.onChunk({ id: msg.id, result: 'chunk 2' });
            await options.onChunk({ number: 123 });
          }

          return { result: 'Complete' };
        });

      await sender.send(
        { content: 'Test' },
        {
          onChunk: (chunk) => {
            allChunks.push(chunk);
          }
        }
      );

      expect(allChunks).toHaveLength(4);

      // the store should only have the user message, result should be updated
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test');
      expect(messages[0].result).toEqual({ result: 'Complete' });
    });

    it('should support error recovery in streaming', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      let errorThrown = false;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (msg, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ id: msg.id, result: 'chunk 1' });
            // throw an error in the middle
            errorThrown = true;
            throw new Error('Stream error');
          }

          return { result: 'Should not reach' };
        });

      const result = await sender.send(
        { content: 'Test' },
        { onChunk: () => {} }
      );

      expect(errorThrown).toBe(true);
      expect(result.status).toBe(MessageStatus.FAILED);

      // the message should retain the last status
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test');
      expect(messages[0].result).toBe('chunk 1');
    });

    it('should handle empty chunk list', async () => {
      sender = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
      });
      sender.use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          return { result: 'Complete' };
        });

      const result = await sender.send(
        { content: 'Test' },
        { onChunk: () => {} }
      );

      expect(result.status).toBe(MessageStatus.SENT);
      expect(store.getMessages()).toHaveLength(1);
    });
  });
});
