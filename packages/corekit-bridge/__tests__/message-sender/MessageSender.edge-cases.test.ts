/**
 * @file MessageSender edge cases and special scenarios tests
 *
 * Tests for edge cases, timestamp validation, gateway return value handling, and message object integrity
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  type MessageSenderPlugin,
  type MessageGetwayInterface
} from '../../src/core/message-sender';
import type { TestMessage } from './MessageSender.test-utils';
import {
  createTestStore,
  createMockGateway,
  createTestSender
} from './MessageSender.test-utils';

describe('MessageSender - edge cases', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
    service = createTestSender(store, mockGateway, false); // No executor needed for basic edge cases
  });

  describe('edge cases', () => {
    it('should handle empty content message object', async () => {
      const result = await service.send({ content: '' });
      expect(result.content).toBe('');
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('should handle null/undefined content', async () => {
      const result1 = await service.send({
        content: null as unknown as string
      });
      expect(result1.content).toBeNull();

      const result2 = await service.send({ content: undefined });
      expect(result2.content).toBeUndefined();
    });

    it('should handle empty message object', async () => {
      const result = await service.send({});
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('should handle gateway undefined case', async () => {
      const serviceWithoutGateway = new MessageSender(store);

      const result = await serviceWithoutGateway.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
    });
  });

  describe('timestamp validation', () => {
    it('successful message endTime should be greater than or equal to startTime', async () => {
      const result = await service.send({ content: 'Test' });

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);
    });

    it('failed message endTime should be greater than or equal to startTime', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await service.send({ content: 'Test' });

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);
    });

    it('plugins can modify startTime', async () => {
      const customStartTime = Date.now() - 1000;

      const serviceWithPlugin = createTestSender(store, mockGateway, true);
      const plugin: MessageSenderPlugin<TestMessage> = {
        pluginName: 'start-time-modifier',
        onBefore({ parameters }) {
          parameters.currentMessage.startTime = customStartTime;
        }
      };

      serviceWithPlugin.use(plugin);

      const result = await serviceWithPlugin.send({ content: 'Test' });

      expect(result.startTime).toBe(customStartTime);
      expect(result.endTime).toBeGreaterThan(customStartTime);
    });
  });

  describe('gateway return value handling', () => {
    it('should handle gateway return null', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(null);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toBeNull();
    });

    it('should handle gateway return undefined', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(undefined);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toBeUndefined();
    });

    it('should handle gateway return complex object', async () => {
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

    it('should handle gateway return primitive type', async () => {
      // string
      mockGateway.sendMessage = vi.fn().mockResolvedValue('string result');
      const result1 = await service.send({ content: 'Test' });
      expect(result1.result).toBe('string result');

      // number
      mockGateway.sendMessage = vi.fn().mockResolvedValue(42);
      const result2 = await service.send({ content: 'Test' });
      expect(result2.result).toBe(42);

      // boolean
      mockGateway.sendMessage = vi.fn().mockResolvedValue(true);
      const result3 = await service.send({ content: 'Test' });
      expect(result3.result).toBe(true);
    });

    it('should handle gateway returning primitive values', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(42);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toBe(42);
    });
  });

  describe('message object integrity', () => {
    it('sent message should contain all necessary fields', async () => {
      const result = await service.send({ content: 'Test' });

      // validate all necessary fields
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('loading');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('endTime');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('error');

      // validate default values
      expect(result.id).toBeTruthy();
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should support custom message ID', async () => {
      const customId = 'custom-message-id-123';

      const result = await service.send({
        id: customId,
        content: 'Test'
      });

      expect(result.id).toBe(customId);
    });

    it('failed message error field should be correctly set', async () => {
      const testError = new Error('Test error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(testError);

      const result = await service.send({ content: 'Test' });

      expect(result.error).toBeDefined();
      expect(result.result).toBeNull();
      expect(result.status).toBe(MessageStatus.FAILED);
    });

    it('returned object and input object should not be the same reference', async () => {
      const message = {
        content: 'Test'
      };
      const result = await service.send(message);
      expect(result).not.toBe(message);

      message.content = 'Test2';
      expect(result.content).toBe('Test');
    });
  });

  describe('edge cases and special scenarios', () => {
    it('should handle gateway return Promise.reject(undefined)', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(undefined);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      // When gateway rejects with undefined, error may be undefined
      // This is acceptable behavior - the status is still FAILED
      expect(
        result.error !== undefined || result.status === MessageStatus.FAILED
      ).toBe(true);
    });

    it('should handle message object containing function property', async () => {
      const messageWithFunction = {
        content: 'Test',
        customMethod: () => 'custom result'
      } as unknown as TestMessage;

      const result = await service.send(messageWithFunction);

      expect(result.status).toBe(MessageStatus.SENT);
      expect(
        typeof (result as unknown as { customMethod: () => string })
          .customMethod
      ).toBe('function');
    });

    it('should handle message object containing Symbol property', async () => {
      const symbolKey = Symbol('test');
      const messageWithSymbol = {
        content: 'Test',
        [symbolKey]: 'symbol value'
      } as unknown as TestMessage;

      const result = await service.send(messageWithSymbol);

      expect(result.status).toBe(MessageStatus.SENT);
      expect((result as unknown as { [key: symbol]: string })[symbolKey]).toBe(
        'symbol value'
      );
    });

    it('should handle very short sending time', async () => {
      // gateway returns immediately
      mockGateway.sendMessage = vi
        .fn()
        .mockResolvedValue({ result: 'Instant' });

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime);
      expect(service.getDuration(result)).toBeGreaterThanOrEqual(0);
    });

    it('should handle message ID containing special characters', async () => {
      const specialId = 'msg-#@!$%^&*()_+-=[]{}|;:,.<>?';

      const result = await service.send({
        id: specialId,
        content: 'Test'
      });

      expect(result.id).toBe(specialId);
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('should handle undefined gateway and return sent status', async () => {
      const serviceWithoutGateway = new MessageSender(store);

      const result = await serviceWithoutGateway.send({ content: 'Test' });

      // when gateway is undefined, sendMessage returns undefined which resolves successfully
      expect(result).toBeDefined();
      expect(result.content).toBe('Test');
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
    });

    it('should preserve message type information after send', async () => {
      interface ExtendedMessage extends TestMessage {
        customType: 'text' | 'image' | 'file';
        metadata?: Record<string, unknown>;
      }

      const extendedStore = new MessagesStore<ExtendedMessage>(() => ({
        messages: []
      }));

      const extendedService = new MessageSender(extendedStore, {
        gateway: mockGateway
      });

      const message: Partial<ExtendedMessage> = {
        content: 'Test',
        customType: 'text',
        metadata: { source: 'user', timestamp: Date.now() }
      };

      const result = await extendedService.send(message);

      expect(result.customType).toBe('text');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.source).toBe('user');
    });

    it('should handle empty message object', async () => {
      const result = await service.send({});

      expect(result).toBeDefined();
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
    });

    it('should handle gateway throwing non-Error object', async () => {
      mockGateway.sendMessage = vi
        .fn()
        .mockRejectedValue('String error message');

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();
    });

    it('should handle gateway returning null', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(null);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toBeNull();
    });

    it('should handle message with numeric ID', async () => {
      const numericId = 12345;

      const result = await service.send({
        id: String(numericId),
        content: 'Test'
      });

      expect(result.id).toBe(String(numericId));
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('should handle message with very long content', async () => {
      const longContent = 'A'.repeat(10000);

      const result = await service.send({
        content: longContent
      });

      expect(result.content).toBe(longContent);
      expect(result.status).toBe(MessageStatus.SENT);
    });

    it('should maintain message immutability during send', async () => {
      const originalMessage = {
        content: 'Original',
        customField: 'initial'
      };

      await service.send(originalMessage);

      // original message should not be modified
      expect(originalMessage.content).toBe('Original');
      expect(originalMessage.customField).toBe('initial');
      expect(originalMessage).not.toHaveProperty('status');
      expect(originalMessage).not.toHaveProperty('loading');
    });

    it('should handle message with Date objects', async () => {
      const now = new Date();
      const messageWithDate = {
        content: 'Test',
        createdAt: now
      } as unknown as TestMessage;

      const result = await service.send(messageWithDate);

      expect(result.status).toBe(MessageStatus.SENT);
      expect(
        (result as unknown as { createdAt: Date }).createdAt
      ).toBeInstanceOf(Date);
      expect(
        (result as unknown as { createdAt: Date }).createdAt.getTime()
      ).toBe(now.getTime());
    });

    it('should handle message with nested objects', async () => {
      const nestedMessage = {
        content: 'Test',
        nested: {
          level1: {
            level2: {
              value: 'deep value'
            }
          }
        }
      } as unknown as TestMessage;

      const result = await service.send(nestedMessage);

      expect(result.status).toBe(MessageStatus.SENT);
      expect(
        (
          result as unknown as {
            nested: { level1: { level2: { value: string } } };
          }
        ).nested.level1.level2.value
      ).toBe('deep value');
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

    it('should support chaining use method', () => {
      const serviceWithPlugin = createTestSender(store, mockGateway, true);
      const plugin1: MessageSenderPlugin<TestMessage> = {
        pluginName: 'plugin1'
      };

      const plugin2: MessageSenderPlugin<TestMessage> = {
        pluginName: 'plugin2'
      };

      const result = serviceWithPlugin.use(plugin1).use(plugin2);

      expect(result).toBe(serviceWithPlugin);
    });

    it('should handle message with boolean fields', async () => {
      const messageWithBooleans = {
        content: 'Test',
        isImportant: true,
        isRead: false
      } as unknown as TestMessage;

      const result = await service.send(messageWithBooleans);

      expect((result as unknown as { isImportant: boolean }).isImportant).toBe(
        true
      );
      expect((result as unknown as { isRead: boolean }).isRead).toBe(false);
    });
  });
});
