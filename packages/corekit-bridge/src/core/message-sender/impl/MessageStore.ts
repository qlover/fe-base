import {
  type MessageInterface,
  MessagesStoreInterface,
  type MessagesStateInterface
} from '../interface/MessagesStoreInterface';

/**
 * Message status constants
 *
 * Defines the lifecycle states of a message from draft to completion.
 * These statuses help track message progress and display appropriate UI states.
 */
export const MessageStatus = Object.freeze({
  /**
   * Draft or editing state
   *
   * Message is being composed but not yet sent.
   */
  DRAFT: 'draft',

  /**
   * Sending in progress
   *
   * **Important rules:**
   * - Rule 1: During streaming, message should remain in `SENDING` status
   * - Rule 2: In non-streaming mode, message stays `SENDING` until result is received
   *
   * This status indicates the message has been submitted but response is not yet complete.
   */
  SENDING: 'sending',

  /**
   * Successfully sent
   *
   * Message was sent and response was received successfully.
   */
  SENT: 'sent',

  /**
   * Send failed
   *
   * Message sending encountered an error and failed to complete.
   */
  FAILED: 'failed',

  /**
   * Stopped/cancelled
   *
   * Message sending was cancelled by user or system before completion.
   */
  STOPPED: 'stopped'
});

/**
 * Type representing valid message statuses
 */
export type MessageStatusType =
  (typeof MessageStatus)[keyof typeof MessageStatus];

/**
 * Message store message interface
 *
 * Extends the base message interface with store-specific properties
 * for content, placeholders, attachments, and status tracking.
 *
 * @template T - Type of message content
 * @template R - Type of message result, defaults to `unknown`
 */
export interface MessageStoreMsg<T, R = unknown> extends MessageInterface<R> {
  /**
   * Placeholder text before content input
   *
   * Displayed when the message content is empty or loading,
   * providing context to the user about what to expect.
   */
  placeholder?: string;

  /**
   * Message content
   *
   * The main payload of the message. Type is generic to support
   * various content formats (text, rich content, structured data).
   */
  content?: T;

  /**
   * File attachments
   *
   * Optional file attachments associated with the message.
   * Support for file handling may be added in future versions.
   */
  files?: File[];

  /**
   * Current message status
   *
   * Tracks the lifecycle state of the message from draft to completion.
   */
  status?: MessageStatusType;
}

/**
 * Messages store implementation for managing message collections
 *
 * Provides a complete implementation of message store functionality including
 * CRUD operations, state management, streaming control, and prototype preservation.
 * This class handles all message lifecycle operations and state synchronization.
 *
 * Core features:
 * - Prototype-preserving message merging for class instances
 * - Automatic ID generation for new messages
 * - State emission for reactive UI updates
 * - Message validation and type checking
 * - Streaming state management
 *
 * @template MessageType - Type of messages managed by the store
 * @template State - Type of store state
 *
 * @example Basic usage
 * ```typescript
 * const store = new MessagesStore();
 *
 * // Add messages
 * const message = store.addMessage({ content: 'Hello' });
 *
 * // Update messages
 * store.updateMessage(message.id, { content: 'Hello, world!' });
 *
 * // Get all messages
 * const messages = store.getMessages();
 * ```
 *
 * @example With streaming
 * ```typescript
 * store.startStreaming();
 * // ... process stream chunks
 * store.stopStreaming();
 * ```
 */
export class MessagesStore<
  MessageType extends MessageStoreMsg<unknown, unknown> = MessageStoreMsg<
    unknown,
    unknown
  >,
  State extends
    MessagesStateInterface<MessageType> = MessagesStateInterface<MessageType>
> extends MessagesStoreInterface<MessageType, State> {
  /**
   * Merge message objects while preserving prototype chain
   *
   * **Important:** This method preserves the prototype chain for class instances,
   * ensuring that methods and instanceof checks continue to work after merging.
   * Plain objects are merged directly without prototype preservation.
   *
   * @template T - Specific message type
   *
   * @param target - Target message to merge updates into
   * @param updates - Variable number of partial message objects to merge
   * @returns Merged message with prototype chain preserved
   *
   * @example With class instance
   * ```typescript
   * class ChatMessage extends MessageStoreMsg {
   *   greet() { return 'Hello'; }
   * }
   *
   * const message = new ChatMessage({ content: 'Hi' });
   * const merged = store.mergeMessage(message, { content: 'Hello' });
   *
   * // Prototype is preserved
   * console.log(merged instanceof ChatMessage); // true
   * console.log(merged.greet()); // "Hello"
   * ```
   *
   * @example With plain object
   * ```typescript
   * const message = { content: 'Hi', id: '123' };
   * const merged = store.mergeMessage(message, { content: 'Hello' });
   * // Plain object merge
   * ```
   */
  public override mergeMessage<T extends MessageStoreMsg<unknown, unknown>>(
    target: T,
    ...updates: Partial<T>[]
  ): T {
    // Check if target is a class instance (not a plain object)
    const proto = Object.getPrototypeOf(target);
    if (proto && proto.constructor && proto.constructor !== Object) {
      // Preserve prototype chain: create new object inheriting from prototype
      return Object.assign(Object.create(proto), target, ...updates);
    }

    // Plain object, merge directly
    return Object.assign({}, target, ...updates);
  }

  /**
   * Get all messages from the store
   *
   * @returns Array of all messages in the store
   */
  public override getMessages(): MessageType[] {
    return this.state.messages ?? [];
  }

  /**
   * Generate default ID for a message
   *
   * Creates a unique ID using timestamp and random string.
   * Format: `{timestamp}-{random}`
   *
   * @param message - Partial message object
   * @returns Generated unique ID string
   *
   * @example
   * ```typescript
   * const id = store.defaultId({ content: 'Hello' });
   * // "1640000000000-abc123xyz"
   * ```
   */
  protected defaultId(message: Partial<MessageType>): string {
    return `${message.startTime ?? Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Create a new message instance with defaults
   *
   * Constructs a complete message object from partial data, applying
   * default values for required fields like ID, status, and timestamps.
   *
   * @template T - Specific message type
   *
   * @param message - Partial message specification
   * @returns Complete message instance with defaults applied
   *
   * @example
   * ```typescript
   * const message = store.createMessage({
   *   content: 'Hello'
   * });
   * // Full message with generated ID, status=DRAFT, etc.
   * ```
   */
  public override createMessage<T extends MessageType>(
    message: Partial<T> = {}
  ): T {
    const startTime = message.startTime ?? Date.now();
    const id = message.id ?? this.defaultId(message);
    const status = message.status ?? MessageStatus.DRAFT;
    const loading = message.loading ?? false;
    const endTime = message.endTime ?? 0;

    return Object.assign({}, message, {
      id,
      status,
      loading,
      result: message.result ?? null,
      error: message.error ?? null,
      startTime,
      endTime
    }) as T;
  }

  /**
   * Get a message by its unique identifier
   *
   * @param id - Unique identifier of the message
   * @returns Message object or `undefined` if not found
   */
  public override getMessageById(id: string): MessageType | undefined {
    return this.getMessages().find((message) => message.id === id);
  }

  /**
   * Add a new message to the store
   *
   * If the message has an ID and already exists in the store, updates the
   * existing message instead of adding a duplicate. Otherwise creates and
   * adds a new message to the collection.
   *
   * @template M - Specific message type
   *
   * @param message - Partial message specification
   * @returns Created or updated message instance
   *
   * @example Add new message
   * ```typescript
   * const message = store.addMessage({
   *   content: 'Hello, world!'
   * });
   * ```
   *
   * @example Add message with ID (updates if exists)
   * ```typescript
   * const message = store.addMessage({
   *   id: 'msg-123',
   *   content: 'Updated content'
   * });
   * ```
   */
  public override addMessage<M extends MessageType>(message: Partial<M>): M {
    // If the message has an id, update the message instead of adding it
    if (message.id) {
      const existingMessage = this.getMessageById(message.id) as M;

      if (existingMessage) {
        return this.updateMessage<M>(message.id, existingMessage, message)!;
      }
    }

    const finalMessage = this.createMessage(message);
    const newMessages = [...this.getMessages(), finalMessage];

    this.emit(
      this.cloneState({
        messages: newMessages
      } as Partial<State>)
    );

    return finalMessage;
  }

  /**
   * Update an existing message in the store
   *
   * Applies multiple partial updates to a message identified by ID.
   * Uses a single traversal to find and update the message efficiently.
   * Returns `undefined` if no message with the given ID exists.
   *
   * @template M - Specific message type
   *
   * @param id - Unique identifier of the message to update
   * @param updates - Variable number of partial message objects to apply
   * @returns Updated message or `undefined` if message not found
   *
   * @example
   * ```typescript
   * const updated = store.updateMessage('msg-123', {
   *   content: 'New content',
   *   status: MessageStatus.SENT
   * });
   * ```
   */
  public override updateMessage<M extends MessageType>(
    id: string,
    ...updates: Partial<M>[]
  ): M | undefined {
    let updatedMessage: M | undefined;
    const messages = this.getMessages();

    // Use map for single traversal to find and update
    const newMessages = messages.map((msg) => {
      if (msg.id === id) {
        updatedMessage = this.mergeMessage(msg as M, ...updates);
        return updatedMessage;
      }
      return msg;
    });

    // If no matching message found, return early
    if (!updatedMessage) {
      return;
    }

    this.emit(this.cloneState({ messages: newMessages } as Partial<State>));

    return updatedMessage;
  }

  /**
   * Delete a message from the store
   *
   * Permanently removes a message from the store by its ID using a single
   * traversal with filter. Does nothing if the message doesn't exist.
   *
   * @param id - Unique identifier of the message to delete
   *
   * @example
   * ```typescript
   * store.deleteMessage('msg-123');
   * ```
   */
  public override deleteMessage(id: string): void {
    const messages = this.getMessages();
    // Use filter for single traversal deletion
    const newMessages = messages.filter((message) => message.id !== id);

    // If array length unchanged, message was not found
    if (newMessages.length === messages.length) {
      return;
    }

    this.emit(this.cloneState({ messages: newMessages } as Partial<State>));
  }

  /**
   * Type guard to check if an unknown value is a message
   *
   * Validates whether an unknown value is a non-null object,
   * which is the basic requirement for message objects.
   *
   * @template T - Specific message type
   *
   * @param message - Value to check
   * @returns `true` if value is a valid message object, `false` otherwise
   *
   * @example
   * ```typescript
   * if (store.isMessage(value)) {
   *   // TypeScript knows value is a message here
   *   console.log(value.content);
   * }
   * ```
   */
  public override isMessage<T extends MessageType>(
    message: unknown
  ): message is T {
    return typeof message === 'object' && message !== null;
  }

  /**
   * Get the index position of a message in the store
   *
   * @param id - Unique identifier of the message
   * @returns Zero-based index of the message, or `-1` if not found
   */
  public override getMessageIndex(id: string): number {
    return this.getMessages().findIndex((message) => message.id === id);
  }

  /**
   * Get a message by its index position
   *
   * @param index - Zero-based index position
   * @returns Message at the index or `undefined` if out of bounds
   */
  public override getMessageByIndex(index: number): MessageType | undefined {
    return this.getMessages().at(index);
  }

  /**
   * Replace all messages in the store
   *
   * Clears the current message list and replaces it with the provided
   * messages. Each message is processed through `createMessage` to ensure
   * proper defaults and structure.
   *
   * @param messages - New message list to set in the store
   *
   * @example
   * ```typescript
   * store.resetMessages([message1, message2, message3]);
   * ```
   */
  public override resetMessages(messages: MessageType[]): void {
    this.emit(
      this.cloneState({
        messages: messages.map((message) => this.createMessage(message))
      } as Partial<State>)
    );
  }

  /**
   * Convert all messages to JSON-serializable format
   *
   * Serializes all messages in the store to plain JavaScript objects
   * by parsing and stringifying. This removes methods and prototypes.
   *
   * @returns Array of JSON-serializable message objects
   *
   * @example
   * ```typescript
   * const jsonData = store.toJson();
   * localStorage.setItem('messages', JSON.stringify(jsonData));
   * ```
   */
  public override toJson(): Record<string, unknown>[] {
    return JSON.parse(JSON.stringify(this.getMessages()));
  }

  /**
   * Start streaming mode
   *
   * Sets the store state to indicate that streaming is active.
   * Emits state change for reactive UI updates.
   */
  public override startStreaming(): void {
    this.emit(this.cloneState({ streaming: true } as Partial<State>));
  }

  /**
   * Stop streaming mode
   *
   * Sets the store state to indicate that streaming has ended.
   * Emits state change for reactive UI updates.
   */
  public override stopStreaming(): void {
    this.emit(this.cloneState({ streaming: false } as Partial<State>));
  }
}
