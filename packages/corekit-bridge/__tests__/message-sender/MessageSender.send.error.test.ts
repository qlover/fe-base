/**
 * @file MessageSender error handling tests
 *
 * Tests for error handling in message sending
 */
import { ExecutorError } from '@qlover/fe-corekit';
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

describe('MessageSender - send (error handling)', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
    service = createTestSender(store, mockGateway, false); // No executor needed for error tests
  });

  it('default mode: return failed message when sending fails (without throwing error)', async () => {
    const error = new Error('Network error');
    mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

    const result = await service.send({ content: 'Failed message' });

    expect(result).toBeDefined();
    expect(result.content).toBe('Failed message');
    expect(result.status).toBe(MessageStatus.FAILED);
    expect(result.loading).toBe(false);
    expect(result.error).toBe(error);
  });

  it('throwIfError=true: throw error when sending fails', async () => {
    const errorService = new MessageSender(store, {
      gateway: mockGateway,
      throwIfError: true
    });

    const error = new Error('Network error');
    mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

    await expect(errorService.send({ content: 'Failed message' })).rejects.toBe(
      error
    );

    await expect(
      errorService.send({ content: 'Failed message' })
    ).rejects.toMatchObject({
      message: error.message
    });
  });

  it('throwIfError=true: successful messages should return normally', async () => {
    const errorService = new MessageSender(store, {
      gateway: mockGateway,
      throwIfError: true
    });

    mockGateway.sendMessage = vi.fn().mockResolvedValue({
      result: 'Success'
    });

    const result = await errorService.send({ content: 'Success message' });

    expect(result).toBeDefined();
    expect(result.status).toBe(MessageStatus.SENT);
    expect(result.loading).toBe(false);
  });

  it('should rewrite UNKNOWN_ASYNC_ERROR to MESSAGE_SENDER_ERROR', async () => {
    const unknownError = new ExecutorError('Unknown error');
    // @ts-expect-error
    unknownError.id = 'UNKNOWN_ASYNC_ERROR';

    mockGateway.sendMessage = vi.fn().mockRejectedValue(unknownError);

    const result = await service.send({ content: 'Test' });

    expect(result.error).toBeInstanceOf(ExecutorError);
    expect((result.error as ExecutorError).id).toBe(unknownError.id);
  });

  it('should not modify other ExecutorError IDs', async () => {
    const customError = new ExecutorError('Custom error');
    // @ts-expect-error
    customError.id = 'CUSTOM_ERROR_ID';

    mockGateway.sendMessage = vi.fn().mockRejectedValue(customError);

    const result = await service.send({ content: 'Test' });

    expect(result.error).toBeInstanceOf(ExecutorError);
    expect((result.error as ExecutorError).id).toBe('CUSTOM_ERROR_ID');
  });
});
