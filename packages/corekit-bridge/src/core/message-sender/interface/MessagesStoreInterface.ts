import {
  type AsyncStateInterface,
  StoreInterface,
  type StoreStateInterface
} from '../../store-state';

/**
 * Base message interface representing a complete message
 *
 * This interface defines the core structure of a message in the system,
 * extending async state capabilities for handling loading, error, and
 * success states during message lifecycle operations.
 *
 * @template T - Type of message content
 *
 * @example
 * ```typescript
 * interface ChatMessage extends MessageInterface<string> {
 *   id: string;
 *   content: string;
 *   sender: string;
 *   timestamp: number;
 * }
 * ```
 */
export interface MessageInterface<T = unknown> extends AsyncStateInterface<T> {
  /**
   * Unique message identifier
   *
   * Optional during message creation, assigned by the server upon successful
   * transmission. Used for message tracking, updates, and deletion operations.
   *
   * @example `"msg-123e4567-e89b-12d3-a456-426614174000"`
   */
  id?: string;
}

/**
 * Messages state interface for managing message collection state
 *
 * This interface extends the base store state with message-specific
 * state properties, including message history and streaming status.
 *
 * @template T - Type of messages in the collection
 *
 * @example
 * ```typescript
 * const state: MessagesStateInterface<ChatMessage> = {
 *   messages: [message1, message2],
 *   streaming: true
 * };
 * ```
 */
export interface MessagesStateInterface<T> extends StoreStateInterface {
  /**
   * Historical message list
   *
   * Contains all messages in the store, including sent messages,
   * received responses, and system messages. Messages are typically
   * ordered chronologically.
   */
  messages: T[];

  /**
   * Whether streaming is currently active
   *
   * Indicates if a message is currently being received in streaming mode.
   * Used for UI state management and preventing concurrent operations.
   *
   * @default `false`
   */
  streaming?: boolean;
}

/**
 * Abstract messages store interface for managing message collections
 *
 * This abstract class provides a comprehensive interface for message store
 * implementations, handling message CRUD operations, state management,
 * streaming control, and data serialization.
 *
 * Core features:
 * - Message CRUD operations (create, read, update, delete)
 * - Message collection management
 * - Streaming state control
 * - Message merging and validation
 * - Data serialization
 *
 * @template MessageType - Type of messages managed by the store
 * @template State - Type of store state
 *
 * @example Implementation
 * ```typescript
 * class ChatMessageStore extends MessagesStoreInterface<
 *   ChatMessage,
 *   ChatMessageState
 * > {
 *   createMessage(message: Partial<ChatMessage>): ChatMessage {
 *     return new ChatMessage(message);
 *   }
 *   // ... implement other abstract methods
 * }
 * ```
 *
 * @example Usage
 * ```typescript
 * const store = new ChatMessageStore();
 *
 * // Add message
 * const message = store.addMessage({ content: 'Hello' });
 *
 * // Get all messages
 * const messages = store.getMessages();
 *
 * // Update message
 * store.updateMessage(message.id, { content: 'Hello, world!' });
 * ```
 */
export abstract class MessagesStoreInterface<
  MessageType extends MessageInterface<unknown>,
  State extends MessagesStateInterface<MessageType>
> extends StoreInterface<State> {
  /**
   * Merge multiple updates into a target message
   *
   * Combines multiple partial message objects into the target message,
   * applying updates in order from left to right. Later updates override
   * earlier ones for the same fields.
   *
   * @template T - Specific message type
   *
   * @param target - Target message to merge updates into
   * @param updates - Variable number of partial message objects to merge
   * @returns Merged message with all updates applied
   *
   * @example
   * ```typescript
   * const message = store.createMessage({ content: 'Hello' });
   * const merged = store.mergeMessage(
   *   message,
   *   { metadata: { edited: true } },
   *   { timestamp: Date.now() }
   * );
   * ```
   */
  abstract mergeMessage<T extends MessageType>(
    target: T,
    ...updates: Partial<T>[]
  ): T;

  /**
   * Create a new message instance
   *
   * Constructs a new message object from a partial message specification.
   * Implementations should provide default values for required fields
   * and validate the message structure.
   *
   * @template T - Specific message type
   *
   * @param message - Partial message specification
   * @returns Complete message instance
   *
   * @example
   * ```typescript
   * const message = store.createMessage({
   *   content: 'Hello',
   *   sender: 'user-123'
   * });
   * console.log(message.id); // Generated ID
   * ```
   */
  abstract createMessage<T extends MessageType>(message: Partial<T>): T;

  /**
   * Get all messages from the store
   *
   * Returns the complete list of messages in the store, typically
   * ordered chronologically from oldest to newest.
   *
   * @returns Array of all messages in the store
   *
   * @example
   * ```typescript
   * const messages = store.getMessages();
   * console.log(`Total messages: ${messages.length}`);
   * messages.forEach(msg => console.log(msg.content));
   * ```
   */
  abstract getMessages(): MessageType[];

  /**
   * Get a message by its unique identifier
   *
   * Retrieves a specific message from the store by ID.
   * Returns `undefined` if no message with the given ID exists.
   *
   * @param id - Unique identifier of the message
   * @returns Message object or `undefined` if not found
   *
   * @example
   * ```typescript
   * const message = store.getMessageById('msg-123');
   * if (message) {
   *   console.log('Found:', message.content);
   * } else {
   *   console.log('Message not found');
   * }
   * ```
   */
  abstract getMessageById(id: string): MessageType | undefined;

  /**
   * Add a new message to the store
   *
   * Creates a new message from the partial specification and adds it
   * to the store. The message is typically appended to the message list.
   *
   * @template M - Specific message type
   *
   * @param message - Partial message specification
   * @returns Created and added message instance
   *
   * @example
   * ```typescript
   * const newMessage = store.addMessage({
   *   content: 'Hello, world!',
   *   sender: 'user-123',
   *   timestamp: Date.now()
   * });
   * console.log('Added message:', newMessage.id);
   * ```
   */
  abstract addMessage<M extends MessageType>(message: Partial<M>): M;

  /**
   * Update an existing message in the store
   *
   * Applies multiple partial updates to a message identified by ID.
   * Updates are applied in order from left to right. Returns `undefined`
   * if no message with the given ID exists.
   *
   * @template M - Specific message type
   *
   * @param id - Unique identifier of the message to update
   * @param updates - Variable number of partial message objects to apply
   * @returns Updated message or `undefined` if message not found
   *
   * @example Single update
   * ```typescript
   * const updated = store.updateMessage('msg-123', {
   *   content: 'Updated content'
   * });
   * ```
   *
   * @example Multiple updates
   * ```typescript
   * store.updateMessage(
   *   'msg-123',
   *   { content: 'New content' },
   *   { metadata: { edited: true } },
   *   { timestamp: Date.now() }
   * );
   * ```
   */
  abstract updateMessage<M extends MessageType>(
    id: string,
    ...updates: Partial<M>[]
  ): M | undefined;

  /**
   * Delete a message from the store
   *
   * Permanently removes a message from the store by its ID.
   * This operation cannot be undone. Does nothing if the message
   * doesn't exist.
   *
   * @param id - Unique identifier of the message to delete
   *
   * @example
   * ```typescript
   * // Delete a message
   * store.deleteMessage('msg-123');
   *
   * // Verify deletion
   * const deleted = store.getMessageById('msg-123');
   * console.log(deleted === undefined); // true
   * ```
   */
  abstract deleteMessage(id: string): void;

  /**
   * Type guard to check if an unknown value is a message
   *
   * Validates whether an unknown value conforms to the message type
   * managed by this store. Useful for runtime type checking and validation.
   *
   * @template T - Specific message type
   *
   * @param message - Value to check
   * @returns `true` if value is a valid message, `false` otherwise
   *
   * @example
   * ```typescript
   * function processUnknown(value: unknown) {
   *   if (store.isMessage(value)) {
   *     // TypeScript knows value is a message here
   *     console.log('Message content:', value.content);
   *   } else {
   *     console.log('Not a valid message');
   *   }
   * }
   * ```
   */
  abstract isMessage<T extends MessageType>(message: unknown): message is T;

  /**
   * Get the index position of a message in the store
   *
   * Returns the zero-based index of a message in the message array.
   * Returns `-1` if the message doesn't exist in the store.
   *
   * @param id - Unique identifier of the message
   * @returns Zero-based index of the message, or `-1` if not found
   *
   * @example
   * ```typescript
   * const index = store.getMessageIndex('msg-123');
   * if (index !== -1) {
   *   console.log(`Message is at position ${index + 1}`);
   * } else {
   *   console.log('Message not found');
   * }
   * ```
   */
  abstract getMessageIndex(id: string): number;

  /**
   * Get a message by its index position
   *
   * Retrieves a message at the specified zero-based index position.
   * Returns `undefined` if the index is out of bounds.
   *
   * @param index - Zero-based index position
   * @returns Message at the index or `undefined` if out of bounds
   *
   * @example
   * ```typescript
   * // Get first message
   * const first = store.getMessageByIndex(0);
   *
   * // Get last message
   * const messages = store.getMessages();
   * const last = store.getMessageByIndex(messages.length - 1);
   * ```
   */
  abstract getMessageByIndex(index: number): MessageType | undefined;

  /**
   * Replace all messages in the store
   *
   * Clears the current message list and replaces it with the provided
   * messages. This is useful for bulk updates or resetting the store state.
   *
   * @param messages - New message list to set in the store
   *
   * @example Reset with new messages
   * ```typescript
   * const newMessages = [message1, message2, message3];
   * store.resetMessages(newMessages);
   * ```
   *
   * @example Clear all messages
   * ```typescript
   * store.resetMessages([]);
   * ```
   */
  abstract resetMessages(messages: MessageType[]): void;

  /**
   * Convert all messages to JSON-serializable format
   *
   * Serializes all messages in the store to plain JavaScript objects
   * suitable for JSON serialization. Useful for persistence, logging,
   * or data export.
   *
   * @returns Array of JSON-serializable message objects
   *
   * @example
   * ```typescript
   * const jsonData = store.toJson();
   * const jsonString = JSON.stringify(jsonData, null, 2);
   * localStorage.setItem('messages', jsonString);
   * ```
   */
  abstract toJson(): Record<string, unknown>[];

  /**
   * Start streaming mode
   *
   * Sets the store state to indicate that streaming is active.
   * This is typically called when beginning to receive a streamed
   * message response.
   *
   * @example
   * ```typescript
   * // Start streaming
   * store.startStreaming();
   *
   * // Receive chunks...
   * onChunk((chunk) => {
   *   store.updateMessage(messageId, { content: chunk });
   * });
   *
   * // Stop when complete
   * store.stopStreaming();
   * ```
   */
  abstract startStreaming(): void;

  /**
   * Stop streaming mode
   *
   * Sets the store state to indicate that streaming has ended.
   * This is typically called when a streamed message response is
   * complete or cancelled.
   *
   * @example
   * ```typescript
   * try {
   *   store.startStreaming();
   *   await receiveStream();
   * } finally {
   *   store.stopStreaming(); // Always stop, even on error
   * }
   * ```
   */
  abstract stopStreaming(): void;
}
