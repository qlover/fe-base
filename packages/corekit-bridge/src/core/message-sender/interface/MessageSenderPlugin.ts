import {
  type ExecutorContextInterface,
  type HookRuntimes,
  type LifecyclePluginInterface
} from '@qlover/fe-corekit';
import {
  type MessageInterface,
  type MessagesStateInterface,
  type MessagesStoreInterface
} from './MessagesStoreInterface';
import { type MessageSenderBaseConfig } from './MessageSenderInterface';

/**
 * Extended HookRuntimes for MessageSender with stream tracking support
 *
 * Extends the base HookRuntimes interface to include stream-specific
 * runtime tracking properties.
 *
 * @example
 * ```typescript
 * const runtimes: MessageSenderHookRuntimes = {
 *   ...baseRuntimes,
 *   streamTimes: 5 // Number of stream chunks processed
 * };
 * ```
 */
export interface MessageSenderHookRuntimes extends HookRuntimes {
  /**
   * Number of stream chunks processed
   *
   * Tracks the count of stream chunks that have been processed
   * through the plugin pipeline. Incremented automatically by
   * `runStream` method.
   *
   * @optional
   * @default `0`
   * @example `5` // 5 chunks processed
   */
  streamTimes?: number;
}

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
export interface MessageSenderOptions<
  MessageType extends MessageInterface<unknown>
> extends MessageSenderBaseConfig {
  /**
   * Message store instance
   *
   * Provides access to the message store for persistence and
   * state management operations during message sending.
   */
  store: MessagesStoreInterface<
    MessageType,
    MessagesStateInterface<MessageType>
  >;

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

  /**
   * Abort signal for request cancellation
   *
   * @optional
   */
  signal?: AbortSignal;
}

/**
 * Type alias for message sender plugin context
 *
 * Wraps the message sender context in an executor context for use
 * in plugin implementations. Uses extended HookRuntimes with stream tracking.
 *
 * This is the actual context instance type used at runtime.
 *
 * @template T - Type of message being processed
 */
export type MessageSenderContext<T extends MessageInterface<unknown>> =
  ExecutorContextInterface<
    MessageSenderOptions<T>,
    T,
    MessageSenderHookRuntimes
  >;

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
 *   pluginName: 'logger',
 *   onBefore: (ctx) => {
 *     console.log('Sending:', ctx.parameters.currentMessage);
 *   }
 * };
 * ```
 *
 * @example Plugin with streaming support
 * ```typescript
 * const streamPlugin: MessageSenderPlugin<ChatMessage> = {
 *   pluginName: 'stream-handler',
 *   onConnected: (ctx) => {
 *     console.log('Stream connected');
 *   },
 *   onStream: (ctx, chunk) => {
 *     console.log('Received chunk:', chunk);
 *     return chunk;
 *   }
 * };
 * ```
 */
export interface MessageSenderPlugin<T extends MessageInterface<unknown>>
  extends LifecyclePluginInterface<
    ExecutorContextInterface<
      MessageSenderOptions<T>,
      T,
      MessageSenderHookRuntimes
    >
  > {
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
  onStream?(context: MessageSenderContext<T>, chunk: unknown): unknown | void;

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
  onConnected?(context: MessageSenderContext<T>): void;
}
