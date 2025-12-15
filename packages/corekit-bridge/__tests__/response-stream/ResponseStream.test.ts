/**
 * ResponseStream test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor and configuration tests
 * 2. onSuccess        - Response handling tests
 * 3. handleStreamResponse - Stream response processing tests
 * 4. streamWithEvent  - Stream event processing tests
 * 5. error handling   - Error cases and recovery tests
 * 6. callbacks        - Callback invocation tests
 * 7. integration     - End-to-end stream processing tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ResponseStream,
  ResponseStreamConfig
} from '../../src/core/response-stream/ResponseStream';
import { StreamProcessorInterface } from '../../src/core/response-stream/StreamProcessorInterface';
import { StreamEvent } from '../../src/core/response-stream/StreamEvent';
import { SSEStreamProcessor } from '../../src/core/response-stream/SSEStreamProcessor';
import { ExecutorContext, RequestAdapterConfig } from '@qlover/fe-corekit';

describe('ResponseStream', () => {
  // Mock implementations
  class MockStreamProcessor implements StreamProcessorInterface {
    public processChunk = vi.fn().mockImplementation((data: unknown) => {
      if (data && typeof data === 'string') {
        return [data];
      }
      return [];
    });

    public processFinal = vi.fn().mockImplementation((data: unknown) => {
      if (data && typeof data === 'string') {
        return data;
      }
      return undefined;
    });
  }

  function createMockResponse(chunks: string[]): Response {
    const encoder = new TextEncoder();
    const encodedChunks = chunks.map((chunk) => encoder.encode(chunk));
    let currentIndex = 0;

    const stream = new ReadableStream({
      start(controller) {
        // 立即推送第一个数据
        if (currentIndex < encodedChunks.length) {
          controller.enqueue(encodedChunks[currentIndex++]);
        }
      },
      pull(controller) {
        // 按需推送后续数据
        if (currentIndex < encodedChunks.length) {
          controller.enqueue(encodedChunks[currentIndex++]);
        } else {
          controller.close();
        }
      },
      cancel() {
        // 清理资源
        currentIndex = encodedChunks.length;
      }
    });

    return new Response(stream);
  }

  let processor: MockStreamProcessor;
  let responseStream: ResponseStream;
  let config: ResponseStreamConfig;

  beforeEach(() => {
    processor = new MockStreamProcessor();
    config = {
      processor,
      onStreamChunk: vi.fn(),
      onStreamDone: vi.fn(),
      onStreamError: vi.fn()
    };
    responseStream = new ResponseStream(config);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const defaultStream = new ResponseStream();
      expect(defaultStream).toBeInstanceOf(ResponseStream);
      expect(defaultStream['config']).toEqual({});
    });

    it('should create instance with custom config', () => {
      expect(responseStream['config']).toEqual(config);
    });
  });

  describe('onSuccess', () => {
    it('should handle non-stream response', async () => {
      const context: ExecutorContext<RequestAdapterConfig> = {
        returnValue: { data: 'test' },
        parameters: {},
        hooksRuntimes: {}
      };
      await responseStream.onSuccess(context);
      expect(config.onStreamChunk).not.toHaveBeenCalled();
    });

    it('should process stream response with custom content type', async () => {
      const mockResponse = createMockResponse(['test']);
      Object.defineProperty(mockResponse, 'headers', {
        value: new Headers({
          'Content-Type': 'custom/stream-type'
        })
      });

      const customConfig = {
        processor,
        onStreamChunk: vi.fn(),
        onStreamDone: vi.fn(),
        streamContentTypes: ['custom/stream-type']
      };
      const customStream = new ResponseStream(customConfig);

      const context: ExecutorContext<RequestAdapterConfig> = {
        returnValue: mockResponse,
        parameters: {},
        hooksRuntimes: {}
      };

      await customStream.onSuccess(context);
      expect(customConfig.onStreamChunk).toHaveBeenCalledWith(
        'test',
        expect.any(StreamEvent)
      );
    });

    it('should process stream response with responseType stream', async () => {
      const mockResponse = createMockResponse(['test']);
      Object.defineProperty(mockResponse, 'headers', {
        value: new Headers({
          'Content-Type': 'application/json' // Not a stream content type
        })
      });

      const streamConfig = {
        processor,
        onStreamChunk: vi.fn(),
        onStreamDone: vi.fn()
      };
      const streamResponsePlugin = new ResponseStream(streamConfig);

      const context: ExecutorContext<RequestAdapterConfig> = {
        returnValue: mockResponse,
        parameters: {
          responseType: 'stream'
        },
        hooksRuntimes: {}
      };

      await streamResponsePlugin.onSuccess(context);
      expect(streamConfig.onStreamChunk).toHaveBeenCalledWith(
        'test',
        expect.any(StreamEvent)
      );
    });

    it('should not process non-stream response even with stream content type', async () => {
      const nonStreamResponse = new Response(JSON.stringify({ data: 'test' }), {
        headers: {
          'Content-Type': 'text/event-stream'
        }
      });
      Object.defineProperty(nonStreamResponse, 'body', { value: null });

      const context: ExecutorContext<RequestAdapterConfig> = {
        returnValue: nonStreamResponse,
        parameters: {},
        hooksRuntimes: {}
      };

      await responseStream.onSuccess(context);
      expect(config.onStreamChunk).not.toHaveBeenCalled();
    });

    it('should process stream response', async () => {
      const mockResponse = createMockResponse(['test']);
      const context: ExecutorContext<RequestAdapterConfig> = {
        returnValue: mockResponse,
        parameters: {
          responseType: 'stream'
        },
        hooksRuntimes: {}
      };
      await responseStream.onSuccess(context);
      expect(config.onStreamChunk).toHaveBeenCalledWith(
        'test',
        expect.any(StreamEvent)
      );
    });

    it('should not process non-stream response even with responseType stream', async () => {
      // Create a regular JSON response
      const nonStreamResponse = new Response(JSON.stringify({ data: 'test' }));
      Object.defineProperty(nonStreamResponse, 'body', { value: null });

      const context: ExecutorContext<RequestAdapterConfig> = {
        returnValue: nonStreamResponse,
        parameters: {
          responseType: 'stream'
        },
        hooksRuntimes: {}
      };

      await responseStream.onSuccess(context);
      expect(config.onStreamChunk).not.toHaveBeenCalled();
    });
  });

  describe('handleStreamResponse', () => {
    it('should throw error for non-ok response', async () => {
      const errorResponse = new Response('error', { status: 400 });
      await expect(
        responseStream.handleStreamResponse(errorResponse)
      ).rejects.toThrow('Stream request failed with status 400');
    });

    it('should throw error for response without body', async () => {
      const emptyResponse = new Response();
      Object.defineProperty(emptyResponse, 'body', { value: null });
      await expect(
        responseStream.handleStreamResponse(emptyResponse)
      ).rejects.toThrow('Could not get reader from response body');
    });

    it('should process successful stream response', async () => {
      const response = createMockResponse(['chunk1', 'chunk2']);
      await responseStream.handleStreamResponse(response);
      expect(config.onStreamChunk).toHaveBeenCalledTimes(3); // 包括最后的 final data
      expect(config.onStreamChunk).toHaveBeenNthCalledWith(
        1,
        'chunk1',
        expect.any(StreamEvent)
      );
      expect(config.onStreamChunk).toHaveBeenNthCalledWith(
        2,
        'chunk2',
        expect.any(StreamEvent)
      );
      expect(config.onStreamDone).toHaveBeenCalled();
    });
  });

  describe('streamWithEvent', () => {
    it('should process stream data and invoke callbacks', async () => {
      const response = createMockResponse(['chunk1', 'chunk2']);
      const reader = response.body!.getReader();
      const streamEvent = new StreamEvent(processor);

      await responseStream.streamWithEvent(reader, streamEvent);

      expect(config.onStreamChunk).toHaveBeenCalledTimes(3); // 包括最后的 final data
      expect(config.onStreamChunk).toHaveBeenNthCalledWith(
        1,
        'chunk1',
        streamEvent
      );
      expect(config.onStreamChunk).toHaveBeenNthCalledWith(
        2,
        'chunk2',
        streamEvent
      );
      expect(config.onStreamDone).toHaveBeenCalled();
    });

    it('should handle early stream termination', async () => {
      const response = createMockResponse(['chunk1']);
      const reader = response.body!.getReader();
      const streamEvent = new StreamEvent(processor);

      // First read the data
      const { value } = await reader.read();
      if (value) {
        const chunk = streamEvent.parseChunk(value);
        streamEvent.append(chunk);
      }

      // Then mark as finished
      streamEvent.finished();

      await responseStream.streamWithEvent(reader, streamEvent);

      expect(config.onStreamChunk).toHaveBeenCalledTimes(1);
      expect(config.onStreamChunk).toHaveBeenCalledWith('chunk1', streamEvent);
      expect(config.onStreamDone).toHaveBeenCalled();
    });

    it('should use config from parameters over instance config', async () => {
      const localConfig = {
        onStreamChunk: vi.fn(),
        onStreamDone: vi.fn()
      };

      const response = createMockResponse(['chunk']);
      const reader = response.body!.getReader();
      const streamEvent = new StreamEvent(processor);

      await responseStream.streamWithEvent(reader, streamEvent, localConfig);

      expect(localConfig.onStreamChunk).toHaveBeenCalledWith(
        'chunk',
        streamEvent
      );
      expect(config.onStreamChunk).not.toHaveBeenCalled();
      expect(localConfig.onStreamDone).toHaveBeenCalled();
      expect(config.onStreamDone).not.toHaveBeenCalled();
    });
  });

  describe('integration tests', () => {
    it('should handle complete stream lifecycle', async () => {
      const chunks = ['data1', 'data2', 'data3'];
      const response = createMockResponse(chunks);
      const messages: string[] = [];

      const localConfig: ResponseStreamConfig = {
        processor,
        onStreamChunk: (chunk) => messages.push(chunk),
        onStreamDone: vi.fn()
      };

      const stream = new ResponseStream(localConfig);
      await stream.handleStreamResponse(response);

      // 由于最后一个数据会被作为 final data 再次处理，所以会有 4 个消息
      expect(messages).toEqual([...chunks, chunks[chunks.length - 1]]);
      expect(localConfig.onStreamDone).toHaveBeenCalled();
    });

    it('should handle empty stream', async () => {
      const response = createMockResponse([]);
      const messages: string[] = [];

      const localConfig: ResponseStreamConfig = {
        processor,
        onStreamChunk: (chunk) => messages.push(chunk),
        onStreamDone: vi.fn()
      };

      const stream = new ResponseStream(localConfig);
      await stream.handleStreamResponse(response);

      expect(messages).toEqual([]);
      expect(localConfig.onStreamDone).toHaveBeenCalled();
    });

    it('should handle stream with mixed data types', async () => {
      const textChunk = 'text';
      const binaryChunk = new Uint8Array([1, 2, 3]).toString();
      const numberChunk = '123';

      const response = createMockResponse([
        textChunk,
        binaryChunk,
        numberChunk
      ]);
      const messages: string[] = [];

      const localConfig: ResponseStreamConfig = {
        processor,
        onStreamChunk: (chunk) => messages.push(chunk),
        onStreamDone: vi.fn()
      };

      const stream = new ResponseStream(localConfig);
      await stream.handleStreamResponse(response);

      // 由于最后一个数据会被作为 final data 再次处理，所以会有 4 个消息
      expect(messages.length).toBe(4);
      expect(messages).toEqual([
        textChunk,
        binaryChunk,
        numberChunk,
        numberChunk
      ]);
      expect(localConfig.onStreamDone).toHaveBeenCalled();
    });

    it('should handle SSE stream response', async () => {
      const sseProcessor = new SSEStreamProcessor();
      const messages = [
        'data: {"session_id": "session_1754290538566_9hsbna6", "screens": []}',
        'data: {"session_id": "session_1754290538566_9hsbna6", "screens": [{"name": "main", "key": "2860f21ba0aa12e0e648d"}]}',
        'data: {"session_id": "session_1754290538566_9hsbna6", "screens": [{"name": "main", "key": "2860f21ba0aa12e0e648d"}]}'
      ];

      const response = createMockResponse(messages.map((msg) => msg + '\n\n')); // SSE requires double newlines
      const receivedMessages: string[] = [];

      const localConfig: ResponseStreamConfig = {
        processor: sseProcessor,
        onStreamChunk: (chunk) => {
          const data = JSON.parse(chunk);
          receivedMessages.push(chunk);
          expect(data.session_id).toBe('session_1754290538566_9hsbna6');
          expect(Array.isArray(data.screens)).toBe(true);
        },
        onStreamDone: vi.fn()
      };

      const stream = new ResponseStream(localConfig);
      await stream.handleStreamResponse(response);

      // 由于最后一个数据会被作为 final data 再次处理，所以会有 4 个消息
      expect(receivedMessages.length).toBe(4);
      expect(localConfig.onStreamDone).toHaveBeenCalled();
    });

    // This test is for manual verification only
    it.skip('should handle real API SSE stream response', async () => {
      const sseProcessor = new SSEStreamProcessor();
      const receivedMessages: string[] = [];

      const localConfig: ResponseStreamConfig = {
        processor: sseProcessor,
        onStreamChunk: (chunk) => {
          // chunk is already processed by SSEStreamProcessor
          const data = JSON.parse(chunk);
          receivedMessages.push(chunk);
          expect(data.session_id).toBeDefined();
          expect(Array.isArray(data.screens)).toBe(true);
        },
        onStreamDone: () => {
          console.log(
            'Stream completed, total messages:',
            receivedMessages.length
          );
        }
      };

      const stream = new ResponseStream(localConfig);

      const response = await fetch(
        'https://plan-dev.api.brain.ai/v1.0/invoke/planning-api/method/ai_phone/planning/completions',
        {
          headers: {
            accept: '*/*',
            'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8',
            authorization: 'token 2c09b2c5ff6371e36d90130b8c4e5635464c6954',
            'content-type': 'application/json',
            'plan-flow-name': 'birthday',
            'sec-ch-ua':
              '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'x-brain-user-lang': ':ja',
            'x-brain-user-tz': 'Asia/Shanghai'
          },
          body: JSON.stringify({
            session_id: 'session_1754290538566_9hsbna6',
            stream: true
          }),
          method: 'POST',
          mode: 'cors',
          credentials: 'include'
        }
      );

      const result = await stream.handleStreamResponse(response);

      console.log(result);
      expect(receivedMessages.length).toBeGreaterThan(0);

      // // Log final results
      // console.log(
      //   'Test completed. Total messages received:',
      //   receivedMessages.length
      // );
      // console.log('First message:', JSON.parse(receivedMessages[0]));
      // console.log(
      //   'Last message:',
      //   JSON.parse(receivedMessages[receivedMessages.length - 1])
      // );
    }, 30000); // Increase timeout to 30s for API call
  });
});
