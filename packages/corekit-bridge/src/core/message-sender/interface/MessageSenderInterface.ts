import type {
  MessageGetwayInterface,
  MessageStreamEvent
} from './MessageGetwayInterface';
import type {
  MessageInterface,
  MessagesStateInterface,
  MessagesStoreInterface
} from './MessagesStoreInterface';
import type { MessageSenderContext } from '../impl/MessageSenderExecutor';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

/**
 * Message sender interface for managing message transmission
 *
 * This interface provides a high-level API for sending messages, managing
 * message storage, and extending functionality through plugins. It serves
 * as the main entry point for message operations in the application.
 *
 * Core features:
 * - Message sending with normal and streaming modes
 * - Message store access for persistence
 * - Gateway management for external communication
 * - Plugin-based extensibility
 *
 * @template Message - Type of message, must extend `MessageInterface`
 *
 * @example Basic usage
 * ```typescript
 * const sender: MessageSenderInterface<ChatMessage> = createSender();
 *
 * // Access message store
 * const store = sender.getMessageStore();
 *
 * // Send message
 * const result = await sender.send({ content: 'Hello' });
 * ```
 *
 * @example With plugins
 * ```typescript
 * sender
 *   .use(loggingPlugin)
 *   .use(validationPlugin)
 *   .use(transformPlugin);
 *
 * await sender.send({ content: 'Hello' });
 * ```
 */
export interface MessageSenderInterface<Message extends MessageInterface> {
  /**
   * Get the message store instance
   *
   * Returns the message store responsible for managing message state
   * and persistence. The store provides access to message history,
   * state management, and CRUD operations.
   *
   * @returns Message store instance
   *
   * @example
   * ```typescript
   * const store = sender.getMessageStore();
   * const messages = store.getMessages();
   * console.log(`Total messages: ${messages.length}`);
   * ```
   */
  getMessageStore(): MessagesStoreInterface<
    Message,
    MessagesStateInterface<Message>
  >;

  /**
   * Get the gateway instance
   *
   * Returns the configured message gateway used for external communication.
   * Returns `undefined` if no gateway has been configured.
   *
   * @returns Gateway instance or `undefined` if not configured
   *
   * @example
   * ```typescript
   * const gateway = sender.getGateway();
   * if (gateway) {
   *   console.log('Gateway configured');
   * } else {
   *   console.log('No gateway available');
   * }
   * ```
   */
  getGateway(): MessageGetwayInterface | undefined;

  /**
   * Register a message sender plugin
   *
   * Extends the message sender functionality with custom plugins that can
   * intercept, modify, or enhance the message sending process. Plugins are
   * executed in the order they are registered.
   *
   * @template T - Type of message for the plugin context
   *
   * @param plugin - Plugin to register with the sender
   * @returns Current sender instance for method chaining
   *
   * @example Single plugin
   * ```typescript
   * sender.use({
   *   name: 'logger',
   *   execute: async (context, next) => {
   *     console.log('Sending:', context.message);
   *     const result = await next();
   *     console.log('Sent:', result);
   *     return result;
   *   }
   * });
   * ```
   *
   * @example Chained plugins
   * ```typescript
   * sender
   *   .use(authPlugin)
   *   .use(validationPlugin)
   *   .use(transformPlugin);
   * ```
   */
  use<T extends Message>(plugin: ExecutorPlugin<MessageSenderContext<T>>): this;

  /**
   * Send a message through the sender
   *
   * Sends a message using either normal mode (one-time response) or
   * streaming mode (progressive response) based on the provided options.
   *
   * Behavior:
   * - With `streamEvent` parameter: sends as streaming message with real-time updates
   * - Without `streamEvent`: sends as normal message with single response
   *
   * @param message - Partial message object containing at minimum the required fields
   * @param streamEvent - Optional stream event callbacks for streaming mode
   * @returns Promise resolving to the complete sent message
   *
   * @throws {ValidationError} When message validation fails
   * @throws {NetworkError} When network communication fails
   * @throws {GatewayError} When gateway is not configured or fails
   *
   * @example Normal send
   * ```typescript
   * const result = await sender.send({
   *   content: 'Hello, world!',
   *   metadata: { priority: 'high' }
   * });
   * console.log('Message sent:', result.id);
   * ```
   *
   * @example Streaming send
   * ```typescript
   * await sender.send(
   *   { content: 'Hello' },
   *   {
   *     onConnected: () => console.log('Connected'),
   *     onChunk: (chunk) => updateUI(chunk),
   *     onComplete: (final) => console.log('Complete:', final),
   *     onError: (err) => console.error('Error:', err)
   *   }
   * );
   * ```
   *
   * @example With error handling
   * ```typescript
   * try {
   *   const message = await sender.send({ content: 'Hello' });
   *   showSuccessNotification('Message sent!');
   * } catch (error) {
   *   showErrorNotification(error.message);
   * }
   * ```
   */
  send(
    message: Partial<Message>,
    streamEvent?: MessageStreamEvent
  ): Promise<Message>;
}
