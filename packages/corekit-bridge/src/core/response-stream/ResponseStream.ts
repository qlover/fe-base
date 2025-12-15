import {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterConfig
} from '@qlover/fe-corekit';
import { StreamProcessorInterface } from './StreamProcessorInterface';
import { StreamEvent } from './StreamEvent';
import { LineStreamProcessor } from './LineStreamProcessor';
import { SSEStreamProcessor } from './SSEStreamProcessor';

/**
 * Configuration options for the ResponseStream plugin
 *
 * Core functionality:
 * - Stream data processing with customizable processors
 * - Support for both line-based and SSE stream formats
 * - Event-driven stream handling with callbacks
 * - Error handling and stream completion events
 */
export interface ResponseStreamConfig {
  /**
   * Stream processor for handling stream data
   *
   * Determines how incoming stream data is processed and parsed.
   * Can be customized to handle different stream formats.
   *
   * @default LineStreamProcessor if ssePrefix is not set
   * @default SSEStreamProcessor if ssePrefix is set
   */
  processor?: StreamProcessorInterface;

  /**
   * Custom content types to be treated as stream responses
   *
   * By default, 'text/event-stream' and 'application/x-ndjson' are treated as streams.
   * Add additional content types here if needed.
   *
   * @example ['text/event-stream', 'application/x-ndjson', 'custom/stream-type']
   */
  streamContentTypes?: string[];

  /**
   * SSE prefix for stream data
   *
   * Used to identify and parse Server-Sent Events (SSE) data.
   * When set, automatically uses SSEStreamProcessor for handling stream data.
   *
   * @example `"data: "` - Common SSE data prefix
   */
  ssePrefix?: string;

  /**
   * Callback when receiving stream data
   *
   * Called for each processed chunk of stream data.
   * Useful for real-time data handling and UI updates.
   *
   * @param chunk - Processed data chunk
   * @param streamEvent - Stream event instance containing processing state
   */
  onStreamChunk?(chunk: string, streamEvent: StreamEvent): void;

  /**
   * Callback when stream is done
   *
   * Called when the stream is completed successfully.
   * Use this to perform cleanup or final data processing.
   */
  onStreamDone?(): void;

  /**
   * Callback when error occurs
   *
   * Called when stream processing encounters an error.
   * Use this to handle error cases and provide user feedback.
   *
   * @param error - Error object containing error details
   */
  onStreamError?(error: Error): void;
}

/**
 * Plugin for handling stream response data
 *
 * Core functionality:
 * - Processes streaming HTTP responses
 * - Supports both line-based and SSE stream formats
 * - Provides event-based stream processing
 * - Handles stream errors and completion
 *
 * Business rules:
 * - Automatically detects and uses appropriate stream processor
 * - Maintains stream state and buffer management
 * - Ensures proper stream cleanup and resource release
 *
 * @since 1.5.0
 *
 * @example Basic usage
 * ```typescript
 * const streamPlugin = new ResponseStream({
 *   onStreamChunk: (chunk) => console.log(chunk),
 *   onStreamDone: () => console.log('Stream completed')
 * });
 * ```
 *
 * @example SSE stream handling
 * ```typescript
 * const ssePlugin = new ResponseStream({
 *   ssePrefix: 'data: ',
 *   onStreamChunk: (chunk) => handleSSEData(chunk)
 * });
 * ```
 */
export class ResponseStream implements ExecutorPlugin<RequestAdapterConfig> {
  public readonly pluginName = 'ResponseStream';

  constructor(private config: ResponseStreamConfig = {}) {}

  /**
   * Process stream response data
   *
   * Handles successful response by checking if it's a stream
   * and processing it accordingly.
   *
   * @override
   * @param context - Executor context containing response data
   */
  public async onSuccess(
    context: ExecutorContext<RequestAdapterConfig>
  ): Promise<void> {
    const response = context.returnValue;
    if (!(response instanceof Response)) {
      return;
    }

    const requestConfig = context.parameters;
    const responseType = requestConfig?.responseType;

    // If responseType is explicitly set to 'stream', handle as stream
    if (responseType === 'stream' && response.body) {
      await this.handleStreamResponse(response, {
        ...context.parameters,
        ...this.config
      });
      return;
    }

    // Fallback to content-type check if responseType is not set
    const contentType = response.headers?.get('Content-Type') || '';
    const defaultStreamTypes = ['text/event-stream', 'application/x-ndjson'];
    const customStreamTypes = this.config.streamContentTypes || [];
    const isStreamResponse = [...defaultStreamTypes, ...customStreamTypes].some(
      (type) => contentType.includes(type)
    );

    // Handle as stream if content type matches or responseType is 'stream'
    if (
      response.body &&
      (isStreamResponse || requestConfig?.responseType === 'stream')
    ) {
      await this.handleStreamResponse(response, {
        ...context.parameters,
        ...this.config
      });
    }
  }

  /**
   * Handle stream response data
   *
   * Core functionality:
   * - Validates response status
   * - Sets up appropriate stream processor
   * - Manages stream reading and event handling
   * - Ensures proper resource cleanup
   *
   * @throws {Error} If the stream request fails or reader cannot be obtained
   * @param response - Response stream from HTTP request
   * @param config - Optional configuration overrides
   * @returns Final processed data or undefined
   */
  public async handleStreamResponse(
    response: Response,
    config?: RequestAdapterConfig<unknown> & ResponseStreamConfig
  ): Promise<string | undefined> {
    const ssePrefix = config?.ssePrefix ?? this.config.ssePrefix;
    const processor =
      config?.processor ??
      this.config.processor ??
      (ssePrefix
        ? new SSEStreamProcessor(ssePrefix)
        : new LineStreamProcessor());

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Stream request failed with status ${response.status}: ${errorBody}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Could not get reader from response body');
    }

    const streamEvent = new StreamEvent(processor);

    try {
      return await this.streamWithEvent(reader, streamEvent);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process stream data with event handling
   *
   * Core functionality:
   * - Reads stream data chunks
   * - Processes data using configured processor
   * - Triggers callbacks for chunks and completion
   * - Manages stream buffer and state
   *
   * Business rules:
   * - Continues reading until stream is done or finished flag is set
   * - Processes complete messages from buffer before callback
   * - Ensures proper event order (chunk → done)
   *
   * @param reader - Stream reader instance
   * @param streamEvent - Stream event instance for state management
   * @param config - Optional configuration overrides
   * @returns Final processed data or undefined
   */
  public async streamWithEvent<R>(
    reader: ReadableStreamDefaultReader<R>,
    streamEvent: StreamEvent,
    config?: RequestAdapterConfig<unknown> & ResponseStreamConfig
  ): Promise<string | undefined> {
    const onStreamChunk =
      config?.onStreamChunk?.bind(config) ??
      this.config.onStreamChunk?.bind(this.config);

    const onStreamDone =
      config?.onStreamDone?.bind(config) ??
      this.config.onStreamDone?.bind(this.config);

    while (true) {
      const { done, value } = await reader.read();

      // If outside of stream or stream is finished, return the final data
      if (done || streamEvent.isFinished()) {
        const finalData = streamEvent.doned();
        if (finalData) {
          onStreamChunk?.(finalData, streamEvent);
        }
        onStreamDone?.();
        return finalData;
      }

      if (value) {
        const chunk = streamEvent.parseChunk(value);
        streamEvent.append(chunk);

        // Process complete messages from buffer
        const messages = streamEvent.processBuffer();
        for (const message of messages) {
          onStreamChunk?.(message, streamEvent);
        }
      }
    }
  }
}
