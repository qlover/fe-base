import type { MessageStatusType, MessageStoreMsg } from './MessageStore';

/**
 * Chat message role constants
 *
 * Defines the three standard roles in a chat conversation:
 * - USER: Messages sent by the end user
 * - SYSTEM: System-level messages (instructions, metadata)
 * - ASSISTANT: Messages from the AI assistant or bot
 */
export const ChatMessageRole = {
  /** User role for messages sent by the end user */
  USER: 'user',
  /** System role for system-level messages and instructions */
  SYSTEM: 'system',
  /** Assistant role for messages from AI assistant or bot */
  ASSISTANT: 'assistant'
} as const;

/**
 * Type representing valid chat message roles
 */
export type ChatMessageRoleType =
  (typeof ChatMessageRole)[keyof typeof ChatMessageRole];

/**
 * Chat message implementation class
 *
 * Represents a single message in a chat conversation, extending the base
 * message store interface with chat-specific properties like role, files,
 * and async state management.
 *
 * Core features:
 * - Role-based message typing (user/system/assistant)
 * - Async state tracking (loading, result, error)
 * - Timing information (start/end timestamps)
 * - File attachment support
 * - Placeholder and status management
 *
 * @template T - Type of message content, defaults to `unknown`
 * @template R - Type of message result, defaults to `unknown`
 *
 * @example Basic user message
 * ```typescript
 * const userMessage = new ChatMessage({
 *   id: 'msg-001',
 *   content: 'Hello, how are you?',
 *   role: ChatMessageRole.USER
 * });
 * ```
 *
 * @example Assistant message with loading state
 * ```typescript
 * const assistantMessage = new ChatMessage({
 *   id: 'msg-002',
 *   content: 'I am doing well, thank you!',
 *   role: ChatMessageRole.ASSISTANT,
 *   loading: false,
 *   result: { tokens: 10, model: 'gpt-4' }
 * });
 * ```
 *
 * @example Message with file attachments
 * ```typescript
 * const messageWithFiles = new ChatMessage({
 *   content: 'Here are the documents',
 *   files: [file1, file2],
 *   role: ChatMessageRole.USER
 * });
 * ```
 */
export class ChatMessage<T = unknown, R = unknown>
  implements MessageStoreMsg<T, R>
{
  /**
   * Unique message identifier
   *
   * Optional during creation, typically assigned by the server
   * or generated client-side for tracking purposes.
   */
  public readonly id?: string;

  /**
   * Message content
   *
   * The main payload of the message. Type is generic to support
   * various content formats (string, rich text, structured data).
   */
  public readonly content?: T;

  /**
   * Whether the message is currently loading
   *
   * Indicates if the message is being processed, sent, or waiting
   * for a response. Useful for showing loading indicators in the UI.
   *
   * @default `false`
   */
  public readonly loading: boolean = false;

  /**
   * Result data from message processing
   *
   * Contains the result of message processing, such as API response
   * metadata, token counts, or other computation results.
   *
   * @default `null`
   */
  public readonly result: R | null = null;

  /**
   * Error information if message processing failed
   *
   * Contains error details if the message failed to send or process.
   * `null` indicates no error occurred.
   *
   * @default `null`
   */
  public readonly error: unknown = null;

  /**
   * Message creation timestamp
   *
   * Unix timestamp (milliseconds) when the message was created.
   * Used for message ordering and duration calculations.
   *
   * @default `Date.now()`
   */
  public readonly startTime: number = Date.now();

  /**
   * Message completion timestamp
   *
   * Unix timestamp (milliseconds) when the message processing completed.
   * A value of `0` indicates the message is still in progress.
   *
   * @default `0`
   */
  public readonly endTime: number = 0;

  /**
   * Placeholder text for the message
   *
   * Optional placeholder text to display while the actual content
   * is loading or being generated. Commonly used for streaming responses.
   */
  public readonly placeholder?: string;

  /**
   * File attachments associated with the message
   *
   * Array of `File` objects attached to the message, such as images,
   * documents, or other media files.
   */
  public readonly files?: File[];

  /**
   * Current status of the message
   *
   * Indicates the processing state of the message (e.g., draft, sending,
   * sent, failed). The specific statuses are defined by `MessageStatusType`.
   */
  public readonly status?: MessageStatusType;

  /**
   * Role of the message sender
   *
   * Identifies who created the message: user, system, or assistant.
   * Used for message rendering, styling, and conversation flow control.
   *
   * @default `ChatMessageRole.USER`
   */
  public readonly role: ChatMessageRoleType = ChatMessageRole.USER;

  /**
   * Create a new chat message instance
   *
   * @param options - Optional partial message properties to initialize the message
   *
   * @example Create with minimal properties
   * ```typescript
   * const message = new ChatMessage({
   *   content: 'Hello'
   * });
   * ```
   *
   * @example Create with full properties
   * ```typescript
   * const message = new ChatMessage({
   *   id: 'msg-123',
   *   content: 'Hello, world!',
   *   role: ChatMessageRole.USER,
   *   loading: false,
   *   startTime: Date.now(),
   *   files: [fileObject]
   * });
   * ```
   */
  constructor(options?: Partial<ChatMessage<T>>) {
    if (options) {
      Object.assign(this, options);
    }
  }
}
