/**
 * @file MessageSender basic send functionality tests
 *
 * Tests for basic message sending operations
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  type MessageGetwayInterface
} from '../../src/core/message-sender';
import type { TestMessage } from './MessageSender.test-utils';
import {
  createTestStore,
  createMockGateway,
  createTestSender
} from './MessageSender.test-utils';

describe('MessageSender - send (basic functionality)', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
    service = createTestSender(store, mockGateway, false); // No executor needed for basic send
  });

  it('should successfully send message object', async () => {
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

  it('should call gateway to send message(no executor)', async () => {
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
  it('should call gateway to send message(executor)', async () => {
    const message = { content: 'Test' };
    service = createTestSender(store, mockGateway, true);

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

  it('should not automatically operate store', async () => {
    const message = { content: 'Test' };

    await service.send(message);

    const messages = store.getMessages();
    expect(messages).toHaveLength(0);
  });

  it('should correctly set initial message status', async () => {
    const message = { content: 'Test' };

    const result = await service.send(message);

    expect(result.status).toBe(MessageStatus.SENT);
    expect(result.loading).toBe(false);
    expect(result.startTime).toBeDefined();
    expect(result.endTime).toBeDefined();
    expect(result.endTime).toBeGreaterThanOrEqual(result.startTime!);
  });

  it('should support sending message objects with additional properties', async () => {
    const message = {
      content: 'Test',
      placeholder: 'Typing...',
      customField: 'custom value'
    };

    const result = await service.send(message);

    expect(result.content).toBe('Test');
    expect(result.placeholder).toBe('Typing...');
    expect((result as unknown as { customField: string }).customField).toBe(
      'custom value'
    );
  });

  describe('send - complete flow', () => {
    it('should complete the complete successful send flow', async () => {
      const result = await service.send({
        content: 'Hello World',
        placeholder: 'Sending...'
      });

      expect(result.content).toBe('Hello World');
      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.loading).toBe(false);
      expect(mockGateway.sendMessage).toHaveBeenCalledTimes(1);

      // MessageSender does not automatically operate the store
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });

    it('should complete the complete failed send flow', async () => {
      const error = new Error('Send failed');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      const result = await service.send({
        content: 'Failed Message'
      });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should support sending multiple messages consecutively', async () => {
      const result1 = await service.send({ content: 'Message 1' });
      const result2 = await service.send({ content: 'Message 2' });
      const result3 = await service.send({ content: 'Message 3' });

      expect(result1.status).toBe(MessageStatus.SENT);
      expect(result2.status).toBe(MessageStatus.SENT);
      expect(result3.status).toBe(MessageStatus.SENT);

      // MessageSender does not automatically operate store
      const messages = store.getMessages();
      expect(messages).toHaveLength(0);
    });
  });
});
