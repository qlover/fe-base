import { ChatMessage } from '../impl/ChatMessage';
import {
  MessagesStateInterface,
  MessagesStoreInterface
} from './MessagesStoreInterface';

/**
 * State interface for chat message store
 *
 * Extends the base message state with chat-specific features like
 * draft messages and send control.
 *
 * @template T - Type of message content
 */
export interface ChatMessageStoreStateInterface<T = unknown>
  extends MessagesStateInterface<ChatMessage<T>> {
  /**
   * Draft message list
   *
   * Draft messages are unsent messages being composed by the user.
   * They are persisted separately from sent messages and can be edited
   * before sending.
   *
   * Business rules:
   * - Draft messages are not sent to the server
   * - Drafts persist across page reloads
   * - Only one draft per user session typically
   */
  draftMessages: ChatMessage<T>[];

  /**
   * Whether sending messages is disabled
   *
   * Controls whether the user can send messages. Can be used to
   * prevent sending during validation, rate limiting, or other
   * application-specific conditions.
   */
  disabledSend: boolean;
}

/**
 * Chat message store interface for managing chat message state and operations
 *
 * This interface extends the base message store with chat-specific functionality,
 * including draft message management, message state tracking, and send control.
 * It provides comprehensive methods for handling the complete lifecycle of chat messages.
 *
 * Core features:
 * - Draft message CRUD operations
 * - Message state management
 * - Send readiness validation
 * - Message queue handling
 *
 * @template T - Type of message content
 *
 * @example Basic usage
 * ```typescript
 * const store: ChatMessageStoreInterface<string> = createStore();
 *
 * // Add draft message
 * store.addDraftMessage({ content: 'Hello' });
 *
 * // Get first draft
 * const draft = store.getFirstDraftMessage();
 *
 * // Update draft
 * store.updateDraftMessage(draft.id, { content: 'Hello, world!' });
 * ```
 */
export interface ChatMessageStoreInterface<T = unknown>
  extends MessagesStoreInterface<
    ChatMessage<T>,
    ChatMessageStoreStateInterface<T>
  > {
  /**
   * Get draft message by ID
   *
   * Retrieves a specific draft message from the draft message list.
   * Returns `null` if no draft with the given ID exists.
   *
   * @param messageId - Unique identifier of the draft message
   * @returns Draft message or `null` if not found
   *
   * @example
   * ```typescript
   * const draft = store.getDarftMessageById('draft-123');
   * if (draft) {
   *   console.log('Draft content:', draft.content);
   * }
   * ```
   */
  getDarftMessageById(messageId: string): ChatMessage<T> | null;

  /**
   * Get all draft messages
   *
   * Returns the complete list of draft messages in the store.
   * Draft messages are unsent messages being composed by the user.
   *
   * @returns Array of draft messages
   *
   * @example
   * ```typescript
   * const drafts = store.getDraftMessages();
   * console.log(`You have ${drafts.length} draft(s)`);
   * ```
   */
  getDraftMessages(): ChatMessage<T>[];

  /**
   * Add a new draft message
   *
   * Creates and adds a new draft message to the store. The message will
   * be stored as a draft and will not be sent until explicitly requested.
   *
   * @param message - Partial message object containing at minimum the content
   *
   * @example
   * ```typescript
   * store.addDraftMessage({
   *   content: 'Hello, world!',
   *   metadata: { priority: 'high' }
   * });
   * ```
   */
  addDraftMessage(message: Partial<ChatMessage<T>>): void;

  /**
   * Delete a draft message
   *
   * Removes a draft message from the store by its ID. This operation
   * is permanent and cannot be undone.
   *
   * @param messageId - Unique identifier of the draft message to delete
   *
   * @example
   * ```typescript
   * // Delete specific draft
   * store.deleteDraftMessage('draft-123');
   * ```
   */
  deleteDraftMessage(messageId: string): void;

  /**
   * Update an existing draft message
   *
   * Modifies fields of an existing draft message. Only provided fields
   * will be updated; other fields remain unchanged.
   *
   * @param messageId - Unique identifier of the draft message to update
   * @param updates - Partial message object with fields to update
   * @returns Updated message or `undefined` if message not found
   *
   * @example
   * ```typescript
   * const updated = store.updateDraftMessage('draft-123', {
   *   content: 'Updated content',
   *   metadata: { edited: true }
   * });
   * ```
   */
  updateDraftMessage(
    messageId: string,
    updates: Partial<ChatMessage<T>>
  ): ChatMessage<T> | undefined;

  /**
   * Clear all draft messages
   *
   * Removes all draft messages from the store, or replaces them with
   * the provided message list if specified.
   *
   * @param messages - Optional replacement draft message list
   *
   * @example Clear all drafts
   * ```typescript
   * store.resetDraftMessages();
   * ```
   *
   * @example Replace with new drafts
   * ```typescript
   *
   * store.resetDraftMessages([newDraft1, newDraft2]);
   * ```
   */
  resetDraftMessages(messages?: ChatMessage<T>[]): void;

  /**
   * Get the first draft message added to the queue
   *
   * Returns the first message added to the draft messages list, not necessarily
   * the first element in the array. This follows a FIFO (First-In-First-Out) pattern.
   *
   * Important:
   * - Retrieves from `draftMessages` list (unsent drafts)
   * - NOT from `messages` list (sent message history)
   *
   * @returns First queued draft message or `null` if none exists
   *
   * @example
   * ```typescript
   * const firstDraft = store.getFirstDraftMessage();
   * if (firstDraft) {
   *   console.log('Oldest draft:', firstDraft.content);
   * }
   * ```
   */
  getFirstDraftMessage(): ChatMessage<T> | null;

  /**
   * Get and remove the first draft message
   *
   * Returns the first message from the draft queue and removes it from
   * the draft message list. Useful for processing drafts one at a time.
   *
   * @returns First queued draft message or `null` if none exists
   *
   * @example
   * ```typescript
   * // Process drafts in order
   * while (true) {
   *   const draft = store.shiftFirstDraftMessage();
   *   if (!draft) break;
   *   await sendMessage(draft);
   * }
   * ```
   */
  shiftFirstDraftMessage(): ChatMessage<T> | null;

  /**
   * Get the message ready to be sent
   *
   * Determines which message should be sent next, validating readiness
   * and returning the appropriate message for sending. If no message
   * is provided, retrieves from the draft queue.
   *
   * @param message - Optional specific message to validate for sending
   * @returns Message ready to send or `null` if none available
   *
   * @example Get next message to send
   * ```typescript
   * const readyMessage = store.getReadySendMessage();
   * if (readyMessage) {
   *   await gateway.send(readyMessage);
   * }
   * ```
   *
   * @example Validate specific message
   * ```typescript
   * const message = createMessage('Hello');
   * const ready = store.getReadySendMessage(message);
   * if (ready) {
   *   console.log('Message is valid and ready');
   * }
   * ```
   */
  getReadySendMessage(message?: ChatMessage<T>): ChatMessage<T> | null;
}
