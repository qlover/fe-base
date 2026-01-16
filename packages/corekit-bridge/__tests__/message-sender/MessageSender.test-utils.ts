/**
 * @file Shared test utilities for MessageSender tests
 *
 * Common setup and utilities used across MessageSender test files
 */
import { vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageSenderExecutor,
  type MessageGetwayInterface,
  type MessageStoreMsg
} from '../../src/core/message-sender';

/**
 * Test message type for MessageSender tests
 */
export interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

/**
 * Create a test store instance
 */
export function createTestStore(): MessagesStore<TestMessage> {
  return new MessagesStore(() => ({
    messages: []
  }));
}

/**
 * Create a mock gateway instance
 */
export function createMockGateway(): MessageGetwayInterface {
  return {
    sendMessage: vi.fn().mockResolvedValue({ result: 'Gateway response' })
  };
}

/**
 * Create a test MessageSender instance
 *
 * @param store - Optional store instance
 * @param gateway - Optional gateway instance
 * @param withExecutor - Whether to create executor (default: true, needed for plugins)
 */
export function createTestSender(
  store?: MessagesStore<TestMessage>,
  gateway?: MessageGetwayInterface,
  withExecutor: boolean = true
): MessageSender<TestMessage> {
  const testStore = store || createTestStore();
  const testGateway = gateway || createMockGateway();

  const config: Parameters<typeof MessageSender.prototype.constructor>[1] = {
    gateway: testGateway
  };

  if (withExecutor) {
    config.executor = new MessageSenderExecutor<TestMessage>();
  }

  return new MessageSender(testStore, config);
}
