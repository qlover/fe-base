/**
 * @file MessageSender plugin error handling tests
 *
 * Tests for plugin error handling and throwIfError combination
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

describe('MessageSender - plugins error and throwIfError combination test', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
    service = createTestSender(store, mockGateway, true); // Need executor for plugins
  });

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
      throwIfError: true,
      executor: new MessageSenderExecutor()
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
      throwIfError: true,
      executor: new MessageSenderExecutor()
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
      throwIfError: true,
      executor: new MessageSenderExecutor()
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
    expect(result.error).toBeDefined();
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
    expect(result2.error).toBeDefined();
    expect((result2.error as unknown as ExecutorError).message).toBe(
      'Plugin error'
    );
  });

  it('plugin returns ExecutorError instance + throwIfError=true', async () => {
    const errorService = new MessageSender(store, {
      gateway: mockGateway,
      throwIfError: true,
      executor: new MessageSenderExecutor()
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
      throwIfError: true,
      executor: new MessageSenderExecutor()
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
