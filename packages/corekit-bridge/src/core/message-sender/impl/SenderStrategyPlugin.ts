import {
  AbortPlugin,
  type ExecutorError,
  type ExecutorContext
} from '@qlover/fe-corekit';
import { MessageSenderBasePlugin } from './MessageSenderBasePlugin';
import {
  type MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from './MessageStore';
import { template } from './utils';
import type {
  MessageSenderContextOptions,
  MessageSenderPluginContext
} from './MessageSenderExecutor';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Send failure handling strategies
 *
 * Defines how failed messages should be handled in the message store,
 * allowing different behaviors based on application requirements.
 *
 * @example
 * ```typescript
 * // Use KEEP_FAILED for chat apps where users should see failures
 * const strategy = SendFailureStrategy.KEEP_FAILED;
 *
 * // Use DELETE_FAILED for clean message lists
 * const strategy = SendFailureStrategy.DELETE_FAILED;
 *
 * // Use ADD_ON_SUCCESS for optimistic UI without showing progress
 * const strategy = SendFailureStrategy.ADD_ON_SUCCESS;
 * ```
 */
export const SendFailureStrategy = Object.freeze({
  /**
   * Keep failed messages (default)
   *
   * Suitable for chat applications where users should see failure records
   * and be able to retry. Failed messages remain in the store with error state.
   */
  KEEP_FAILED: 'keep_failed',

  /**
   * Delete failed messages
   *
   * Keeps the message list clean by removing failed messages from the store.
   * Only successfully sent messages are displayed.
   */
  DELETE_FAILED: 'delete_failed',

  /**
   * Add messages only on success
   *
   * Delays adding messages to the store until after successful send.
   * Messages are not displayed during the sending process.
   */
  ADD_ON_SUCCESS: 'add_on_success'
});

/**
 * Type representing valid send failure strategies
 */
export type SendFailureStrategyType =
  (typeof SendFailureStrategy)[keyof typeof SendFailureStrategy];

/**
 * Message sender strategy plugin for managing message lifecycle
 *
 * Implements lifecycle hooks to control message addition, updates, and failure
 * handling based on the configured strategy. Manages message state transitions
 * during normal and streaming send operations.
 *
 * **Message Loading State Rules:**
 *
 * 1. Non-streaming mode (normal gateway):
 *    - Before result: `loading=true`, `status=sending`
 *    - After success: `loading=false`, `status=sent`
 *
 * 2. Streaming mode:
 *    - Before chunks: `loading=true`, `status=sending`, `streaming=true`
 *    - After completion: `loading=false`, `status=sent`, `streaming=false`
 *
 * Core features:
 * - Configurable failure handling strategies
 * - Automatic state management for messages
 * - Streaming connection and chunk handling
 * - Abort/stop operation support
 * - Cleanup and error recovery
 *
 * @example With KEEP_FAILED strategy
 * ```typescript
 * const plugin = new SenderStrategyPlugin(
 *   SendFailureStrategy.KEEP_FAILED,
 *   logger
 * );
 *
 * // Messages remain in store even on failure
 * // Users can see errors and retry
 * ```
 *
 * @example With DELETE_FAILED strategy
 * ```typescript
 * const plugin = new SenderStrategyPlugin(
 *   SendFailureStrategy.DELETE_FAILED
 * );
 *
 * // Failed messages are automatically removed
 * // Clean message list with only successful sends
 * ```
 *
 * @example With ADD_ON_SUCCESS strategy
 * ```typescript
 * const plugin = new SenderStrategyPlugin(
 *   SendFailureStrategy.ADD_ON_SUCCESS,
 *   logger
 * );
 *
 * // Messages only added to store after successful send
 * // No loading state visible to users
 * ```
 */
export class SenderStrategyPlugin<
  T extends MessageStoreMsg<unknown, unknown>
> extends MessageSenderBasePlugin<T> {
  /** Plugin identifier */
  public readonly pluginName = 'SenderStrategyPlugin';

  /**
   * Logger message templates
   *
   * Predefined templates for consistent logging throughout
   * the plugin's lifecycle.
   */
  protected loggerTpl = {
    stream: '[${pluginName}] onStream #${times} - chunk:',
    startStreaming: '[${pluginName}] startStreaming',
    endStreaming: '[${pluginName}] endStreaming'
  } as const;

  /**
   * Create a new sender strategy plugin
   *
   * @param failureStrategy - Strategy for handling failed message sends
   * @param logger - Optional logger instance for debugging and monitoring
   *
   * @example
   * ```typescript
   * const plugin = new SenderStrategyPlugin(
   *   SendFailureStrategy.KEEP_FAILED,
   *   new ConsoleLogger()
   * );
   * ```
   */
  constructor(
    protected failureStrategy: SendFailureStrategyType,
    protected logger?: LoggerInterface
  ) {
    super();
  }

  /**
   * Check if an error is an abort error
   *
   * Determines whether the given error is from an abort/cancel operation.
   * Abort errors are handled differently from regular errors.
   *
   * @param error - Error object to check
   * @returns `true` if error is an abort error, `false` otherwise
   *
   * @example
   * ```typescript
   * try {
   *   await sendMessage();
   * } catch (error) {
   *   if (this.isAbortError(error)) {
   *     console.log('Operation was cancelled');
   *   }
   * }
   * ```
   */
  protected isAbortError(error: unknown): boolean {
    return AbortPlugin.isAbortError(error);
  }

  /**
   * Handle message addition for KEEP_FAILED strategy before sending
   *
   * Adds the message to the store immediately before sending begins.
   * This allows users to see the message in loading state.
   *
   * @param parameters - Message sender context parameters
   * @returns Added message from the store
   */
  protected handleBefore_KEEP_FAILED(
    parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
  ): MessageStoreMsg<unknown, unknown> {
    const { currentMessage, store } = parameters;

    return store.addMessage(currentMessage);
  }

  /**
   * Clean up after message sending operation
   *
   * Stops streaming state and logs cleanup completion.
   * Called after success, error, or abort operations.
   *
   * @param context - Execution context containing message sender parameters
   */
  protected cleanup(context: MessageSenderPluginContext<T>): void {
    const { store } = context.parameters;
    store.stopStreaming();

    this.logger?.info(
      template(this.loggerTpl.endStreaming, {
        pluginName: this.pluginName
      })
    );
  }

  /**
   * Before execution hook
   *
   * Handles message initialization based on the configured failure strategy.
   * Determines whether to add the message to the store before or after sending.
   *
   * Strategy behavior:
   * - `ADD_ON_SUCCESS`: Message not added yet, wait for success
   * - `KEEP_FAILED` / `DELETE_FAILED`: Add message immediately for loading state
   *
   * @param context - Execution context containing message sender parameters
   */
  public onBefore(
    context: ExecutorContext<MessageSenderContextOptions<T>>
  ): void {
    switch (this.failureStrategy) {
      case SendFailureStrategy.ADD_ON_SUCCESS:
        this.closeAddedToStore(context);
        break;

      case SendFailureStrategy.KEEP_FAILED:
      case SendFailureStrategy.DELETE_FAILED:
      default:
        {
          const addedMessage = this.handleBefore_KEEP_FAILED(
            context.parameters
          );

          this.mergeRuntimeMessage(context, addedMessage as Partial<T>);
          this.openAddedToStore(context);
        }
        break;
    }
  }

  /**
   * Handle successful send for KEEP_FAILED strategy
   *
   * Updates the existing message in the store with success data.
   * Used when the message was added to store before sending.
   *
   * @param parameters - Message sender context parameters
   * @param successData - Success response data to merge into message
   * @returns Updated message from store, or `undefined` if update failed
   */
  protected handleSuccess_KEEP_FAILED(
    parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>,
    successData: MessageStoreMsg<unknown, unknown>
  ): MessageStoreMsg<unknown, unknown> | undefined {
    const { currentMessage, store } = parameters;

    const updatedMessage = store.updateMessage(
      currentMessage.id!,
      successData as Partial<MessageStoreMsg<unknown, unknown>>
    );

    return updatedMessage;
  }

  /**
   * Handle successful send for ADD_ON_SUCCESS strategy
   *
   * Adds the message to the store only after successful send.
   * Combines the current message with success data before adding.
   *
   * @param parameters - Message sender context parameters
   * @param successData - Success response data to merge into message
   * @returns Newly added message from store
   */
  protected handleSuccess_ADD_ON_SUCCESS(
    parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>,
    successData: MessageStoreMsg<unknown, unknown>
  ): MessageStoreMsg<unknown, unknown> {
    const { currentMessage, store } = parameters;

    const addedMessage = store.addMessage({
      ...currentMessage,
      ...successData
    });

    return addedMessage;
  }

  /**
   * Success execution hook
   *
   * Handles message updates after successful send operation.
   * Updates existing messages or adds new ones based on strategy.
   *
   * @param context - Execution context containing message sender parameters
   *
   * @throws {Error} When message update fails for already-added messages
   */
  public onSuccess(
    context: ExecutorContext<MessageSenderContextOptions<T>>
  ): void {
    const { addedToStore } = context.parameters;

    const successData = context.returnValue as MessageStoreMsg<
      unknown,
      unknown
    >;

    if (addedToStore) {
      const updatedMessage = this.handleSuccess_KEEP_FAILED(
        context.parameters,
        successData
      );

      if (!updatedMessage) {
        throw new Error('Failed to update message');
      }

      this.mergeRuntimeMessage(context, updatedMessage as Partial<T>);
      this.asyncReturnValue(context, updatedMessage);
    } else {
      const addedMessage = this.handleSuccess_ADD_ON_SUCCESS(
        context.parameters,
        successData
      );

      this.mergeRuntimeMessage(context, addedMessage as Partial<T>);
      this.asyncReturnValue(context, addedMessage);
    }

    this.cleanup(context);
  }

  /**
   * Handle abort/stop errors
   *
   * Special handling when a send operation is cancelled or stopped.
   * This prevents abort errors from propagating and ensures proper cleanup.
   *
   * Process:
   * 1. Set message status to `STOPPED`
   * 2. Call `onAborted` callback if provided
   * 3. Prevent error propagation to other plugins
   *
   * @param context - Execution context containing message sender parameters
   * @returns `undefined` to prevent error propagation
   *
   * @example
   * ```typescript
   * // When user cancels a message send
   * controller.abort();
   * // onStopError will handle the abort error
   * // Message status set to STOPPED
   * // onAborted callback invoked with final message state
   * ```
   */
  protected onStopError(
    context: ExecutorContext<MessageSenderContextOptions<T>>
  ): ExecutorError | void {
    const { currentMessage, store, addedToStore, gatewayOptions } =
      context.parameters;

    const stoppedData = {
      error: context.error,
      loading: false,
      status: MessageStatus.STOPPED,
      endTime: Date.now()
    } as Partial<T>;

    let finalMessage: MessageStoreMsg<unknown, unknown>;

    if (addedToStore && currentMessage.id) {
      const updated = store.updateMessage(currentMessage.id, stoppedData);
      finalMessage = updated || store.mergeMessage(currentMessage, stoppedData);
    } else {
      finalMessage = store.mergeMessage(currentMessage, stoppedData);
    }

    this.mergeRuntimeMessage(context, finalMessage as Partial<T>);
    this.asyncReturnValue(context, finalMessage);

    if (typeof gatewayOptions?.onAborted === 'function') {
      try {
        gatewayOptions.onAborted(finalMessage);
      } catch {
        // Prevent callback errors from affecting the main flow
      }
    }

    this.cleanup(context);

    return undefined;
  }

  /**
   * Error execution hook
   *
   * Handles errors during message send operation based on error type
   * and configured failure strategy. Abort errors are handled separately
   * to provide better user experience for cancelled operations.
   *
   * Strategy behavior:
   * - `KEEP_FAILED`: Update message with error state, keep in store
   * - `DELETE_FAILED`: Remove message from store completely
   * - `ADD_ON_SUCCESS`: Keep message data but don't add to store
   *
   * @param context - Execution context containing message sender parameters
   *
   * @throws {Error} When message update fails for KEEP_FAILED strategy
   */
  public onError(
    context: ExecutorContext<MessageSenderContextOptions<T>>
  ): ExecutorError | void {
    const error = context.error;

    // Use specialized abort error handling for stop operations
    if (this.isAbortError(error)) {
      return this.onStopError(context);
    }

    const { currentMessage, store, addedToStore } = context.parameters;
    let finalMessage: MessageStoreMsg<unknown, unknown> | undefined;

    const faileds = {
      loading: false,
      error: error,
      status: MessageStatus.FAILED,
      endTime: Date.now()
    } as Partial<T>;

    switch (this.failureStrategy) {
      case SendFailureStrategy.KEEP_FAILED:
        if (addedToStore && currentMessage.id) {
          const updatedMessage = store.updateMessage(
            currentMessage.id,
            faileds
          );

          if (!updatedMessage) {
            throw new Error('Failed to call updateMessage in store');
          }

          finalMessage = updatedMessage;
        } else {
          finalMessage = Object.assign(currentMessage, faileds);
        }
        break;

      case SendFailureStrategy.DELETE_FAILED:
        if (addedToStore && currentMessage.id) {
          store.deleteMessage(currentMessage.id);
        }
        finalMessage = store.mergeMessage(currentMessage, faileds);
        break;

      case SendFailureStrategy.ADD_ON_SUCCESS:
        finalMessage = Object.assign(currentMessage, faileds);
        break;
    }

    if (finalMessage) {
      this.mergeRuntimeMessage(context, finalMessage as Partial<T>);
      this.asyncReturnValue(context, finalMessage);
    }

    this.cleanup(context);
  }

  /**
   * Stream chunk processing hook
   *
   * Processes incoming stream chunks based on the configured failure strategy.
   * Handles message updates and state management during streaming operations.
   *
   * **Strategy behavior:**
   * - `KEEP_FAILED` / `DELETE_FAILED`: Update messages in store in real-time
   * - `ADD_ON_SUCCESS`: Don't update store, wait for completion
   *
   * **Fallback handling:**
   * If `onConnected` wasn't called but first chunk arrives with message still
   * in loading state, automatically triggers connection establishment logic.
   * This ensures proper state management even if connection hook is missed.
   *
   * @param context - Execution context with message sender parameters
   * @param chunk - Data chunk received from the stream
   * @returns Processed chunk or updated message
   *
   * @example
   * ```typescript
   * // During streaming, chunks are processed
   * onStream: (context, chunk) => {
   *   // For KEEP_FAILED: Updates message in store
   *   // For ADD_ON_SUCCESS: Returns chunk unchanged
   * }
   * ```
   */
  public onStream(
    context: MessageSenderPluginContext<MessageStoreMsg<unknown, unknown>>,
    chunk: unknown
  ): Promise<unknown> | unknown | void {
    const { addedToStore, currentMessage, store } = context.parameters;

    const times = context.hooksRuntimes.streamTimes;
    this.logger?.debug(
      template(this.loggerTpl.stream, {
        pluginName: this.pluginName,
        times: String(times)
      }),
      chunk
    );

    // Fallback: If first chunk arrives but user message is still loading,
    // it means onConnected wasn't called. The first chunk arrival indicates
    // connection is established, so execute the same logic.
    if (times === 1 && addedToStore && currentMessage.id) {
      const userMessage = store.getMessageById(currentMessage.id);
      if (userMessage?.loading) {
        this.handleConnectionEstablished(context.parameters);

        this.logger?.info(
          `[${this.pluginName}] Fallback: Connection established on first chunk`
        );
      }
    }

    // Ensure global streaming state is started (prevents edge cases)
    this.startStreaming(
      store as MessagesStore<MessageStoreMsg<unknown, unknown>>
    );

    if (!store.isMessage(chunk)) {
      return chunk;
    }

    const chunkMessage = chunk as MessageStoreMsg<unknown, unknown>;

    switch (this.failureStrategy) {
      case SendFailureStrategy.KEEP_FAILED:
      case SendFailureStrategy.DELETE_FAILED:
        if (addedToStore && currentMessage.id) {
          return this.handleStream_UpdateExisting(
            context.parameters,
            chunkMessage
          );
        }
        break;

      case SendFailureStrategy.ADD_ON_SUCCESS:
        return chunk;
    }

    return chunk;
  }

  /**
   * Start global streaming state
   *
   * Activates streaming mode in the store if not already active.
   * This ensures the store properly tracks streaming operations.
   *
   * @param store - Message store instance
   */
  protected startStreaming(
    store: MessagesStore<MessageStoreMsg<unknown, unknown>>
  ): void {
    // Start global streaming state
    if (!store.state.streaming) {
      this.logger?.debug(
        template(this.loggerTpl.startStreaming, {
          pluginName: this.pluginName
        })
      );
      store.startStreaming();
    }
  }

  /**
   * Handle connection establishment common logic
   *
   * Performs setup when streaming connection is established:
   * - Starts global streaming state in the store
   * - Marks user message as sent (loading=false)
   *
   * This indicates the request was successfully sent and streaming
   * is about to begin. The message transitions from "sending" preparation
   * to "sent and waiting for response".
   *
   * @param parameters - Message sender context parameters
   */
  protected handleConnectionEstablished(
    parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
  ): void {
    const { store, currentMessage, addedToStore } = parameters;

    // Start global streaming state
    this.startStreaming(
      store as MessagesStore<MessageStoreMsg<unknown, unknown>>
    );

    // Set user message loading to false, indicating request was sent successfully
    if (addedToStore && currentMessage.id) {
      store.updateMessage(currentMessage.id, {
        loading: false,
        // Follows sending rule 1: message sent, awaiting response
        status: MessageStatus.SENDING,
        endTime: Date.now()
      });
    }
  }

  /**
   * Connection established hook
   *
   * Called when streaming connection is successfully established.
   * Delegates to the common connection handling logic.
   *
   * @param context - Execution context containing message sender parameters
   */
  public onConnected(
    context: ExecutorContext<MessageSenderContextOptions<T>>
  ): void {
    this.handleConnectionEstablished(context.parameters);
  }

  /**
   * Handle stream chunk for existing messages
   *
   * Processes stream chunks by updating existing messages in the store
   * or adding new messages if they don't exist yet. This enables
   * real-time message updates during streaming operations.
   *
   * @param parameters - Message sender context parameters
   * @param chunkMessage - Chunk data containing message updates
   * @returns Updated or added message, or original chunk if not a message
   */
  protected handleStream_UpdateExisting(
    parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>,
    chunkMessage: unknown
  ): unknown | void {
    const { store } = parameters;

    if (!store.isMessage(chunkMessage) || !chunkMessage.id) {
      return chunkMessage;
    }
    const existingMessage = store.getMessageById(chunkMessage.id);

    if (existingMessage) {
      const updatedMessage = store.updateMessage(chunkMessage.id, chunkMessage);
      return updatedMessage || chunkMessage;
    }

    const addedMessage = store.addMessage(chunkMessage);
    return addedMessage;
  }
}
