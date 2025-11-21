import {
  AsyncExecutor,
  type ExecutorContext,
  type ExecutorPlugin
} from '@qlover/fe-corekit';
import type { MessageSenderConfig } from './MessageSender';
import type { MessagesStore, MessageStoreMsg } from './MessageStore';

/**
 * Message sender execution context
 *
 * Provides the complete execution context for message sender operations,
 * including configuration, store access, and message state tracking.
 * This context is passed through the plugin execution chain.
 *
 * @template MessageType - Type of message being processed
 *
 * @example
 * ```typescript
 * const context: MessageSenderContext<ChatMessage> = {
 *   store: messageStore,
 *   currentMessage: message,
 *   addedToStore: false,
 *   // ... other config properties
 * };
 * ```
 */
export interface MessageSenderContext<
  MessageType extends MessageStoreMsg<unknown, unknown> = MessageStoreMsg<
    unknown,
    unknown
  >
> extends MessageSenderConfig {
  /**
   * Message store instance
   *
   * Provides access to the message store for persistence and
   * state management operations during message sending.
   */
  store: MessagesStore<MessageType>;

  /**
   * Current message in the execution flow
   *
   * The message being processed in the current execution cycle.
   * This message may be updated by plugins as it flows through
   * the execution pipeline.
   */
  currentMessage: MessageType;

  /**
   * Whether message has been added to store
   *
   * Tracks if the current message has been persisted to the store.
   * Used by plugins to avoid duplicate additions and manage
   * message lifecycle properly.
   *
   * @default `false`
   */
  addedToStore?: boolean;
}

/**
 * Type alias for message sender plugin context
 *
 * Wraps the message sender context in an executor context for use
 * in plugin implementations.
 *
 * @template T - Type of message being processed
 */
export type MessageSenderPluginContext<
  T extends MessageStoreMsg<unknown, unknown>
> = ExecutorContext<MessageSenderContext<T>>;

/**
 * Message sender plugin interface
 *
 * Defines the contract for message sender plugins with support for
 * streaming operations. Plugins can hook into the send lifecycle
 * to modify messages, handle streaming chunks, and respond to
 * connection events.
 *
 * @template T - Type of message being processed
 *
 * @example Basic plugin
 * ```typescript
 * const plugin: MessageSenderPlugin<ChatMessage> = {
 *   name: 'logger',
 *   execute: async (context, next) => {
 *     console.log('Sending:', context.parameters.currentMessage);
 *     return next();
 *   }
 * };
 * ```
 *
 * @example Plugin with streaming support
 * ```typescript
 * const streamPlugin: MessageSenderPlugin<ChatMessage> = {
 *   name: 'stream-handler',
 *   execute: async (context, next) => next(),
 *   onConnected: (context) => {
 *     console.log('Stream connected');
 *   },
 *   onStream: (context, chunk) => {
 *     console.log('Received chunk:', chunk);
 *     return chunk;
 *   }
 * };
 * ```
 */
export interface MessageSenderPlugin<
  T extends MessageStoreMsg<unknown, unknown>
> extends ExecutorPlugin<MessageSenderContext<T>> {
  /**
   * Stream chunk received hook
   *
   * Called each time a chunk is received when sending in streaming mode.
   * This hook can process, transform, or log chunk data as it arrives.
   *
   * Behavior:
   * - Can return a message object to be used as the final return value
   * - Can return nothing (void) to pass through the chunk unchanged
   * - Can transform the chunk before passing to the next plugin
   *
   * @param context - Execution context with message sender parameters
   * @param chunk - Data chunk received from the stream
   * @returns Optional transformed chunk or message object
   *
   * @example Log chunks
   * ```typescript
   * onStream: (context, chunk) => {
   *   console.log('Chunk received:', chunk);
   * }
   * ```
   *
   * @example Transform chunks
   * ```typescript
   * onStream: (context, chunk) => {
   *   return {
   *     ...chunk,
   *     timestamp: Date.now()
   *   };
   * }
   * ```
   *
   * @example Update message state
   * ```typescript
   * onStream: async (context, chunk) => {
   *   const { currentMessage, store } = context.parameters;
   *   store.updateMessage(currentMessage.id, {
   *     content: chunk.content,
   *     loading: true
   *   });
   * }
   * ```
   */
  onStream?(
    context: MessageSenderPluginContext<T>,
    chunk: unknown
  ): Promise<unknown> | unknown | void;

  /**
   * Stream connection established hook
   *
   * Called when a streaming connection is successfully established,
   * before any chunks are received. Use this to initialize streaming
   * state or prepare for incoming data.
   *
   * @param context - Execution context with message sender parameters
   * @returns Promise that resolves when connection handling is complete
   *
   * @example Initialize streaming state
   * ```typescript
   * onConnected: (context) => {
   *   const { currentMessage, store } = context.parameters;
   *   store.updateMessage(currentMessage.id, {
   *     loading: true,
   *     status: 'streaming'
   *   });
   *   console.log('Stream connected, ready to receive');
   * }
   * ```
   *
   * @example Setup progress tracking
   * ```typescript
   * onConnected: async (context) => {
   *   await analytics.trackEvent('stream_started', {
   *     messageId: context.parameters.currentMessage.id
   *   });
   * }
   * ```
   */
  onConnected?(context: MessageSenderPluginContext<T>): Promise<void> | void;
}

/**
 * Message sender executor for managing plugin execution
 *
 * Extends AsyncExecutor to provide specialized execution flow for message
 * sending operations, including support for streaming chunks and connection
 * events. Manages plugin lifecycle and hook execution for message operations.
 *
 * Core features:
 * - Standard plugin execution for message sending
 * - Streaming chunk processing with all plugins
 * - Connection event broadcasting to plugins
 * - Stream timing tracking and management
 *
 * @example Basic usage
 * ```typescript
 * const executor = new MessageSenderExecutor();
 * executor.use(plugin1);
 * executor.use(plugin2);
 *
 * const context = createContext();
 * await executor.execute(context);
 * ```
 *
 * @example With streaming
 * ```typescript
 * const executor = new MessageSenderExecutor();
 * const context = createContext();
 *
 * // Notify connection
 * await executor.runConnected(context);
 *
 * // Process chunks
 * for await (const chunk of stream) {
 *   await executor.runStream(chunk, context);
 * }
 *
 * // Reset for next operation
 * executor.resetRuntimesStreamTimes(context);
 * ```
 */
export class MessageSenderExecutor extends AsyncExecutor {
  /**
   * Reset stream timing counter
   *
   * Resets the `streamTimes` counter in the context's hook runtimes to zero.
   * This should be called at the start of a new streaming operation to ensure
   * accurate timing tracking.
   *
   * @param context - Execution context containing hook runtimes
   *
   * @example
   * ```typescript
   * // Before starting a new stream
   * executor.resetRuntimesStreamTimes(context);
   * await startNewStream();
   * ```
   */
  public resetRuntimesStreamTimes(
    context: ExecutorContext<MessageSenderContext>
  ): void {
    context.hooksRuntimes.streamTimes = 0;
  }

  /**
   * Execute stream chunk processing through all plugins
   *
   * Runs the `onStream` hook for all registered plugins, passing the chunk
   * through the plugin chain. Automatically tracks and increments the stream
   * chunk counter for monitoring purposes.
   *
   * @param chunk - Data chunk received from the stream
   * @param context - Execution context with message sender parameters
   * @returns Result after processing through all plugin hooks
   *
   * @example Process streaming chunks
   * ```typescript
   * const context = createContext();
   *
   * for await (const chunk of streamReader) {
   *   const processed = await executor.runStream(chunk, context);
   *   updateUI(processed);
   * }
   * ```
   *
   * @example With chunk counting
   * ```typescript
   * await executor.runStream(chunk, context);
   * const chunkCount = context.hooksRuntimes.streamTimes;
   * console.log(`Processed ${chunkCount} chunks`);
   * ```
   */
  public async runStream(
    chunk: unknown,
    context: ExecutorContext<MessageSenderContext>
  ): Promise<unknown> {
    if (context.hooksRuntimes.streamTimes === undefined) {
      context.hooksRuntimes.streamTimes = 0;
    }

    if (typeof context.hooksRuntimes.streamTimes === 'number') {
      context.hooksRuntimes.streamTimes++;
    }

    return await this.runHooks(this.plugins, 'onStream', context, chunk);
  }

  /**
   * Execute connection established event through all plugins
   *
   * Runs the `onConnected` hook for all registered plugins when a streaming
   * connection is successfully established. This allows plugins to initialize
   * state or perform setup before chunks start arriving.
   *
   * @param context - Execution context with message sender parameters
   * @returns Promise that resolves when all plugins have handled the event
   *
   * @example Notify connection
   * ```typescript
   * const context = createContext();
   *
   * try {
   *   await establishConnection();
   *   await executor.runConnected(context);
   *   console.log('All plugins notified of connection');
   * } catch (error) {
   *   console.error('Connection failed:', error);
   * }
   * ```
   */
  public async runConnected(
    context: ExecutorContext<MessageSenderContext>
  ): Promise<void> {
    await this.runHooks(this.plugins, 'onConnected', context);
  }
}
