/**
 * @file MessageSender concurrent scenario tests
 *
 * Tests for concurrent message sending scenarios
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

describe('MessageSender - concurrent scenario', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
    service = createTestSender(store, mockGateway, false); // No executor needed for concurrent tests
  });

  it('should support concurrent sending multiple messages', async () => {
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

  it('concurrent sending, some failed does not affect other messages', async () => {
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
      service.send({ content: 'Message 2' }), // this one will fail
      service.send({ content: 'Message 3' })
    ];

    const results = await Promise.all(promises);

    expect(results[0].status).toBe(MessageStatus.SENT);
    expect(results[1].status).toBe(MessageStatus.FAILED);
    expect(results[2].status).toBe(MessageStatus.SENT);
  });
});
