import { ChatMessage } from './ChatMessage';
import { MessagesStore, MessageStatus } from './MessageStore';
import type {
  ChatMessageStoreInterface,
  ChatMessageStoreStateInterface
} from '../interface/ChatMessageStoreInterface';

/**
 * Draft message processing modes
 *
 * Controls the order of adding and removing draft messages, which affects
 * the message sending sequence. Choose between stack (LIFO) and queue (FIFO)
 * behaviors based on application requirements.
 */
export const DraftMode = Object.freeze({
  /**
   * STACK mode (Last In First Out - LIFO)
   *
   * **Data structure behavior:**
   * - Add message: New message appended to array end `[...messages, newMessage]`
   * - Get message: Retrieve last element `array.at(-1)`
   * - Remove message: Remove last element `array.slice(0, -1)`
   *
   * **Example flow:**
   * 1. Add A: `[A]`
   * 2. Add B: `[A, B]`
   * 3. Add C: `[A, B, C]`
   * 4. Send: Take C (last added), remaining `[A, B]`
   * 5. Send: Take B, remaining `[A]`
   * 6. Send: Take A (first added), remaining `[]`
   *
   * **Use cases:**
   * - Newest messages sent first (recently added sent first)
   * - Suitable for scenarios needing undo/edit of recent input
   * - Similar to text editor Undo stack
   *
   * @example
   * ```typescript
   * const store = new ChatMessageStore();
   * store.draftMode = DraftMode.STACK;
   *
   * // Add drafts
   * store.addDraftMessage({ content: 'A' });
   * store.addDraftMessage({ content: 'B' });
   * store.addDraftMessage({ content: 'C' });
   *
   * // Send: Will send C, then B, then A
   * const first = store.getFirstDraftMessage(); // Returns C
   * ```
   */
  STACK: 'stack',

  /**
   * QUEUE mode (First In First Out - FIFO)
   *
   * **Data structure behavior:**
   * - Add message: New message appended to array end `[...messages, newMessage]`
   * - Get message: Retrieve first element `array.at(0)`
   * - Remove message: Remove first element `array.slice(1)`
   *
   * **Example flow:**
   * 1. Add A: `[A]`
   * 2. Add B: `[A, B]`
   * 3. Add C: `[A, B, C]`
   * 4. Send: Take A (first added), remaining `[B, C]`
   * 5. Send: Take B, remaining `[C]`
   * 6. Send: Take C (last added), remaining `[]`
   *
   * **Use cases:**
   * - Oldest messages sent first (first added sent first)
   * - Suitable for sequential message processing
   * - Maintains input order for sending
   *
   * @example
   * ```typescript
   * const store = new ChatMessageStore();
   * store.draftMode = DraftMode.QUEUE; // Default
   *
   * // Add drafts
   * store.addDraftMessage({ content: 'A' });
   * store.addDraftMessage({ content: 'B' });
   * store.addDraftMessage({ content: 'C' });
   *
   * // Send: Will send A, then B, then C
   * const first = store.getFirstDraftMessage(); // Returns A
   * ```
   */
  QUEUE: 'queue'
});

/**
 * Type representing valid draft modes
 */
export type DraftModeType = (typeof DraftMode)[keyof typeof DraftMode];

/**
 * Create default chat message store state
 *
 * Factory function providing initial state for chat message store with
 * empty message and draft arrays, and sending enabled by default.
 *
 * @template T - Type of message content
 * @returns Initial chat message store state
 */
function createChatMessageState<T>(): ChatMessageStoreStateInterface<T> {
  return {
    messages: [],
    draftMessages: [],
    disabledSend: false
  };
}

/**
 * Chat message store implementation with draft management
 *
 * Extends the base message store with chat-specific features including
 * draft message management with configurable STACK/QUEUE modes, ready-to-send
 * validation, and chat message type support.
 *
 * Core features:
 * - Draft message CRUD operations
 * - Configurable draft processing mode (STACK/QUEUE)
 * - Send readiness validation
 * - Chat message instance support
 *
 * @template T - Type of message content
 *
 * @example Basic usage
 * ```typescript
 * const store = new ChatMessageStore<string>();
 *
 * // Add draft
 * store.addDraftMessage({ content: 'Hello' });
 *
 * // Get first draft
 * const draft = store.getFirstDraftMessage();
 *
 * // Send when ready
 * if (draft) {
 *   const ready = store.getReadySendMessage(draft);
 *   if (ready) await send(ready);
 * }
 * ```
 *
 * @example With STACK mode
 * ```typescript
 * class MyStore extends ChatMessageStore {
 *   protected draftMode = DraftMode.STACK;
 * }
 *
 * const store = new MyStore();
 * // Now newest drafts are sent first
 * ```
 */
export class ChatMessageStore<T = unknown>
  extends MessagesStore<ChatMessage<T>, ChatMessageStoreStateInterface<T>>
  implements ChatMessageStoreInterface<T>
{
  /**
   * Draft message processing mode
   *
   * Controls whether drafts are processed in LIFO (STACK) or FIFO (QUEUE) order.
   * Can be overridden in subclasses to change the default behavior.
   *
   * @default `DraftMode.QUEUE` - Uses queue mode (first in, first out)
   *
   * @example Override in subclass
   * ```typescript
   * class MyStore extends ChatMessageStore {
   *   protected draftMode = DraftMode.STACK;
   * }
   * ```
   */
  protected draftMode: DraftModeType = DraftMode.QUEUE;

  /**
   * Create a new chat message store
   *
   * @param initialState - Factory function providing initial state,
   *   defaults to `createChatMessageState`
   *
   * @example
   * ```typescript
   * const store = new ChatMessageStore();
   * ```
   *
   * @example With custom initial state
   * ```typescript
   * const store = new ChatMessageStore(() => ({
   *   messages: [existingMessage],
   *   draftMessages: [],
   *   disabledSend: false
   * }));
   * ```
   */
  constructor(
    initialState: () => ChatMessageStoreStateInterface<T> = createChatMessageState
  ) {
    super(initialState);
  }

  /**
   * Create a ChatMessage instance from partial data
   *
   * Overrides the base implementation to ensure messages are created
   * as ChatMessage class instances with proper prototype chain.
   *
   * @template M - Specific ChatMessage type
   *
   * @param message - Partial message specification
   * @returns ChatMessage instance
   */
  override createMessage<M extends ChatMessage<T>>(
    message: Partial<M> = {} as Partial<M>
  ): M {
    return new ChatMessage<T>(super.createMessage(message)) as M;
  }

  /**
   * Type guard to check if a value is a ChatMessage instance
   *
   * @template M - Specific ChatMessage type
   *
   * @param message - Value to check
   * @returns `true` if value is a ChatMessage instance, `false` otherwise
   */
  override isMessage<M extends ChatMessage<T>>(message: unknown): message is M {
    return message instanceof ChatMessage;
  }

  /**
   * Remove the first draft message based on configured mode
   *
   * Returns the remaining draft messages after removing the first one.
   * Which message is "first" depends on the draft mode.
   *
   * @returns Array of remaining draft messages after removal
   *
   * **Mode behavior:**
   * - STACK mode (LIFO): `[A, B, C]` → `[A, B]` (removes last: C)
   * - QUEUE mode (FIFO): `[A, B, C]` → `[B, C]` (removes first: A)
   *
   * @example
   * ```typescript
   * // With QUEUE mode
   * store.addDraftMessage({ content: 'A' });
   * store.addDraftMessage({ content: 'B' });
   * const remaining = store.sliceDraftMessages(); // [B]
   * ```
   */
  protected sliceDraftMessages(): ChatMessage<T>[] {
    if (this.draftMode === DraftMode.QUEUE) {
      // QUEUE mode: Remove first element (earliest added)
      return this.getDraftMessages().slice(1);
    }

    // STACK mode: Remove last element (most recently added)
    return this.getDraftMessages().slice(0, -1);
  }

  /**
   * Get the first draft message based on configured mode
   *
   * Returns the draft message that should be processed/sent first
   * according to the configured draft mode. This is the logical "first"
   * message, not necessarily the array's first element.
   *
   * @returns First draft message to process, or `null` if none exists
   *
   * **Mode behavior:**
   * - STACK mode (LIFO): `[A, B, C]` → returns C (last, newest, sent first)
   * - QUEUE mode (FIFO): `[A, B, C]` → returns A (first, oldest, sent first)
   *
   * **Note:** "First" refers to the message that should be prioritized,
   * not its position in the array.
   *
   * @example With QUEUE mode (default)
   * ```typescript
   * store.addDraftMessage({ content: 'A' });
   * store.addDraftMessage({ content: 'B' });
   * store.addDraftMessage({ content: 'C' });
   *
   * const first = store.getFirstDraftMessage();
   * console.log(first.content); // "A" - oldest is first
   * ```
   *
   * @example With STACK mode
   * ```typescript
   * class MyStore extends ChatMessageStore {
   *   protected draftMode = DraftMode.STACK;
   * }
   *
   * const store = new MyStore();
   * store.addDraftMessage({ content: 'A' });
   * store.addDraftMessage({ content: 'B' });
   * store.addDraftMessage({ content: 'C' });
   *
   * const first = store.getFirstDraftMessage();
   * console.log(first.content); // "C" - newest is first
   * ```
   */
  getFirstDraftMessage(): ChatMessage<T> | null {
    if (this.draftMode === DraftMode.STACK) {
      // STACK mode: Get last element (newest)
      return this.getDraftMessages().at(-1) || null;
    }

    // QUEUE mode: Get first element (oldest)
    return this.getDraftMessages().at(0) || null;
  }

  /**
   * Get and remove the first draft message based on mode
   *
   * Similar to `Array.shift()`, but which message is removed depends on
   * the configured draft mode. This is the atomic operation that both
   * retrieves and removes the draft in a single transaction.
   *
   * @returns Removed draft message, or `null` if no drafts exist
   *
   * **Behavior examples:**
   *
   * STACK mode (LIFO):
   * - Before: `[A, B, C]`
   * - After: `[A, B]`
   * - Returns: C (newest added)
   *
   * QUEUE mode (FIFO):
   * - Before: `[A, B, C]`
   * - After: `[B, C]`
   * - Returns: A (oldest added)
   *
   * **Mode differences:**
   * - STACK: Removes and returns newest message (last in, first out)
   * - QUEUE: Removes and returns oldest message (first in, first out)
   * - Ensures "get" and "delete" operate on the same message (critical for bug prevention)
   *
   * @example With QUEUE mode
   * ```typescript
   * store.addDraftMessage({ content: 'A' });
   * store.addDraftMessage({ content: 'B' });
   *
   * const draft = store.shiftFirstDraftMessage();
   * console.log(draft.content); // "A"
   * // Remaining drafts: [B]
   * ```
   *
   * @example With STACK mode
   * ```typescript
   * class MyStore extends ChatMessageStore {
   *   protected draftMode = DraftMode.STACK;
   * }
   *
   * const store = new MyStore();
   * store.addDraftMessage({ content: 'A' });
   * store.addDraftMessage({ content: 'B' });
   *
   * const draft = store.shiftFirstDraftMessage();
   * console.log(draft.content); // "B"
   * // Remaining drafts: [A]
   * ```
   */
  shiftFirstDraftMessage(): ChatMessage<T> | null {
    const draftMessages = this.getDraftMessages();

    if (draftMessages.length === 0) {
      return null;
    }

    const firstDraft = this.getFirstDraftMessage();
    const newDraftMessages = this.sliceDraftMessages();

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );

    return firstDraft;
  }

  /**
   * Get all draft messages
   *
   * @returns Array of all draft messages in the store
   */
  getDraftMessages(): ChatMessage<T>[] {
    return this.state.draftMessages ?? [];
  }

  /**
   * Add a new draft message
   *
   * Creates and adds a draft message to the store. The message is automatically
   * set to `DRAFT` status regardless of the provided status value.
   *
   * @param message - Partial message content (will be auto-completed with defaults)
   *
   * **Behavior for both modes:**
   *
   * STACK mode (append to end, last in first out):
   * - Before: `[A, B]`
   * - Add C: `[A, B, C]`
   * - Add D: `[A, B, C, D]`
   * - Send order: D → C → B → A (newest sent first)
   *
   * QUEUE mode (append to end, first in first out):
   * - Before: `[A, B]`
   * - Add C: `[A, B, C]`
   * - Add D: `[A, B, C, D]`
   * - Send order: A → B → C → D (oldest sent first)
   *
   * **Mode comparison:**
   * - STACK: New messages append to end, retrieved from end (LIFO)
   * - QUEUE: New messages append to end, retrieved from start (FIFO)
   *
   * **Note:**
   * - Automatically sets message status to `MessageStatus.DRAFT`
   * - Both modes add the same way, difference is in retrieval order
   *
   * @example
   * ```typescript
   * store.addDraftMessage({
   *   content: 'Hello, world!',
   *   metadata: { priority: 'high' }
   * });
   * ```
   */
  addDraftMessage(message: Partial<ChatMessage<T>>): void {
    const draftMessage = this.createMessage(message);

    if (draftMessage.status !== MessageStatus.DRAFT) {
      Object.assign(draftMessage, { status: MessageStatus.DRAFT });
    }

    // Both modes append to the end
    const newDraftMessages = [...this.getDraftMessages(), draftMessage];

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );
  }

  /**
   * Delete a draft message by ID
   *
   * Removes the specified draft message from the store. Does nothing
   * if no message with the given ID exists.
   *
   * @param messageId - Unique identifier of the draft message to delete
   *
   * @example
   * ```typescript
   * store.deleteDraftMessage('draft-123');
   * ```
   */
  deleteDraftMessage(messageId: string): void {
    const draftMessages = this.getDraftMessages();
    const newDraftMessages = draftMessages.filter(
      (msg) => msg.id !== messageId
    );

    // If array length unchanged, message was not found
    if (newDraftMessages.length === draftMessages.length) {
      return;
    }

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );
  }

  /**
   * Update a draft message by ID
   *
   * Applies partial updates to a draft message identified by ID.
   * Uses a single traversal to find and update the message efficiently.
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
  ): ChatMessage<T> | undefined {
    let updatedMessage: ChatMessage<T> | undefined;
    const draftMessages = this.getDraftMessages();

    // Use map for single traversal to find and update
    const newDraftMessages = draftMessages.map((msg) => {
      if (msg.id === messageId) {
        updatedMessage = this.mergeMessage(msg, updates);
        return updatedMessage;
      }
      return msg;
    });

    // If no matching message found, return early
    if (!updatedMessage) {
      return;
    }

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );

    return updatedMessage;
  }

  /**
   * Reset draft messages list
   *
   * Replaces all draft messages with the provided list, or clears all
   * drafts if no messages are provided.
   *
   * @param messages - New draft message list, or omit to clear all drafts
   *
   * @example Clear drafts
   * ```typescript
   * store.resetDraftMessages();
   * ```
   *
   * @example Replace with new drafts
   * ```typescript
   * store.resetDraftMessages([draft1, draft2]);
   * ```
   */
  resetDraftMessages(messages?: ChatMessage<T>[]): void {
    const newDraftMessages = messages
      ? messages.map((msg) => this.createMessage(msg))
      : [];

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );
  }

  /**
   * Change the send disabled state
   *
   * Controls whether message sending is enabled or disabled globally.
   * When disabled, the UI should prevent users from sending messages.
   *
   * @param disabled - `true` to disable sending, `false` to enable
   *
   * @example
   * ```typescript
   * // Disable sending during validation
   * store.changeDisabledSend(true);
   *
   * // Re-enable after validation
   * store.changeDisabledSend(false);
   * ```
   */
  changeDisabledSend(disabled: boolean): void {
    this.emit(this.cloneState({ disabledSend: disabled }));
  }

  /**
   * Get a draft message by ID
   *
   * Retrieves a specific draft message from the draft message list.
   *
   * @param messageId - Unique identifier of the draft message
   * @returns Draft message or `null` if not found
   *
   * @example
   * ```typescript
   * const draft = store.getDarftMessageById('draft-123');
   * if (draft) {
   *   console.log(draft.content);
   * }
   * ```
   */
  getDarftMessageById(messageId: string): ChatMessage<T> | null {
    return this.getDraftMessages().find((msg) => msg.id === messageId) || null;
  }

  /**
   * Get the message ready to be sent
   *
   * Determines which message should be sent next. Follows this priority:
   * 1. If a specific message is provided and exists as a draft, use it
   * 2. If the message exists in sent history, use it
   * 3. Otherwise, shift the first draft message from the queue/stack
   *
   * @param message - Optional specific message to validate for sending
   * @returns Message ready to send, or `null` if none available
   *
   * @example Auto-send next draft
   * ```typescript
   * const message = store.getReadySendMessage();
   * if (message) {
   *   await gateway.send(message);
   * }
   * ```
   *
   * @example Validate specific message
   * ```typescript
   * const message = store.createMessage({ content: 'Hello' });
   * const ready = store.getReadySendMessage(message);
   * if (ready) {
   *   await gateway.send(ready);
   * }
   * ```
   */
  getReadySendMessage(message?: ChatMessage<T>): ChatMessage<T> | null {
    let targetMessage: ChatMessage<T> | null = null;

    if (this.isMessage(message) && message.id) {
      targetMessage = this.getDarftMessageById(message.id);

      if (!targetMessage) {
        targetMessage = this.getMessageById(message.id)!;
      }
    }

    if (!targetMessage) {
      targetMessage = this.shiftFirstDraftMessage();
    }

    return targetMessage;
  }
}
