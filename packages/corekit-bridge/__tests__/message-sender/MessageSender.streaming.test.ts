/**
 * @file MessageSender streaming message tests
 *
 * Tests for streaming message functionality
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  type MessageSenderPlugin,
  type GatewayOptions,
  type MessageGetwayInterface
} from '../../src/core/message-sender';
import type { TestMessage } from './MessageSender.test-utils';
import {
  createTestStore,
  createMockGateway,
  createTestSender
} from './MessageSender.test-utils';

describe('MessageSender - streaming message', () => {
  let service: MessageSender<TestMessage>;
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
    service = createTestSender(store, mockGateway, false);
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
      type ReceivedOptions = GatewayOptions<TestMessage> & {
        retry: number;
        timeout: number;
      };
      let receivedOptions: ReceivedOptions | null = null;

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
      } as ReceivedOptions);

      console.log(receivedOptions);
      expect(receivedOptions).toBeDefined();
      expect(receivedOptions!.timeout).toBe(5000);
      // SenderGateway not merge unknown properties?
      expect(receivedOptions!.retry).toBeUndefined();
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
            await options.onChunk({ text: 'Hello World' });
          }

          return { result: 'Complete' };
        });

      const serviceWithPlugin = createTestSender(store, mockGateway, true);
      const plugin: MessageSenderPlugin<TestMessage> = {
        pluginName: 'stream-interceptor',
        onStream: (_context, chunk) => {
          // Plugin can modify chunk
          return {
            ...(chunk as { text: string }),
            modified: true
          };
        }
      };

      serviceWithPlugin.use(plugin);

      await serviceWithPlugin.send(
        { content: 'Test' },
        {
          onChunk: (chunk) => {
            receivedChunks.push(chunk as unknown as { text: string });
          }
        }
      );

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
});
