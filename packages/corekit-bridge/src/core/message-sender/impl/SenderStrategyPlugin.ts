import {
  type ExecutorError,
  isAbortError as isAbortErrorFn
} from '@qlover/fe-corekit';
import {
  type MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from './MessageStore';
import { template } from './utils';
import type { LoggerInterface } from '@qlover/logger';
import {
  type MessageSenderContext,
  type MessageSenderOptions,
  type MessageSenderPlugin
} from '../interface/MessageSenderPlugin';

/**
 * Send failure handling strategies
 *
 * Defines how messages should be managed in the store throughout their
 * lifecycle, from sending to success/failure. Each strategy provides
 * different user experience patterns suitable for various application types.
 *
 * **Strategy comparison:**
 *
 * | Strategy | Add Timing | Failed Messages | Stopped Messages | Use Case |
 * |----------|-----------|-----------------|------------------|----------|
 * | `KEEP_FAILED` | Before send | Kept in store | Kept in store | Chat apps with retry |
 * | `DELETE_FAILED` | Before send | Deleted from store | Kept in store | Clean UI, success only |
 * | `ADD_ON_SUCCESS` | After success | Not added | Not added | Optimistic UI, no loading |
 *
 * **Message lifecycle by strategy:**
 *
 * `KEEP_FAILED`:
 * 1. Add message to store with `SENDING` status
 * 2. On success: Update to `SENT` status
 * 3. On failure: Update to `FAILED` status (kept in store)
 * 4. On abort: Update to `STOPPED` status (kept in store)
 *
 * `DELETE_FAILED`:
 * 1. Add message to store with `SENDING` status
 * 2. On success: Update to `SENT` status
 * 3. On failure: Delete from store (return message with `FAILED`)
 * 4. On abort: Update to `STOPPED` status (kept in store, different from failed)
 *
 * `ADD_ON_SUCCESS`:
 * 1. Don't add message to store yet
 * 2. On success: Add message to store with `SENT` status
 * 3. On failure: Don't add to store (return message with `FAILED`)
 * 4. On abort: Don't add to store (return message with `STOPPED`)
 *
 * @example Chat application (KEEP_FAILED)
 * ```typescript
 * // Users see all messages including failures
 * // Can retry failed messages
 * const strategy = SendFailureStrategy.KEEP_FAILED;
 * ```
 *
 * @example Form submission (DELETE_FAILED)
 * ```typescript
 * // Clean UI showing only successful submissions
 * // Failed attempts don't clutter the list
 * const strategy = SendFailureStrategy.DELETE_FAILED;
 * ```
 *
 * @example Background task (ADD_ON_SUCCESS)
 * ```typescript
 * // No loading state visible to users
 * // Results appear only after completion
 * const strategy = SendFailureStrategy.ADD_ON_SUCCESS;
 * ```
 */
export const SendFailureStrategy = Object.freeze({
  /**
   * Keep failed messages in store
   *
   * Messages are added to the store before sending and remain there
   * regardless of the outcome. Users can see loading states, failures,
   * and retry failed messages.
   *
   * **Behavior:**
   * - Add message immediately with `SENDING` status
   * - Update to `SENT` on success
   * - Update to `FAILED` on error (kept in store)
   * - Update to `STOPPED` on abort (kept in store)
   *
   * **Best for:**
   * - Chat applications
   * - Message queues with retry
   * - Any UI showing send progress
   */
  KEEP_FAILED: 'keep_failed',

  /**
   * Delete failed messages from store
   *
   * Messages are added before sending but removed on failure.
   * Only successful messages remain visible. Stopped messages
   * are kept (different from failures).
   *
   * **Behavior:**
   * - Add message immediately with `SENDING` status
   * - Update to `SENT` on success
   * - Delete from store on error
   * - Update to `STOPPED` on abort (kept in store)
   *
   * **Best for:**
   * - Form submissions
   * - Clean message lists
   * - Success-only displays
   */
  DELETE_FAILED: 'delete_failed',

  /**
   * Add messages only after successful send
   *
   * Messages are not added to the store until send completes successfully.
   * Users don't see loading states or failures in the message list.
   *
   * **Behavior:**
   * - Don't add message initially
   * - Add with `SENT` status on success
   * - Don't add on error
   * - Don't add on abort
   *
   * **Best for:**
   * - Background tasks
   * - Optimistic UI patterns
   * - No loading state required
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
export class SenderStrategyPlugin<T extends MessageStoreMsg<unknown, unknown>>
  implements MessageSenderPlugin<T>
{
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
  ) {}

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
    return isAbortErrorFn(error);
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
    parameters: MessageSenderOptions<T>
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
  protected cleanup(context: MessageSenderContext<T>): void {
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
   * Initializes message state based on the configured failure strategy.
   * This hook determines whether to add the message to the store immediately
   * or wait until after successful send.
   *
   * **Strategy behavior:**
   *
   * `ADD_ON_SUCCESS`:
   * - Don't add message to store yet
   * - Set `addedToStore=false` flag
   * - Message only added after successful send in `onSuccess`
   *
   * `KEEP_FAILED` / `DELETE_FAILED`:
   * - Add message to store immediately with `SENDING` status
   * - Set `addedToStore=true` flag
   * - Update `currentMessage` with store-added version (includes generated ID)
   * - Users see loading state in UI
   *
   * **Important notes:**
   * - `addedToStore` flag tracked in context parameters
   * - Flag used by other hooks to determine update vs add logic
   * - Store-added message may have different ID than input message
   *
   * @override
   * @param context - Execution context containing message sender parameters
   *
   * @example Context after KEEP_FAILED
   * ```typescript
   * // Before: context.parameters.currentMessage = { content: 'Hello' }
   * // After:  context.parameters.currentMessage = { id: 'msg-1', content: 'Hello', status: 'sending' }
   * //         context.parameters.addedToStore = true
   * ```
   *
   * @example Context after ADD_ON_SUCCESS
   * ```typescript
   * // Before: context.parameters.currentMessage = { content: 'Hello' }
   * // After:  context.parameters.currentMessage = { content: 'Hello' } (unchanged)
   * //         context.parameters.addedToStore = false
   * ```
   */
  public onBefore(context: MessageSenderContext<T>): void {
    switch (this.failureStrategy) {
      case SendFailureStrategy.ADD_ON_SUCCESS:
        context.setParameters({
          ...context.parameters,
          addedToStore: false
        });
        break;

      case SendFailureStrategy.KEEP_FAILED:
      case SendFailureStrategy.DELETE_FAILED:
      default:
        {
          const addedMessage = this.handleBefore_KEEP_FAILED(
            context.parameters
          );

          context.setParameters({
            ...context.parameters,
            currentMessage: addedMessage as T,
            addedToStore: true
          });
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
    parameters: MessageSenderOptions<T>,
    successData: T
  ): T | undefined {
    const { currentMessage, store } = parameters;

    const updatedMessage = store.updateMessage(
      currentMessage.id!,
      successData as Partial<T>
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
    parameters: MessageSenderOptions<T>,
    successData: T
  ): T {
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
   * Handles message finalization after successful send operation.
   * Updates existing messages or adds new ones based on the configured
   * strategy and `addedToStore` flag.
   *
   * **Strategy behavior:**
   *
   * `KEEP_FAILED` / `DELETE_FAILED` (`addedToStore=true`):
   * - Message already in store from `onBefore`
   * - Update existing message with success data
   * - Merge gateway response into store message
   * - Throws error if update fails
   *
   * `ADD_ON_SUCCESS` (`addedToStore=false`):
   * - Message not in store yet
   * - Add message to store with success data
   * - Combine current message with gateway response
   * - Return newly added message
   *
   * **Data flow:**
   * 1. Get success data from `context.returnValue` (gateway response)
   * 2. Update or add message based on `addedToStore` flag
   * 3. Update `context.parameters.currentMessage` with final message
   * 4. Update `context.returnValue` with final message
   * 5. Call `cleanup()` to stop streaming state
   *
   * @override
   * @param context - Execution context containing message sender parameters
   *
   * @throws {Error} When message update fails for `KEEP_FAILED`/`DELETE_FAILED` strategies
   *
   * @example KEEP_FAILED flow
   * ```typescript
   * // onBefore: Added { id: 'msg-1', content: 'Hello', status: 'sending' }
   * // Gateway returns: { result: 'OK', timestamp: 123 }
   * // onSuccess: Updates to { id: 'msg-1', content: 'Hello', status: 'sent', result: 'OK', timestamp: 123 }
   * ```
   *
   * @example ADD_ON_SUCCESS flow
   * ```typescript
   * // onBefore: Not added to store
   * // Gateway returns: { result: 'OK', timestamp: 123 }
   * // onSuccess: Adds { id: 'msg-1', content: 'Hello', status: 'sent', result: 'OK', timestamp: 123 }
   * ```
   */
  public onSuccess(context: MessageSenderContext<T>): void {
    const { addedToStore } = context.parameters;

    const successData = context.returnValue as MessageStoreMsg<
      unknown,
      unknown
    >;

    if (addedToStore) {
      const updatedMessage = this.handleSuccess_KEEP_FAILED(
        context.parameters,
        successData as T
      );

      if (!updatedMessage) {
        throw new Error('Failed to update message');
      }

      context.setParameters({
        ...context.parameters,
        currentMessage: updatedMessage as T
      });
      context.setReturnValue(updatedMessage);
    } else {
      const addedMessage = this.handleSuccess_ADD_ON_SUCCESS(
        context.parameters,
        successData as T
      );

      context.setParameters({
        ...context.parameters,
        currentMessage: addedMessage as T
      });
      context.setReturnValue(addedMessage);
    }

    this.cleanup(context);
  }

  /**
   * Handle abort/stop errors
   *
   * Special handling for abort errors when a send operation is cancelled.
   * Sets message status to `STOPPED` (different from `FAILED`) and invokes
   * the `onAborted` callback if provided. Prevents error propagation to
   * maintain proper control flow.
   *
   * **Process flow:**
   * 1. Create stopped data with `STOPPED` status and error
   * 2. Update or merge message based on `addedToStore` flag
   * 3. Update context with final stopped message
   * 4. Invoke `onAborted` callback (error-safe)
   * 5. Call `cleanup()` to stop streaming state
   * 6. Return `undefined` to prevent error propagation
   *
   * **Message handling:**
   * - If `addedToStore=true`: Update existing message in store
   * - If `addedToStore=false`: Merge with current message (not added to store)
   * - Fallback to merge if update returns `null`
   *
   * **Important notes:**
   * - Status set to `STOPPED` (not `FAILED`)
   * - `onAborted` callback wrapped in try-catch to prevent callback errors
   * - Returns `undefined` to stop error propagation through plugin chain
   * - Cleanup always called to ensure streaming state is stopped
   *
   * @param context - Execution context containing message sender parameters
   * @returns `undefined` to prevent error propagation to other plugins
   *
   * @example With KEEP_FAILED strategy
   * ```typescript
   * // Message in store: { id: 'msg-1', status: 'sending', loading: true }
   * sender.stop('msg-1');
   * // After onStopError: { id: 'msg-1', status: 'stopped', loading: false, error: AbortError }
   * // Message kept in store with STOPPED status
   * ```
   *
   * @example With DELETE_FAILED strategy
   * ```typescript
   * // Message in store: { id: 'msg-1', status: 'sending', loading: true }
   * sender.stop('msg-1');
   * // After onStopError: { id: 'msg-1', status: 'stopped', loading: false, error: AbortError }
   * // Message kept in store (STOPPED is different from FAILED, not deleted)
   * ```
   *
   * @example With ADD_ON_SUCCESS strategy
   * ```typescript
   * // Message not in store yet
   * sender.stop('msg-1');
   * // After onStopError: { id: 'msg-1', status: 'stopped', loading: false, error: AbortError }
   * // Message not added to store (returns stopped message)
   * ```
   *
   * @example With onAborted callback
   * ```typescript
   * sender.send(
   *   { content: 'Hello' },
   *   {
   *     onAborted: (msg) => {
   *       console.log('Aborted:', msg.id, msg.status); // 'stopped'
   *       // Cleanup UI, show notification, etc.
   *     }
   *   }
   * );
   * ```
   */
  protected onStopError(
    context: MessageSenderContext<T>
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

    context.setParameters({
      ...context.parameters,
      currentMessage: finalMessage as T
    });
    context.setReturnValue(finalMessage);

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
   * and configured failure strategy. Abort errors are delegated to
   * `onStopError` for special handling with `STOPPED` status.
   *
   * **Error type handling:**
   * - Abort errors: Delegated to `onStopError()` → status `STOPPED`
   * - Regular errors: Handled here → status `FAILED`
   *
   * **Strategy behavior:**
   *
   * `KEEP_FAILED`:
   * - If `addedToStore=true`: Update message in store with `FAILED` status
   * - If `addedToStore=false`: Merge error with current message
   * - Message kept with error information
   * - Throws if update fails
   *
   * `DELETE_FAILED`:
   * - If `addedToStore=true`: Delete message from store
   * - Merge error with current message for return value
   * - Message not visible in store
   *
   * `ADD_ON_SUCCESS`:
   * - Message never added to store
   * - Merge error with current message
   * - Return failed message without adding
   *
   * **Data flow:**
   * 1. Check if error is abort error → delegate to `onStopError`
   * 2. Create failed data with `FAILED` status and error
   * 3. Update, delete, or merge based on strategy
   * 4. Update context with final failed message
   * 5. Call `cleanup()` to stop streaming state
   *
   * @override
   * @param context - Execution context containing message sender parameters
   *
   * @throws {Error} When message update fails for `KEEP_FAILED` strategy
   *
   * @example KEEP_FAILED with addedToStore=true
   * ```typescript
   * // Message in store: { id: 'msg-1', status: 'sending', loading: true }
   * // Error occurs: Error('Network error')
   * // After onError: { id: 'msg-1', status: 'failed', loading: false, error: Error }
   * // Message updated in store with error
   * ```
   *
   * @example DELETE_FAILED with addedToStore=true
   * ```typescript
   * // Message in store: { id: 'msg-1', status: 'sending', loading: true }
   * // Error occurs: Error('Network error')
   * // After onError: Message deleted from store
   * // Returns: { id: 'msg-1', status: 'failed', loading: false, error: Error }
   * ```
   *
   * @example ADD_ON_SUCCESS with addedToStore=false
   * ```typescript
   * // Message not in store
   * // Error occurs: Error('Network error')
   * // After onError: Message not added to store
   * // Returns: { id: 'msg-1', status: 'failed', loading: false, error: Error }
   * ```
   *
   * @example Abort error delegation
   * ```typescript
   * // Error is AbortError
   * // Delegated to onStopError()
   * // Status set to 'stopped' instead of 'failed'
   * // onAborted callback invoked
   * ```
   */
  public onError(context: MessageSenderContext<T>): ExecutorError | void {
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
      context.setParameters({
        ...context.parameters,
        currentMessage: finalMessage as T
      });
      context.setReturnValue(finalMessage);
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
   * @override
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
    context: MessageSenderContext<T>,
    chunk: unknown
  ): unknown | void {
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
    this.startStreaming(store as MessagesStore<T>);

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
    parameters: MessageSenderOptions<T>
  ): void {
    const { store, currentMessage, addedToStore } = parameters;

    // Start global streaming state
    this.startStreaming(store as MessagesStore<T>);

    // Set user message loading to false, indicating request was sent successfully
    if (addedToStore && currentMessage.id) {
      store.updateMessage(currentMessage.id, {
        loading: false,
        // Follows sending rule 1: message sent, awaiting response
        status: MessageStatus.SENDING,
        endTime: Date.now()
      } as Partial<T>);
    }
  }

  /**
   * Connection established hook
   *
   * Called when streaming connection is successfully established.
   * Delegates to the common connection handling logic.
   *
   * @override
   * @param context - Execution context containing message sender parameters
   */
  public onConnected(context: MessageSenderContext<T>): void {
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
    parameters: MessageSenderOptions<T>,
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
