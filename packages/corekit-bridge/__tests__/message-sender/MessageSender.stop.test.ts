/**
 * @file MessageSender stop functionality tests
 *
 * Tests for stop and stopAll methods
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  MessageSenderExecutor,
  type MessageGetwayInterface,
  MessageSenderOptions
} from '../../src/core/message-sender';
import { Aborter, AborterConfig, AborterPlugin } from '@qlover/fe-corekit';
import type { TestMessage } from './MessageSender.test-utils';
import { createTestStore, createMockGateway } from './MessageSender.test-utils';

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

describe('MessageSender - stop functionality', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;
  let aborter: Aborter;

  beforeEach(() => {
    vi.useFakeTimers();
    store = createTestStore();
    mockGateway = createMockGateway();
    aborter = new Aborter('TestAborter');

    service = new MessageSender(store, {
      gateway: mockGateway,
      executor: new MessageSenderExecutor(),
      aborter: aborter
    });

    service.use(
      new AborterPlugin({
        aborter: aborter,
        getConfig: toAborterConfig
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('stop - stop single message', () => {
    it('should be able to stop sending message', async () => {
      // create a delayed gateway response
      let resolveGateway: ((value: unknown) => void) | null = null;

      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      // start sending message
      const sendPromise = service.send({ id: 'test-message', content: 'Test' });

      // advance timers to allow executor to run onBefore hook
      await vi.advanceTimersByTimeAsync(0);

      // stop message sending
      const stopped = service.stop('test-message');
      // should return true to indicate successful stop
      expect(stopped).toBe(true);

      // wait for sending to complete (should be cancelled)
      const result = await sendPromise;

      // message should be marked as failed or stopped
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });

    it('should return false if message ID does not exist', () => {
      const stopped = service.stop('non-existent-id');

      expect(stopped).toBe(false);
    });

    it('should not affect other messages sending', async () => {
      // create two delayed gateway responses
      const promises: Array<((value: { result: string }) => void) | null> = [];
      let callCount = 0;

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        const index = callCount++;
        return new Promise((resolve) => {
          promises[index] = resolve;
        });
      });

      // start sending two messages
      const sendPromise1 = service.send({
        id: 'message-1',
        content: 'Message 1'
      });
      const sendPromise2 = service.send({
        id: 'message-2',
        content: 'Message 2'
      });

      // advance timers to ensure messages are registered
      await vi.advanceTimersByTimeAsync(0);

      // stop only the first message
      service.stop('message-1');

      // complete the second message
      promises[1]?.({ result: 'Success' });

      // advance timers for abort and resolve to process
      await vi.advanceTimersByTimeAsync(0);
      const result2 = await sendPromise2;

      // second message should be successful
      expect(result2.status).toBe(MessageStatus.SENT);
      expect(result2.result).toEqual({ result: 'Success' });

      // first message should be cancelled
      const result1 = await sendPromise1;
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result1.status
      );
    });
  });

  describe('stopAll - stop all messages', () => {
    it('should stop all messages sending', async () => {
      // create multiple delayed gateway responses
      const promises: Array<((value: { result: string }) => void) | null> = [];
      let callCount = 0;

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        const index = callCount++;
        return new Promise((resolve) => {
          promises[index] = resolve;
        });
      });

      // start sending multiple messages
      const sendPromise1 = service.send({
        id: 'message-1',
        content: 'Message 1'
      });
      const sendPromise2 = service.send({
        id: 'message-2',
        content: 'Message 2'
      });
      const sendPromise3 = service.send({
        id: 'message-3',
        content: 'Message 3'
      });

      // advance timers to ensure messages are registered
      await vi.advanceTimersByTimeAsync(0);

      // stop all messages
      service.stopAll();

      // advance timers for aborts to process
      await vi.advanceTimersByTimeAsync(0);

      // wait for all messages to complete
      const results = await Promise.all([
        sendPromise1,
        sendPromise2,
        sendPromise3
      ]);

      // all messages should be cancelled or failed
      results.forEach((result) => {
        expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
          result.status
        );
      });
    });

    it('should be able to call when there are no messages sending', () => {
      // should not throw error
      expect(() => {
        service.stopAll();
      }).not.toThrow();
    });

    it('should be able to continue sending new message after stopping', async () => {
      // create delayed gateway response
      let resolveGateway: ((value: unknown) => void) | null = null;
      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValueOnce(gatewayPromise);

      // start sending message
      const sendPromise = service.send({
        id: 'message-1',
        content: 'Message 1'
      });

      // advance timers to ensure message is registered
      await vi.advanceTimersByTimeAsync(0);

      // stop all messages
      service.stopAll();

      // advance timers for abort to process
      await vi.advanceTimersByTimeAsync(0);
      await sendPromise;

      // reset mock, return success
      mockGateway.sendMessage = vi
        .fn()
        .mockResolvedValue({ result: 'Success' });

      // send new message
      const newResult = await service.send({ content: 'New message' });

      // new message should be successful
      expect(newResult.status).toBe(MessageStatus.SENT);
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });
  });

  describe('stop with aborter directly (without plugin)', () => {
    it('should be able to stop message using aborter.abort() directly', async () => {
      // create a delayed gateway response
      let resolveGateway: ((value: unknown) => void) | null = null;

      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      // start sending message
      const sendPromise = service.send({ id: 'test-message', content: 'Test' });

      // advance timers to ensure message is registered
      await vi.advanceTimersByTimeAsync(0);

      // stop message using aborter directly
      const aborted = aborter.abort('test-message');
      expect(aborted).toBe(true);

      // wait for sending to complete
      const result = await sendPromise;

      // message should be marked as failed or stopped
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });

    it('should be able to stop all messages using aborter.abortAll() directly', async () => {
      // create multiple delayed gateway responses
      const promises: Array<((value: { result: string }) => void) | null> = [];
      let callCount = 0;

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        const index = callCount++;
        return new Promise((resolve) => {
          promises[index] = resolve;
        });
      });

      // start sending multiple messages
      const sendPromise1 = service.send({
        id: 'message-1',
        content: 'Message 1'
      });
      const sendPromise2 = service.send({
        id: 'message-2',
        content: 'Message 2'
      });

      // advance timers to ensure messages are registered
      await vi.advanceTimersByTimeAsync(0);

      // stop all messages using aborter directly
      aborter.abortAll();

      // advance timers for aborts to process
      await vi.advanceTimersByTimeAsync(0);

      // wait for all messages to complete
      const results = await Promise.all([sendPromise1, sendPromise2]);

      // all messages should be cancelled or failed
      results.forEach((result) => {
        expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
          result.status
        );
      });
    });

    it('should verify aborter has registered abort IDs', async () => {
      // create a delayed gateway response
      const gatewayPromise = new Promise(() => {
        // never resolve
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      // start sending message
      const messageId = 'test-message-id';
      service.send({ id: messageId, content: 'Test' });

      // advance timers to ensure AborterPlugin has registered
      await vi.advanceTimersByTimeAsync(0);

      // verify aborter has this ID registered
      const hasAbortId = aborter['wrappers'].has(messageId);
      expect(hasAbortId).toBe(true);

      // cleanup
      aborter.abort(messageId);
    });
  });

  describe('stop with manual AbortController', () => {
    it('should be able to stop message using custom AbortController', async () => {
      // create custom AbortController
      const controller = new AbortController();

      // create a delayed gateway response
      let resolveGateway: ((value: unknown) => void) | null = null;

      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      // start sending message with custom signal
      const sendPromise = service.send(
        { id: 'test-message', content: 'Test' },
        { signal: controller.signal }
      );

      // advance timers
      await vi.advanceTimersByTimeAsync(0);

      // abort using custom controller
      controller.abort();

      // wait for sending to complete
      const result = await sendPromise;

      // message should be marked as failed or stopped
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });

    it('should not be able to stop custom signal message using service.stop()', async () => {
      // create custom AbortController
      const controller = new AbortController();

      // create a delayed gateway response
      const gatewayPromise = new Promise(() => {
        // never resolve
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      // start sending message with custom signal
      const messageId = 'test-message';
      service.send(
        { id: messageId, content: 'Test' },
        { signal: controller.signal }
      );

      // advance timers
      await vi.advanceTimersByTimeAsync(0);

      // try to stop using service.stop() - should not work for custom signal
      const stopped = service.stop(messageId);

      // should return true because aborter has this ID
      // but the custom signal won't be affected
      expect(stopped).toBe(true);

      // verify custom signal is not aborted
      expect(controller.signal.aborted).toBe(false);

      // cleanup
      controller.abort();
    });

    it('should handle multiple messages with different AbortControllers', async () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      const controller3 = new AbortController();

      // create multiple delayed gateway responses
      const promises: Array<((value: { result: string }) => void) | null> = [];
      let callCount = 0;

      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        const index = callCount++;
        return new Promise((resolve) => {
          promises[index] = resolve;
        });
      });

      // start sending multiple messages with different controllers
      const sendPromise1 = service.send(
        { id: 'message-1', content: 'Message 1' },
        { signal: controller1.signal }
      );
      const sendPromise2 = service.send(
        { id: 'message-2', content: 'Message 2' },
        { signal: controller2.signal }
      );
      const sendPromise3 = service.send(
        { id: 'message-3', content: 'Message 3' },
        { signal: controller3.signal }
      );

      // advance timers
      await vi.advanceTimersByTimeAsync(0);

      // abort only first and third messages
      controller1.abort();
      controller3.abort();

      // complete the second message
      promises[1]?.({ result: 'Success' });

      // advance timers for abort and resolve to process
      await vi.advanceTimersByTimeAsync(0);

      // wait for all messages to complete
      const [result1, result2, result3] = await Promise.all([
        sendPromise1,
        sendPromise2,
        sendPromise3
      ]);

      // first and third should be cancelled
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result1.status
      );
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result3.status
      );

      // second should be successful
      expect(result2.status).toBe(MessageStatus.SENT);
      expect(result2.result).toEqual({ result: 'Success' });
    });

    it('should handle pre-aborted signal', async () => {
      // create and immediately abort controller
      const controller = new AbortController();
      controller.abort();

      mockGateway.sendMessage = vi.fn().mockResolvedValue({ result: 'Success' });

      // send message with pre-aborted signal
      const result = await service.send(
        { id: 'test-message', content: 'Test' },
        { signal: controller.signal }
      );

      // message should be marked as failed or stopped
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
    });

    it('should handle abort during gateway call', async () => {
      const controller = new AbortController();

      // create gateway that aborts during execution
      mockGateway.sendMessage = vi.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            controller.abort();
            reject(new Error('Aborted'));
          }, 10);
        });
      });

      // send message
      const sendPromise = service.send(
        { id: 'test-message', content: 'Test' },
        { signal: controller.signal }
      );

      // advance timers to trigger abort
      await vi.advanceTimersByTimeAsync(10);

      const result = await sendPromise;

      // message should be marked as failed or stopped
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
    });
  });

  describe('stop without aborter configured', () => {
    let serviceWithoutAborter: MessageSender<TestMessage>;

    beforeEach(() => {
      serviceWithoutAborter = new MessageSender(store, {
        gateway: mockGateway,
        executor: new MessageSenderExecutor()
        // no aborter configured
      });
    });

    it('should return false when calling stop() without aborter', () => {
      const stopped = serviceWithoutAborter.stop('any-message-id');
      expect(stopped).toBe(false);
    });

    it('should not throw when calling stopAll() without aborter', () => {
      expect(() => {
        serviceWithoutAborter.stopAll();
      }).not.toThrow();
    });

    it('should still be able to send messages without aborter', async () => {
      mockGateway.sendMessage = vi
        .fn()
        .mockResolvedValue({ result: 'Success' });

      const result = await serviceWithoutAborter.send({
        id: 'test-message',
        content: 'Test'
      });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toEqual({ result: 'Success' });
    });

    it('should be able to use custom AbortController without aborter', async () => {
      const controller = new AbortController();

      // create a delayed gateway response
      let resolveGateway: ((value: unknown) => void) | null = null;

      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      // start sending message with custom signal
      const sendPromise = serviceWithoutAborter.send(
        { id: 'test-message', content: 'Test' },
        { signal: controller.signal }
      );

      // advance timers
      await vi.advanceTimersByTimeAsync(0);

      // abort using custom controller
      controller.abort();

      // wait for sending to complete
      const result = await sendPromise;

      // message should be marked as failed or stopped
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });
  });
});
