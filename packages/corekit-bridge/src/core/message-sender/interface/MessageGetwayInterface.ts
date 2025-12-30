import type { MessageInterface } from './MessagesStoreInterface';
import type { ProxyAbortManagerConfig } from '@qlover/fe-corekit';

/**
 * Event callbacks for streaming message operations
 *
 * Provides lifecycle hooks for monitoring and handling streaming message
 * transmission, including connection establishment, data chunks, completion,
 * errors, progress tracking, and cancellation.
 *
 * @template M - Type of message being streamed
 *
 * @example
 * ```typescript
 * const streamEvents: MessageStreamEvent<ChatMessage> = {
 *   onConnected: () => console.log('Connected'),
 *   onChunk: (chunk) => console.log('Received:', chunk),
 *   onComplete: (msg) => console.log('Complete:', msg),
 *   onError: (err) => console.error('Error:', err)
 * };
 * ```
 */
export interface MessageStreamEvent<M = unknown> {
  /**
   * Called when network connection is successfully established
   *
   * This event fires after the request is sent and the server has responded,
   * but before any data chunks are received. Indicates that streaming is
   * about to begin.
   *
   * @example
   * ```typescript
   * onConnected: () => {
   *   console.log('Connection established, streaming will begin');
   *   showLoadingIndicator();
   * }
   * ```
   */
  onConnected?(): void;

  /**
   * Called each time a new data chunk is received
   *
   * This event fires for each chunk of data received during streaming.
   * The chunk typically contains cumulative message data, not incremental.
   *
   * @param chunk - Message fragment, usually the accumulated message so far
   *
   * @example
   * ```typescript
   * onChunk: (chunk) => {
   *   // Update UI with streaming content
   *   updateMessageDisplay(chunk.content);
   * }
   * ```
   */
  onChunk?(chunk: M): void;

  /**
   * Called when streaming transmission is complete
   *
   * This event fires after all chunks have been received and the stream
   * has ended successfully.
   *
   * @param finalMessage - The complete final message with all content
   *
   * @example
   * ```typescript
   * onComplete: (finalMessage) => {
   *   console.log('Streaming finished');
   *   hideLoadingIndicator();
   *   saveMessage(finalMessage);
   * }
   * ```
   */
  onComplete?(finalMessage: M): void;

  /**
   * Called when an error occurs during streaming
   *
   * This event fires if any error occurs during connection, streaming,
   * or processing of the message.
   *
   * @param error - Error object describing what went wrong
   *
   * @example
   * ```typescript
   * onError: (error) => {
   *   console.error('Stream error:', error);
   *   showErrorNotification(error.message);
   *   resetStreamState();
   * }
   * ```
   */
  onError?(error: unknown): void;

  /**
   * Called to report streaming progress
   *
   * This event provides progress updates during streaming transmission,
   * useful for displaying progress bars or status indicators.
   *
   * @param progress - Progress percentage (0-100)
   *
   * @example
   * ```typescript
   * onProgress: (progress) => {
   *   updateProgressBar(progress);
   *   console.log(`Download progress: ${progress}%`);
   * }
   * ```
   */
  onProgress?(progress: number): void;

  /**
   * Called when message transmission is stopped or cancelled
   *
   * This event fires when the user or system cancels the streaming operation.
   * The message contains any partial content that was received before cancellation.
   *
   * @param message - Message state at the time of cancellation,
   *   including any partially received content
   *
   * @example
   * ```typescript
   * onAborted: (message) => {
   *   console.log('Stream cancelled');
   *   console.log('Partial content:', message.content);
   *   saveDraft(message); // Save partial content as draft
   * }
   * ```
   */
  onAborted?(message: M): void;
}

/**
 * Configuration options for message gateway operations
 *
 * Extends message stream events with additional configuration for
 * controlling message transmission behavior, including streaming mode,
 * timeout settings, abort control, and custom parameters.
 *
 * @template M - Type of message being transmitted
 * @template P - Type of additional request parameters
 *
 * @example Basic usage
 * ```typescript
 * const options: GatewayOptions<ChatMessage> = {
 *   stream: true,
 *   timeout: 30000,
 *   onChunk: (chunk) => console.log(chunk)
 * };
 * ```
 *
 * @example With custom parameters
 * ```typescript
 * interface CustomParams {
 *   temperature: number;
 *   maxTokens: number;
 * }
 *
 * const options: GatewayOptions<ChatMessage, CustomParams> = {
 *   stream: true,
 *   params: {
 *     temperature: 0.7,
 *     maxTokens: 2000
 *   }
 * };
 * ```
 */
export interface GatewayOptions<M, P = Record<string, unknown>>
  extends MessageStreamEvent<M>,
    Omit<ProxyAbortManagerConfig, 'onAborted'> {
  /**
   * Whether to use streaming mode
   *
   * Controls the message transmission mode:
   * - `true`: Streaming mode - content is progressively output (`onChunk` will be called)
   * - `false` or `undefined`: Normal mode - complete content returned at once
   *
   * Important:
   * - Streaming provides real-time feedback for long responses
   * - Both modes support abort control (signal) when options are provided
   * - Streaming is recommended for AI-generated content or large responses
   *
   * @default `false`
   *
   * @example Enable streaming
   * ```typescript
   * const options = {
   *   stream: true,
   *   onChunk: (chunk) => updateUI(chunk)
   * };
   * ```
   */
  stream?: boolean;

  /**
   * Request timeout in milliseconds
   *
   * Maximum time to wait for the request to complete. If the request
   * takes longer than this duration, it will be aborted.
   *
   * @example
   * ```typescript
   * const options = {
   *   timeout: 30000 // 30 seconds
   * };
   * ```
   */
  timeout?: number;

  /**
   * Additional request parameters
   *
   * Custom parameters to be sent with the message request.
   * The type can be customized using the generic parameter `P`.
   *
   * @example
   * ```typescript
   * const options = {
   *   params: {
   *     model: 'gpt-4',
   *     temperature: 0.7,
   *     maxTokens: 2000
   *   }
   * };
   * ```
   */
  params?: P;
}

/**
 * Message gateway interface for sending messages to external services
 *
 * This interface defines the contract for message gateway implementations
 * that handle message transmission to external services (e.g., chat APIs,
 * message brokers). It supports both normal and streaming modes of operation.
 *
 * @example Basic implementation
 * ```typescript
 * class ChatGateway implements MessageGetwayInterface {
 *   async sendMessage<M extends MessageInterface<unknown>>(
 *     message: M,
 *     options?: GatewayOptions<M>
 *   ): Promise<M> {
 *     if (options?.stream) {
 *       return this.sendStreamingMessage(message, options);
 *     }
 *     return this.sendNormalMessage(message);
 *   }
 * }
 * ```
 *
 * @example Usage
 * ```typescript
 * const gateway: MessageGetwayInterface = new ChatGateway();
 *
 * // Normal send
 * const result = await gateway.sendMessage(message);
 *
 * // Streaming send
 * await gateway.sendMessage(message, {
 *   stream: true,
 *   onChunk: (chunk) => console.log(chunk)
 * });
 * ```
 */
export interface MessageGetwayInterface {
  /**
   * Send a message through the gateway
   *
   * Transmits a message to the configured external service. Supports both
   * normal mode (one-time response) and streaming mode (progressive response).
   *
   * @template M - Type of message, must extend `MessageInterface`
   *
   * @param message - Message object to send
   * @param options - Optional gateway configuration including stream events,
   *   timeout, and custom parameters
   * @returns Promise resolving to the sent message with response data
   *
   * @throws {Error} When message transmission fails
   * @throws {TimeoutError} When request exceeds the specified timeout
   * @throws {AbortError} When request is cancelled via abort signal
   *
   * @example Normal send
   * ```typescript
   * const message = createMessage({ content: 'Hello' });
   * const result = await gateway.sendMessage(message);
   * console.log('Response:', result.content);
   * ```
   *
   * @example Streaming send
   * ```typescript
   * await gateway.sendMessage(message, {
   *   stream: true,
   *   onConnected: () => console.log('Connected'),
   *   onChunk: (chunk) => updateUI(chunk),
   *   onComplete: (final) => console.log('Done:', final),
   *   onError: (err) => console.error('Error:', err)
   * });
   * ```
   *
   * @example With timeout and abort control
   * ```typescript
   * const controller = new AbortController();
   *
   * const promise = gateway.sendMessage(message, {
   *   timeout: 30000,
   *   signal: controller.signal,
   *   onProgress: (progress) => console.log(`${progress}%`)
   * });
   *
   * // Cancel if needed
   * setTimeout(() => controller.abort(), 5000);
   * ```
   */
  sendMessage<M extends MessageInterface<unknown>>(
    message: M,
    options?: GatewayOptions<M>
  ): Promise<unknown | M>;
}
