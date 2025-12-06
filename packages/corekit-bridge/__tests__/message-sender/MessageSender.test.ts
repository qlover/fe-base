/**
 * @file MessageSender test suite
 *
 * Comprehensive tests for MessageSender functionality including:
 * - Core message sending operations (send, stop, stopAll)
 * - Plugin system integration and lifecycle
 * - Error handling and retry mechanisms
 * - Streaming message support with chunk handling
 * - Gateway integration and options
 * - Logger integration and logging behavior
 * - AbortPlugin integration for cancellation
 * - Edge cases and special scenarios
 * - Concurrent message handling
 * - Message state management and transitions
 */
import { ExecutorError } from '@qlover/fe-corekit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  type MessageSenderContextOptions,
  type MessageSenderPlugin,
  type MessageStoreMsg,
  type MessageGetwayInterface,
  MessageSenderPluginContext,
  GatewayOptions
} from '../../src/core/message-sender';
import type { ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Test message type for MessageSender tests
 *
 * Extends base MessageStoreMsg with optional content field
 */
interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

describe('MessageSender', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = new MessagesStore(() => ({
      messages: []
    }));

    mockGateway = {
      sendMessage: vi.fn().mockResolvedValue({ result: 'Gateway response' })
    };

    service = new MessageSender(store, {
      gateway: mockGateway
    });
  });

  describe('constructor', () => {
    it('should correctly initialize', () => {
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

  describe('send - basic functionality', () => {
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

    it('should call gateway to send message', async () => {
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
  });

  describe('send - error handling', () => {
    it('default mode: return failed message when sending fails (without throwing error)', async () => {
      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      const result = await service.send({ content: 'Failed message' });

      expect(result).toBeDefined();
      expect(result.content).toBe('Failed message');
      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.loading).toBe(false);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe(
        service['messageSenderErrorId']
      );
    });

    it('throwIfError=true: throw error when sending fails', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const error = new Error('Network error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(error);

      await expect(
        errorService.send({ content: 'Failed message' })
      ).rejects.toBeInstanceOf(ExecutorError);

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
      unknownError.id = 'UNKNOWN_ASYNC_ERROR';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(unknownError);

      const result = await service.send({ content: 'Test' });

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe('MESSAGE_SENDER_ERROR');
    });

    it('should not modify other ExecutorError IDs', async () => {
      const customError = new ExecutorError('Custom error');
      customError.id = 'CUSTOM_ERROR_ID';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(customError);

      const result = await service.send({ content: 'Test' });

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe('CUSTOM_ERROR_ID');
    });
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
      expect(result.error).toBeInstanceOf(ExecutorError);
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

  describe('plugin system (use method)', () => {
    it('should support using plugins', () => {
      const plugin = {
        pluginName: 'test-plugin'
      };

      const result = service.use(plugin);

      // use method should return this to support chaining
      expect(result).toBe(service);
    });

    it('plugins should be able to access and modify context', async () => {
      let capturedContext: MessageSenderPluginContext<
        MessageStoreMsg<unknown, unknown>
      > | null = null;

      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'context-capture',
        onBefore(ctx) {
          capturedContext = ctx;
        }
      };

      service.use(plugin);

      await service.send({ content: 'Test' });

      expect(capturedContext).toBeDefined();
      expect(capturedContext!.parameters.store).toBe(store);
      expect(capturedContext!.parameters.currentMessage).toBeDefined();
      expect(capturedContext!.parameters.currentMessage.content).toBe('Test');
    });

    it('plugins should be able to modify messages', async () => {
      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'message-modifier',
        onBefore({ parameters }) {
          parameters.currentMessage.content = 'Modified by plugin';
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Original' });

      expect(result.content).toBe('Modified by plugin');
    });

    it('plugins throw error when throwIfError is false, should return failed message', async () => {
      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'error-plugin',
        onExec() {
          throw new Error('Plugin error');
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      expect(result.error).toBeInstanceOf(ExecutorError);
    });

    it('plugins throw error when throwIfError is true, should throw error', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: ExecutorPlugin<
        MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
      > = {
        pluginName: 'error-plugin',
        onExec() {
          throw new Error('Plugin error');
        }
      };

      errorService.use(plugin);

      await expect(
        errorService.send({ content: 'Test' })
      ).rejects.toBeInstanceOf(ExecutorError);
    });

    it('plugins can block message sending', async () => {
      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'block-plugin',
        onExec(ctx, _send) {
          const parameters = ctx.parameters as MessageSenderContextOptions<
            MessageStoreMsg<unknown, unknown>
          >;
          // do not call send(), block subsequent execution
          // send(parameters.currentMessage, ctx);

          return store.mergeMessage(parameters.currentMessage, {
            status: MessageStatus.FAILED,
            error: new Error('Blocked by plugin'),
            loading: false
          });
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      // gateway should not be called
      expect(mockGateway.sendMessage).not.toHaveBeenCalled();

      // should return failed message
      expect(result.status).toBe(MessageStatus.FAILED);
      expect((result.error as Error)?.message).toBe('Blocked by plugin');
    });

    it('plugins can process result after sending', async () => {
      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'result-processor',
        onSuccess(ctx) {
          Object.assign(ctx.returnValue!, {
            result: {
              ...(ctx.returnValue as MessageStoreMsg<unknown, unknown>).result!,
              processedBy: 'plugin'
            }
          });
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });
      expect(result.result).toBeDefined();
      expect((result.result as unknown as { result: string }).result).toBe(
        'Gateway response'
      );
      expect(
        (result.result as unknown as { processedBy: string }).processedBy
      ).toBe('plugin');
    });

    it('plugins error should not affect other messages sending', async () => {
      const errorPlugin: MessageSenderPlugin<
        MessageStoreMsg<unknown, unknown>
      > = {
        pluginName: 'conditional-error',
        onExec(ctx, next) {
          if (
            (
              ctx.parameters as MessageSenderContextOptions<
                MessageStoreMsg<unknown, unknown>
              >
            ).currentMessage.content === 'error'
          ) {
            throw new Error('Conditional error');
          }
          return next(ctx);
        }
      };

      service.use(errorPlugin);

      // first message success
      const result1 = await service.send({ content: 'success' });
      expect(result1.status).toBe(MessageStatus.SENT);

      // second message trigger plugin error
      const result2 = await service.send({ content: 'error' });
      expect(result2.status).toBe(MessageStatus.FAILED);
      expect(result2.error).toBeInstanceOf(ExecutorError);

      // third message success
      const result3 = await service.send({ content: 'success again' });
      expect(result3.status).toBe(MessageStatus.SENT);
    });
  });

  describe('plugins error and throwIfError combination test', () => {
    it('plugins throw error in before stage + throwIfError=false', async () => {
      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'before-error',
        onBefore() {
          throw new Error('Before error');
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).message).toBe('Before error');
    });

    it('plugins throw error in before stage + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'before-error',
        onBefore() {
          throw new Error('Before error');
        }
      };

      errorService.use(plugin);

      await expect(errorService.send({ content: 'Test' })).rejects.toThrow(
        'Before error'
      );
    });

    it('plugins throw error in after stage + throwIfError=false', async () => {
      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'after-error',
        onSuccess() {
          throw new Error('After error');
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).message).toBe('After error');
    });

    it('plugins throw error in after stage + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'after-error',
        onSuccess() {
          throw new Error('After error');
        }
      };

      errorService.use(plugin);

      await expect(
        errorService.send({ content: 'Test' })
      ).rejects.toBeInstanceOf(ExecutorError);
    });

    it('sendMessage failed + plugin catch error + throwIfError=false', async () => {
      const sendError = new Error('Send failed');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(sendError);

      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'error-handler',
        async onExec(ctx, next) {
          const parameters = ctx.parameters as MessageSenderContextOptions<
            MessageStoreMsg<unknown, unknown>
          >;
          try {
            return await next(ctx);
          } catch {
            // plugin catch error but not rethrow
            parameters.currentMessage = store.mergeMessage(
              parameters.currentMessage,
              {
                status: MessageStatus.FAILED,
                error: new Error('Handled by plugin'),
                loading: false
              }
            );
            return parameters.currentMessage;
          }
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

      // plugin handled error, so should return plugin set error message
      expect(result.status).toBe(MessageStatus.FAILED);
      expect((result.error as Error)?.message).toBe('Handled by plugin');
    });

    it('multiple plugins, one throws error + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin1: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'plugin-1',
        onBefore() {
          // do nothing
        }
      };

      const plugin2: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'plugin-2-error',
        onExec() {
          throw new Error('Plugin 2 error');
        }
      };

      const plugin3: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'plugin-3',
        onBefore() {
          // do nothing
        }
      };

      errorService.use(plugin1).use(plugin2).use(plugin3);

      await expect(errorService.send({ content: 'Test' })).rejects.toThrow(
        'Plugin 2 error'
      );
    });

    it('gateway error and plugin error both exist', async () => {
      const sendError = new Error('Gateway error');
      mockGateway.sendMessage = vi.fn().mockRejectedValue(sendError);

      // plugin error after throw, get gateway return error
      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'after-error',
        async onExec(ctx, next) {
          await next(ctx);
          throw new ExecutorError('Plugin error');
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });
      // should return plugin error (error after throw)
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as unknown as ExecutorError).message).toBe(
        'Gateway error'
      );

      // should return gateway return error
      // plugin error after throw, get gateway return error
      const plugin2: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'after-error',
        onBefore() {
          throw new ExecutorError('Plugin error');
        },
        async onExec(ctx, next) {
          return await next(ctx);
        }
      };

      service.use(plugin2);

      const result2 = await service.send({ content: 'Test' });
      // should return plugin error (error after throw)
      expect(result2.error).toBeInstanceOf(Error);
      expect((result2.error as unknown as ExecutorError).message).toBe(
        'Plugin error'
      );
    });

    it('plugin returns ExecutorError instance + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'executor-error',
        onExec() {
          throw new ExecutorError('Custom executor error');
        }
      };

      errorService.use(plugin);

      await expect(
        errorService.send({ content: 'Test' })
      ).rejects.toBeInstanceOf(ExecutorError);

      try {
        await errorService.send({ content: 'Test' });
      } catch (error) {
        expect((error as ExecutorError).message).toBe('Custom executor error');
      }
    });

    it('plugin execute code error + throwIfError=true', async () => {
      const errorService = new MessageSender(store, {
        gateway: mockGateway,
        throwIfError: true
      });

      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'executor-error',
        onBefore() {
          // simulate real code error: access undefined object property
          const undefinedObject: unknown = undefined;
          (
            undefinedObject as { someProperty: { nestedProperty: string } }
          ).someProperty.nestedProperty = 'value';
        }
      };

      errorService.use(plugin);

      await expect(errorService.send({ content: 'Test' })).rejects.toThrow(
        "Cannot read properties of undefined (reading 'someProperty')"
      );
    });
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

      const plugin: MessageSenderPlugin<MessageStoreMsg<unknown, unknown>> = {
        pluginName: 'start-time-modifier',
        onBefore({ parameters }) {
          parameters.currentMessage.startTime = customStartTime;
        }
      };

      service.use(plugin);

      const result = await service.send({ content: 'Test' });

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
  });

  describe('concurrent scenario', () => {
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

  describe('plugin Context integrity', () => {
    it('plugins should be able to access complete context', async () => {
      let capturedContext: MessageSenderContextOptions<
        MessageStoreMsg<unknown, unknown>
      > | null = null;

      const plugin: ExecutorPlugin<
        MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
      > = {
        pluginName: 'context-inspector',
        onExec(ctx, next) {
          capturedContext = ctx.parameters as MessageSenderContextOptions<
            MessageStoreMsg<unknown, unknown>
          >;
          return next(ctx);
        }
      };

      service.use(plugin);

      await service.send({ content: 'Test' });

      expect(capturedContext).toBeDefined();
      expect(capturedContext!.store).toBe(store);
      expect(capturedContext!.currentMessage).toBeDefined();
      expect(capturedContext!.currentMessage.content).toBe('Test');
    });

    it('multiple plugins modify currentMessage should accumulate effects', async () => {
      const plugin1: ExecutorPlugin<
        MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
      > = {
        pluginName: 'add-prefix',
        onBefore({ parameters }) {
          parameters.currentMessage.content = `[P1] ${parameters.currentMessage.content}`;
        }
      };

      const plugin2: ExecutorPlugin<
        MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
      > = {
        pluginName: 'add-suffix',
        onBefore({ parameters }) {
          parameters.currentMessage.content = `${parameters.currentMessage.content} [P2]`;
        }
      };

      service.use(plugin1).use(plugin2);

      const result = await service.send({ content: 'Test' });

      expect(result.content).toBe('[P1] Test [P2]');
    });

    it('plugins can modify different properties in different lifecycle', async () => {
      const plugin: ExecutorPlugin<
        MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
      > = {
        pluginName: 'lifecycle-modifier',
        onBefore({ parameters }) {
          parameters.currentMessage.placeholder = 'Modified placeholder';
        },
        onSuccess(ctx) {
          const msg = ctx.returnValue as MessageStoreMsg<unknown, unknown>;
          const currentResult =
            typeof msg.result === 'object' && msg.result !== null
              ? msg.result
              : {};
          msg.result = {
            ...currentResult,
            enhancedBy: 'plugin'
          };
        }
      };

      service.use(plugin);

      const result = await service.send({
        content: 'Test',
        placeholder: 'Original'
      });

      expect(result.placeholder).toBe('Modified placeholder');
      expect(result.result).toHaveProperty('enhancedBy', 'plugin');
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

      const plugin: ExecutorPlugin<
        MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
      > = {
        pluginName: 'retry-plugin',
        async onBefore({ parameters }) {
          expect(parameters.currentMessage.id).toEqual(result.id);
        }
      };

      service.use(plugin);

      // when retry, pass a new object, keep id, but do not pass old error
      const result2 = await service.send({
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

      // wait for a short time, ensure request has started
      await new Promise((resolve) => setTimeout(resolve, 10));

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

      // wait for a short time
      await new Promise((resolve) => setTimeout(resolve, 10));

      // stop only the first message
      service.stop('message-1');

      // complete the second message
      promises[1]?.({ result: 'Success' });

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

      // wait for a short time
      await new Promise((resolve) => setTimeout(resolve, 10));

      // stop all messages
      service.stopAll();

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

      // wait for a short time
      await new Promise((resolve) => setTimeout(resolve, 10));

      // stop all messages
      service.stopAll();

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

  describe('streaming message - gatewayOptions', () => {
    it('should support onChunk callback', async () => {
      const chunks: Array<{ content: string }> = [];
      let chunkCallCount = 0;

      // mock streaming response
      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          // simulate streaming chunks
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ content: 'chunk1' });
            await options.onChunk({ content: 'chunk2' });
            await options.onChunk({ content: 'chunk3' });
          }

          return { result: 'Complete' };
        });

      const result = await service.send(
        { content: 'Streaming message' },
        {
          onChunk: (chunk) => {
            chunks.push(chunk as { content: string });
            chunkCallCount++;
          }
        }
      );

      expect(result.status).toBe(MessageStatus.SENT);
      expect(chunkCallCount).toBe(3);
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ content: 'chunk1' });
      expect(chunks[1]).toEqual({ content: 'chunk2' });
      expect(chunks[2]).toEqual({ content: 'chunk3' });
    });

    it('should support onConnected callback', async () => {
      let connected = false;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }
          return { result: 'Success' };
        });

      const result = await service.send(
        { content: 'Test' },
        {
          onConnected: () => {
            connected = true;
          }
        }
      );

      expect(result.status).toBe(MessageStatus.SENT);
      expect(connected).toBe(true);
    });

    it('should call onConnected and onChunk in order', async () => {
      const callOrder: string[] = [];

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ content: 'chunk1' });
            await options.onChunk({ content: 'chunk2' });
          }

          return { result: 'Complete' };
        });

      await service.send(
        { content: 'Test' },
        {
          onConnected: () => {
            callOrder.push('connected');
          },
          onChunk: () => {
            callOrder.push('chunk');
          }
        }
      );

      expect(callOrder).toEqual(['connected', 'chunk', 'chunk']);
    });

    it('should support custom signal', async () => {
      const controller = new AbortController();
      let gatewayCallCount = 0;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          gatewayCallCount++;
          // check if signal is aborted
          options?.signal?.throwIfAborted();

          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              resolve({ result: 'Success' });
            }, 100);

            options?.signal?.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Aborted'));
            });
          });
        });

      const sendPromise = service.send(
        { content: 'Test' },
        { signal: controller.signal }
      );

      // cancel request
      controller.abort();

      const result = await sendPromise;

      expect(gatewayCallCount).toBe(1);
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
    });

    it('should merge gatewayOptions in config and send parameters', async () => {
      let receivedOptions: GatewayOptions<unknown, unknown> | null = null;

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          receivedOptions = options;
          return { result: 'Success' };
        });

      const serviceWithOptions = new MessageSender(store, {
        gateway: mockGateway,
        gatewayOptions: {
          timeout: 5000
        }
      });

      await serviceWithOptions.send({ content: 'Test' }, {
        retry: 3
      } as unknown as GatewayOptions<TestMessage, Record<string, unknown>>);

      expect(receivedOptions).toBeDefined();
      expect((receivedOptions as unknown as { timeout: number }).timeout).toBe(
        5000
      );
      expect((receivedOptions as unknown as { retry: number }).retry).toBe(3);
    });
  });

  describe('Logger integration', () => {
    it('should log when message is sent successfully', async () => {
      const mockLogger: LoggerInterface = {
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

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      const result = await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('success')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(result.id!)
      );
    });

    it('should log when message is sent failed', async () => {
      const mockLogger: LoggerInterface = {
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

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      const result = await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.debug).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('failed')
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(result.id!)
      );
    });

    it('should include custom senderName in log', async () => {
      const mockLogger: LoggerInterface = {
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

      const customSenderName = 'CustomSender';

      const serviceWithCustomName = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger,
        senderName: customSenderName
      });

      await serviceWithCustomName.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(customSenderName)
      );
    });

    it('should include message duration in log', async () => {
      const mockLogger: LoggerInterface = {
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

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('speed')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringMatching(/\d+ms/)
      );
    });

    it('should work normally without logger', async () => {
      const serviceWithoutLogger = new MessageSender(store, {
        gateway: mockGateway
      });

      await expect(
        serviceWithoutLogger.send({ content: 'Test' })
      ).resolves.toBeDefined();
    });
  });

  describe('senderName configuration', () => {
    it('should use default senderName', () => {
      const defaultService = new MessageSender(store, {
        gateway: mockGateway
      });

      expect(defaultService['senderName']).toBe('MessageSender');
    });

    it('should use custom senderName', () => {
      const customName = 'MyCustomSender';

      const customService = new MessageSender(store, {
        gateway: mockGateway,
        senderName: customName
      });

      expect(customService['senderName']).toBe(customName);
    });

    it('should use senderName in error message', async () => {
      const mockLogger: LoggerInterface = {
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

      const customName = 'TestSender';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const customService = new MessageSender(store, {
        gateway: mockGateway,
        senderName: customName,
        logger: mockLogger
      });

      await customService.send({ content: 'Test' });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(`[${customName}]`)
      );
    });
  });

  describe('complex streaming scenario', () => {
    it('should support plugin intercept in streaming', async () => {
      const receivedChunks: Array<{ text: string }> = [];

      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ text: 'Hello' });
            await options.onChunk({ text: ' World' });
          }

          return { result: 'Complete' };
        });

      const plugin: MessageSenderPlugin<TestMessage> = {
        pluginName: 'stream-interceptor',
        onStream: async (chunk) => {
          // Plugin can modify chunk
          return {
            ...chunk,
            modified: true
          };
        }
      };

      service.use(plugin);

      await service.send(
        { content: 'Test' },
        {
          onChunk: (chunk) => {
            receivedChunks.push(chunk as unknown as { text: string });
          }
        }
      );

      // Chunks should be modified by plugin
      receivedChunks.forEach((chunk) => {
        expect(chunk).toHaveProperty('modified', true);
      });
    });

    it('should handle errors in streaming', async () => {
      mockGateway.sendMessage = vi
        .fn()
        .mockImplementation(async (_, options) => {
          if (options?.onConnected) {
            await options.onConnected();
          }

          if (options?.onChunk) {
            await options.onChunk({ content: 'chunk1' });
            throw new Error('Streaming error');
          }

          return { result: 'Should not reach here' };
        });

      const result = await service.send(
        { content: 'Test' },
        {
          onChunk: () => {
            // do nothing
          }
        }
      );

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();
    });
  });

  describe('AbortPlugin integration test', () => {
    it('should automatically register AbortPlugin when constructed', () => {
      const newService = new MessageSender(store, {
        gateway: mockGateway
      });

      // AbortPlugin should have been registered
      expect(newService['abortPlugin']).toBeDefined();
      expect(newService['executor']).toBeDefined();
    });

    it('should use message ID as abort identifier', async () => {
      const messageId = 'test-id-123';

      let resolveGateway: ((value: unknown) => void) | null = null;
      const gatewayPromise = new Promise((resolve) => {
        resolveGateway = resolve;
      });

      mockGateway.sendMessage = vi.fn().mockReturnValue(gatewayPromise);

      const sendPromise = service.send({
        id: messageId,
        content: 'Test'
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const stopped = service.stop(messageId);

      expect(stopped).toBe(true);

      const result = await sendPromise;
      expect([MessageStatus.FAILED, MessageStatus.STOPPED]).toContain(
        result.status
      );
      expect(resolveGateway).toBeDefined();
      resolveGateway = null;
    });
  });

  describe('edge cases and special scenarios', () => {
    it('should handle gateway return Promise.reject(undefined)', async () => {
      mockGateway.sendMessage = vi.fn().mockRejectedValue(undefined);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.FAILED);
      expect(result.error).toBeDefined();
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
      const plugin1: ExecutorPlugin<MessageSenderContextOptions<TestMessage>> =
        {
          pluginName: 'plugin1'
        };

      const plugin2: ExecutorPlugin<MessageSenderContextOptions<TestMessage>> =
        {
          pluginName: 'plugin2'
        };

      const result = service.use(plugin1).use(plugin2);

      expect(result).toBe(service);
    });

    it('should handle gateway returning primitive values', async () => {
      mockGateway.sendMessage = vi.fn().mockResolvedValue(42);

      const result = await service.send({ content: 'Test' });

      expect(result.status).toBe(MessageStatus.SENT);
      expect(result.result).toBe(42);
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
