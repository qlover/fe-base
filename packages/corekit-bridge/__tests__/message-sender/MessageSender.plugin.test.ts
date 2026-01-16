/**
 * @file MessageSender plugin system tests
 *
 * Tests for plugin system functionality
 */
import { ExecutorError } from '@qlover/fe-corekit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  MessageSenderExecutor,
  type MessageSenderContextOptions,
  type MessageSenderPlugin,
  type MessageSenderContext,
  type MessageStoreMsg,
  type MessageGetwayInterface
} from '../../src/core/message-sender';
import type { ExecutorPlugin } from '@qlover/fe-corekit';
import type { TestMessage } from './MessageSender.test-utils';
import {
  createTestStore,
  createMockGateway,
  createTestSender
} from './MessageSender.test-utils';

describe('MessageSender - plugin system (use method)', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
    service = createTestSender(store, mockGateway, true); // Need executor for plugins
  });

  it('should support using plugins', () => {
    const plugin = {
      pluginName: 'test-plugin'
    };

    const result = service.use(plugin);

    // use method should return this to support chaining
    expect(result).toBe(service);
  });

  it('plugins should be able to access and modify context', async () => {
    let capturedContext: MessageSenderContext<
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
      throwIfError: true,
      executor: new MessageSenderExecutor()
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

    await expect(errorService.send({ content: 'Test' })).rejects.toBeDefined();
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
    expect(result2.error).toBeDefined();

    // third message success
    const result3 = await service.send({ content: 'success again' });
    expect(result3.status).toBe(MessageStatus.SENT);
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
});
