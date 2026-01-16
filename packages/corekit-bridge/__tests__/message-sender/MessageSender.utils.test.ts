/**
 * @file MessageSender utility methods tests
 *
 * Tests for utility methods including getMessageStore, getGateway, getDuration, and message retry
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  MessageSenderExecutor,
  type MessageGetwayInterface
} from '../../src/core/message-sender';
import type { ExecutorPlugin } from '@qlover/fe-corekit';
import type { MessageSenderContextOptions } from '../../src/core/message-sender';
import type { TestMessage } from './MessageSender.test-utils';
import {
  createTestStore,
  createMockGateway,
  createTestSender
} from './MessageSender.test-utils';

describe('MessageSender - utility methods', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
    service = createTestSender(store, mockGateway, false); // No executor needed for utils
  });

  describe('getMessageStore', () => {
    it('should return MessagesStore instance', () => {
      const messageStore = service.getMessageStore();

      expect(messageStore).toBe(store);
    });

    it('should return the same reference as the store passed in the constructor', () => {
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
    it('should return the configured gateway', () => {
      const gateway = service.getGateway();

      expect(gateway).toBe(mockGateway);
    });

    it('should return undefined if no gateway is configured', () => {
      const serviceWithoutGateway = new MessageSender(store);

      expect(serviceWithoutGateway.getGateway()).toBeUndefined();
    });

    it('should return the gateway configured in the constructor', () => {
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
    it('should return the duration of the message', async () => {
      const result = await service.send({ content: 'Test' });

      const duration = service.getDuration(result);

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(duration).toBe(result.endTime - result.startTime);
    });

    it('should return 0 if endTime is 0', () => {
      const message = store.createMessage({
        content: 'Test',
        startTime: Date.now(),
        endTime: 0
      });

      const duration = service.getDuration(message);

      expect(duration).toBe(0);
    });

    it('should calculate the correct time difference', () => {
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

    it('should handle message duration is 0 case', () => {
      const sameTime = Date.now();

      const message = store.createMessage({
        content: 'Test',
        startTime: sameTime,
        endTime: sameTime
      });

      const duration = service.getDuration(message);

      expect(duration).toBe(0);
    });

    it('should handle getDuration with message without endTime', () => {
      const incompleteMessage = {
        id: 'test',
        startTime: Date.now(),
        endTime: 0
      } as TestMessage;

      const duration = service.getDuration(incompleteMessage);

      expect(duration).toBe(0);
    });
  });

  describe('message retry', () => {
    it('should support error message retry(error message saved to store)', async () => {
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue(new Error('Test error'));

      const result = await service.send({ content: 'failed' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe('Test error');

      // message saved to store should have retry count
      store.addMessage(result);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(result);

      // send again
      mockGateway.sendMessage = vi
        .fn()
        .mockResolvedValue({ result: 'gateway result' });

      const serviceWithPlugin = createTestSender(store, mockGateway, true);
      const plugin: ExecutorPlugin<
        MessageSenderContextOptions<TestMessage>
      > = {
        pluginName: 'retry-plugin',
        async onBefore({ parameters }) {
          expect(parameters.currentMessage.id).toEqual(result.id);
        }
      };

      serviceWithPlugin.use(plugin);

      // when retry, pass a new object, keep id, but do not pass old error
      const result2 = await serviceWithPlugin.send({
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
});
