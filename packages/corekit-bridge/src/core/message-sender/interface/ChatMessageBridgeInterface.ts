import { ExecutorPlugin } from '@qlover/fe-corekit';
import { MessageSenderContextOptions } from '../impl/MessageSenderExecutor';
import { ChatMessage } from '../impl/ChatMessage';
import { ChatMessageStoreInterface } from './ChatMessageStoreInterface';
import { GatewayOptions } from './MessageGetwayInterface';

/**
 * Input reference interface for managing input element references and focus control
 *
 * This interface provides methods to control input elements in the chat message UI,
 * allowing components to set references and manage focus programmatically.
 */
export interface InputRefInterface {
  /**
   * Set the input element reference
   *
   * @param ref - Input element reference to be stored and managed
   *
   * @example
   * ```typescript
   * const inputRef = useRef<HTMLInputElement>(null);
   * bridge.setRef(inputRef.current);
   * ```
   */
  setRef(ref: unknown): void;

  /**
   * Focus on the input element
   *
   * Programmatically sets focus to the input element, useful for
   * improving user experience after actions like sending a message.
   *
   * @example
   * ```typescript
   * // Focus input after sending a message
   * await bridge.send(message);
   * bridge.focus();
   * ```
   */
  focus(): void;
}

/**
 * Plugin type for chat message bridge executor
 *
 * Allows extending the message sender functionality with custom plugins
 * that can intercept and modify the message sending process.
 *
 * @template T - Type of message content
 *
 * @example
 * ```typescript
 * const logPlugin: ChatMessageBridgePlugin<string> = {
 *   name: 'logger',
 *   execute: async (context, next) => {
 *     console.log('Sending message:', context.message);
 *     return next();
 *   }
 * };
 * ```
 */
export type ChatMessageBridgePlugin<T = unknown> = ExecutorPlugin<
  MessageSenderContextOptions<ChatMessage<T>>
>;

/**
 * Parameters for determining if sending messages should be disabled
 *
 * @template T - Type of message content
 */
export type DisabledSendParams<T = unknown> = {
  /**
   * First draft message in the message list
   *
   * The most recent unsent draft message that user is currently editing
   */
  firstDraft: ChatMessage<T> | null;

  /**
   * Currently sending message
   *
   * The message that is currently being sent to the server
   */
  sendingMessage: ChatMessage<T> | null;

  /**
   * Whether sending should be disabled
   *
   * Manual override flag to disable sending functionality
   */
  disabledSend: boolean;
};

/**
 * Chat message bridge interface for managing chat message operations
 *
 * This interface provides a comprehensive set of methods for handling chat message
 * functionality including sending, storing, drafting, and controlling message state.
 * It serves as the main bridge between UI components and message handling logic.
 *
 * Core features:
 * - Message sending with optional gateway options
 * - Draft message management
 * - Send state control and monitoring
 * - Input element reference management
 * - Plugin-based extensibility
 *
 * @template T - Type of message content, defaults to `string`
 *
 * @example Basic usage
 * ```typescript
 * const bridge: ChatMessageBridgeInterface<string> = createBridge();
 *
 * // Set input reference
 * bridge.setRef(inputElement);
 *
 * // Change content
 * bridge.onChangeContent('Hello, world!');
 *
 * // Send message
 * await bridge.send();
 * ```
 *
 * @example With custom content type
 * ```typescript
 * interface RichContent {
 *   text: string;
 *   attachments: File[];
 * }
 *
 * const bridge: ChatMessageBridgeInterface<RichContent> = createBridge();
 * bridge.onChangeContent({
 *   text: 'Check these files',
 *   attachments: [file1, file2]
 * });
 * ```
 */
export interface ChatMessageBridgeInterface<T = string>
  extends InputRefInterface {
  /**
   * Get the message store instance
   *
   * Returns a more specific `ChatMessageStoreInterface` type for managing
   * chat messages, providing access to message persistence and state management.
   *
   * @returns Chat message store instance
   *
   * @example
   * ```typescript
   * const store = bridge.getMessageStore();
   * const allMessages = store.getMessages();
   * ```
   */
  getMessageStore(): ChatMessageStoreInterface<T>;

  /**
   * Register message sender plugin(s)
   *
   * Allows extending the message sender functionality with custom plugins
   * that can intercept, modify, or enhance the message sending process.
   * Multiple plugins can be registered at once.
   *
   * @param plugin - Single plugin or array of plugins to register
   * @returns Current bridge instance for method chaining
   *
   * @example Single plugin
   * ```typescript
   * bridge.use({
   *   name: 'logger',
   *   execute: async (context, next) => {
   *     console.log('Message:', context.message);
   *     return next();
   *   }
   * });
   * ```
   *
   * @example Multiple plugins
   * ```typescript
   * bridge.use([loggerPlugin, validatorPlugin, transformerPlugin]);
   * ```
   */
  use(plugin: ChatMessageBridgePlugin<T> | ChatMessageBridgePlugin<T>[]): this;

  /**
   * Update the input content
   *
   * Triggers content change in the input field. To get the latest draft message
   * from the UI, use `getFirstDraftMessage()` method instead.
   *
   * @param content - New content to set in the input field
   *
   * @example
   * ```typescript
   * // Update text content
   * bridge.onChangeContent('New message text');
   *
   * // Update with rich content
   * bridge.onChangeContent({
   *   text: 'Hello',
   *   mentions: ['@user1']
   * });
   * ```
   */
  onChangeContent(content: T): void;

  /**
   * Get the first draft message from the message list
   *
   * Retrieves the most recent draft message from the UI layer. This method
   * should get the latest draft message displayed in the UI to avoid stale
   * data from the store.
   *
   * @param draftMessages - Optional draft message list from UI layer
   *   (recommended to get from UI to avoid direct store access).
   *   If not provided, defaults to fetching all messages from store.
   * @returns First draft message or `null` if none exists
   *
   * @example
   * ```typescript
   * // Get first draft from UI layer
   * const draft = bridge.getFirstDraftMessage(uiDraftMessages);
   * if (draft) {
   *   console.log('Current draft:', draft.content);
   * }
   * ```
   */
  getFirstDraftMessage(draftMessages?: ChatMessage<T>[]): ChatMessage<T> | null;

  /**
   * Send user message to the server
   *
   * Sends a chat message through the configured gateway. If no message is provided,
   * uses the current draft message. Gateway options can be provided for advanced
   * features like streaming responses.
   *
   * Behavior:
   * - Without `message` parameter: sends the current draft message
   * - With `gatewayOptions`: enables streaming mode for real-time responses
   *
   * @param message - Optional message to send. If not provided, uses current draft
   * @param gatewayOptions - Optional gateway configuration for streaming and other features
   * @returns Promise resolving to the sent message
   *
   * @throws {Error} When no draft message exists and no message is provided
   * @throws {Error} When sending fails due to network or validation issues
   *
   * @example Basic send
   * ```typescript
   * // Send current draft
   * const sentMessage = await bridge.send();
   * ```
   *
   * @example Send specific message
   * ```typescript
   * const message = new ChatMessage({ content: 'Hello' });
   * await bridge.send(message);
   * ```
   *
   * @example With streaming
   * ```typescript
   * await bridge.send(message, {
   *   stream: true,
   *   onChunk: (chunk) => console.log('Received:', chunk)
   * });
   * ```
   */
  send(
    message?: ChatMessage<T>,
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>>;

  /**
   * Get the currently sending message
   *
   * Retrieves the message that is currently being sent to the server.
   * Useful for displaying loading states or preventing duplicate sends.
   *
   * @param messages - Optional message list from UI layer
   *   (recommended to get from UI to avoid direct store access).
   *   If not provided, defaults to fetching all messages from store.
   * @returns Currently sending message or `null` if none
   *
   * @example
   * ```typescript
   * const sending = bridge.getSendingMessage(uiMessages);
   * if (sending) {
   *   console.log('Sending in progress:', sending.id);
   * }
   * ```
   */
  getSendingMessage(messages?: ChatMessage<T>[]): ChatMessage<T> | null;

  /**
   * Determine if message sending should be disabled
   *
   * Checks various conditions to determine if the send button should be disabled,
   * including draft message state, ongoing send operations, and manual overrides.
   *
   * @param params - Optional parameters for checking disabled state
   * @returns `true` if sending should be disabled, `false` otherwise
   *
   * @example
   * ```typescript
   * const isDisabled = bridge.getDisabledSend({
   *   firstDraft: currentDraft,
   *   sendingMessage: activeSend,
   *   disabledSend: false
   * });
   *
   * // Use in UI
   * <button disabled={isDisabled}>Send</button>
   * ```
   */
  getDisabledSend(params?: DisabledSendParams<T>): boolean;

  /**
   * Stop sending a message
   *
   * Cancels an ongoing message send operation. Useful for streaming responses
   * that users want to interrupt or for handling timeout scenarios.
   *
   * @param messageId - Optional ID of the message to stop sending.
   *   If not provided, stops the current sending message.
   * @returns `true` if stop was successful, `false` otherwise
   *
   * @example Stop current send
   * ```typescript
   * const stopped = bridge.stop();
   * if (stopped) {
   *   console.log('Send operation cancelled');
   * }
   * ```
   *
   * @example Stop specific message
   * ```typescript
   * bridge.stop('message-id-123');
   * ```
   */
  stop(messageId?: string): boolean;
}
