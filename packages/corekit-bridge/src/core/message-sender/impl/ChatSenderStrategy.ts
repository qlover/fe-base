import { ChatMessageRole, type ChatMessage } from './ChatMessage';
import { SenderStrategyPlugin } from './SenderStrategyPlugin';
import type { ChatMessageStore } from './ChatMessageStore';
import type { MessageSenderContext } from './MessageSenderExecutor';

/**
 * Chat-specific sender strategy plugin
 *
 * Extends the base sender strategy with chat-specific behaviors including
 * message retry logic, assistant response handling, and conversation history
 * management. Ensures proper message ordering and state in chat conversations.
 *
 * Core features:
 * - Retry logic with history cleanup
 * - Assistant message detection and management
 * - Conversation history truncation
 * - Message replacement for re-generation
 *
 * @example
 * ```typescript
 * const strategy = new ChatSenderStrategy(
 *   SendFailureStrategy.KEEP_FAILED,
 *   logger
 * );
 *
 * messageSender.use(strategy);
 * ```
 */
export class ChatSenderStrategy extends SenderStrategyPlugin {
  /**
   * Slice messages to keep only up to the specified index
   *
   * Removes all messages after the message at the given index, effectively
   * truncating the conversation history. Useful for cleaning up after retries
   * or when regenerating responses.
   *
   * @param store - Chat message store instance
   * @param index - Index of the message to keep (inclusive)
   *
   * @example
   * ```typescript
   * // Messages: [user1, assistant1, user2, assistant2]
   * // Keep only up to index 1 (assistant1)
   * strategy.sliceMessages(store, 1);
   * // Result: [user1, assistant1]
   * ```
   */
  sliceMessages(store: ChatMessageStore<string>, index: number): void {
    // Delete all messages after nextMessage
    const allMessages = store.getMessages();
    const nextMessageIndex = index + 1;
    // Keep all messages from start to nextMessage (inclusive)
    const newMessages = allMessages.slice(0, nextMessageIndex + 1);
    store.resetMessages(newMessages);
  }

  /**
   * Check if a message is an assistant message
   *
   * Validates that the message is a valid message instance and has
   * the ASSISTANT role, indicating it's a response from the AI assistant.
   *
   * @param store - Chat message store instance
   * @param message - Message to check
   * @returns `true` if message is an assistant message, `false` otherwise
   *
   * @example
   * ```typescript
   * const isAssistant = strategy.isAssistantMessage(store, message);
   * if (isAssistant) {
   *   console.log('This is an assistant response');
   * }
   * ```
   */
  isAssistantMessage(
    store: ChatMessageStore<string>,
    message: ChatMessage<string>
  ): boolean {
    return (
      store.isMessage(message) && message.role === ChatMessageRole.ASSISTANT
    );
  }

  /**
   * Handle message before sending for KEEP_FAILED strategy
   *
   * Extends base implementation with retry logic. If the message already
   * exists in the store, this is a retry operation, so all messages after
   * it (including previous assistant responses) are removed to prepare for
   * a fresh response.
   *
   * **Retry logic:**
   * If message found in store:
   * 1. Identify this as a retry operation
   * 2. Remove all messages after the retry message
   * 3. Clear previous assistant responses
   *
   * @param parameters - Message sender context parameters
   * @returns Added message from the store
   *
   * @example Retry scenario
   * ```typescript
   * // Initial state: [user1, assistant1, user2, assistant2-failed]
   * // Retry user2:
   * // - Find user2 at index 2
   * // - Remove assistant2-failed (index 3)
   * // - Result: [user1, assistant1, user2]
   * // - Ready to get new assistant response
   * ```
   */
  protected override handleBefore_KEEP_FAILED(
    parameters: MessageSenderContext<ChatMessage<string>>
  ): ChatMessage<string> {
    const store = parameters.store as ChatMessageStore<string>;
    const { currentMessage } = parameters;

    // 🔧 Retry logic: If message already in list, clear all messages after it
    if (currentMessage.id) {
      const messageIndex = store.getMessageIndex(currentMessage.id);
      if (messageIndex !== -1) {
        // Message found, this is a retry operation
        // Delete all messages after this one (including previous assistant response)
        const allMessages = store.getMessages();
        const messagesToRemove = allMessages.slice(messageIndex + 1);
        messagesToRemove.forEach((msg) => {
          if (msg.id) {
            store.deleteMessage(msg.id);
          }
        });
      }
    }

    const result = super.handleBefore_KEEP_FAILED(parameters);

    return result as ChatMessage<string>;
  }

  /**
   * Handle successful send for KEEP_FAILED strategy
   *
   * Extends base implementation to handle assistant response messages.
   * If the success data contains an assistant message result, it manages
   * the assistant response in the conversation history.
   *
   * **Assistant response handling:**
   * - If next message is ASSISTANT: Replace it with new response and truncate
   * - If no next message: Add new assistant response to history
   * - If next message is not ASSISTANT: No action (preserves user messages)
   *
   * This ensures proper conversation flow and prevents duplicate or outdated
   * assistant responses in the history.
   *
   * @param parameters - Message sender context parameters
   * @param successData - Success response data
   * @returns Updated message or `undefined` if update failed
   *
   * @example Normal flow
   * ```typescript
   * // State: [user1, assistant1, user2]
   * // Success with assistant2 result
   * // Action: Add assistant2
   * // Result: [user1, assistant1, user2, assistant2]
   * ```
   *
   * @example Regenerate flow
   * ```typescript
   * // State: [user1, assistant1, user2, assistant2-old]
   * // Success with assistant2-new result
   * // Action: Replace assistant2-old with assistant2-new, truncate after
   * // Result: [user1, assistant1, user2, assistant2-new]
   * ```
   */
  protected override handleSuccess_KEEP_FAILED(
    parameters: MessageSenderContext<ChatMessage<string>>,
    successData: ChatMessage<string>
  ): ChatMessage<string> | undefined {
    const store = parameters.store as ChatMessageStore<string>;

    const updatedMessage = super.handleSuccess_KEEP_FAILED(
      parameters,
      successData
    );

    // If chatMessage has result, update the currentMessage
    const resultData = successData.result as ChatMessage<string>;
    if (this.isAssistantMessage(store, resultData)) {
      // Find successData's index in the list
      const currentIndex = store.getMessageIndex(successData.id!);

      if (currentIndex !== -1) {
        const nextMessage = store.getMessageByIndex(currentIndex + 1);

        // If next message exists and is ASSISTANT, replace it
        if (nextMessage && this.isAssistantMessage(store, nextMessage)) {
          store.updateMessage(nextMessage.id!, resultData);
          this.sliceMessages(store, currentIndex);
        }
        // If no next message (successData is last), add new message
        else if (!nextMessage) {
          store.addMessage(resultData);
        }
        // If next message exists but is not ASSISTANT, do nothing
      }
    }

    return updatedMessage as ChatMessage<string>;
  }
}
