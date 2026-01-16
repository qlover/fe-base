/**
 * @file MessageSender constructor tests
 *
 * Tests for MessageSender constructor and initialization
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageSenderExecutor,
  type MessageGetwayInterface
} from '../../src/core/message-sender';
import type { TestMessage } from './MessageSender.test-utils';
import {
  createTestStore,
  createMockGateway
} from './MessageSender.test-utils';

describe('MessageSender - constructor', () => {
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
  });

  it('should correctly initialize', () => {
    const service = new MessageSender(store, {
      gateway: mockGateway
    });

    expect(service.getMessageStore()).toBe(store);
    expect(service.getGateway()).toBe(mockGateway);
  });

  it('should support passing no config', () => {
    const minimalService = new MessageSender(store);
    expect(minimalService.getMessageStore()).toBe(store);
    expect(minimalService.getGateway()).toBeUndefined();
  });

  it('should support passing only gateway', () => {
    const serviceWithGateway = new MessageSender(store, {
      gateway: mockGateway
    });
    expect(serviceWithGateway.getGateway()).toBe(mockGateway);
  });

  it('should correctly set throwIfError config', () => {
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
