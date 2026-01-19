import { ExecutorAsyncTask, LifecycleExecutor } from '@qlover/fe-corekit';
import { MessageInterface } from '../interface/MessagesStoreInterface';
import {
  MessageSenderContext,
  MessageSenderOptions,
  MessageSenderPlugin
} from '../interface/MessageSenderPlugin';

/**
 * Message sender executor for managing plugin execution
 *
 * Extends AsyncExecutor to provide specialized execution flow for message
 * sending operations, including support for streaming chunks and connection
 * events. Manages plugin lifecycle and hook execution for message operations.
 *
 * Core features:
 * - Standard plugin execution for message sending
 * - Streaming chunk processing with all plugins
 * - Connection event broadcasting to plugins
 * - Stream timing tracking and management
 *
 * @example Basic usage
 * ```typescript
 * const executor = new MessageSenderExecutor();
 * executor.use(plugin1);
 * executor.use(plugin2);
 *
 * const context = createContext();
 * await executor.execute(context);
 * ```
 *
 * @example With streaming
 * ```typescript
 * const executor = new MessageSenderExecutor();
 * const context = createContext();
 *
 * // Notify connection
 * await executor.runConnected(context);
 *
 * // Process chunks
 * for await (const chunk of stream) {
 *   await executor.runStream(chunk, context);
 * }
 *
 * // Reset for next operation
 * executor.resetRuntimesStreamTimes(context);
 * ```
 */
type MessageSenderTask<R, MessageType extends MessageInterface<unknown>> = (
  ctx: MessageSenderContext<MessageType>
) => Promise<R> | R;

export class MessageSenderExecutor<
  MessageType extends MessageInterface<unknown>
> extends LifecycleExecutor<
  MessageSenderContext<MessageType>,
  MessageSenderPlugin<MessageType>
> {
  /** @override */
  public exec<R>(task: MessageSenderTask<R, MessageType>): Promise<R>;

  /** @override */
  public exec<R>(
    data: MessageSenderOptions<MessageType>,
    task: MessageSenderTask<R, MessageType>
  ): Promise<R>;
  /** @override */
  public exec<R>(
    dataOrTask:
      | MessageSenderOptions<MessageType>
      | MessageSenderTask<R, MessageType>,
    task?: MessageSenderTask<R, MessageType>
  ): Promise<R> {
    return super.exec(
      dataOrTask as MessageSenderOptions<MessageType>,
      task as ExecutorAsyncTask<R, MessageSenderOptions<MessageType>>
    );
  }

  /**
   * Reset stream timing counter
   *
   * Resets the `streamTimes` counter in the context's hook runtimes to zero.
   * This should be called at the start of a new streaming operation to ensure
   * accurate timing tracking.
   *
   * @param context - Execution context containing hook runtimes
   *
   * @example
   * ```typescript
   * // Before starting a new stream
   * executor.resetRuntimesStreamTimes(context);
   * await startNewStream();
   * ```
   */
  public resetRuntimesStreamTimes(
    context: MessageSenderContext<MessageType>
  ): void {
    context.runtimes({
      streamTimes: 0
    });
  }

  /**
   * Execute stream chunk processing through all plugins
   *
   * Runs the `onStream` hook for all registered plugins, passing the chunk
   * through the plugin chain. Automatically tracks and increments the stream
   * chunk counter for monitoring purposes.
   *
   * @param chunk - Data chunk received from the stream
   * @param context - Execution context with message sender parameters
   * @returns Result after processing through all plugin hooks
   *
   * @example Process streaming chunks
   * ```typescript
   * const context = createContext();
   *
   * for await (const chunk of streamReader) {
   *   const processed = await executor.runStream(chunk, context);
   *   updateUI(processed);
   * }
   * ```
   *
   * @example With chunk counting
   * ```typescript
   * await executor.runStream(chunk, context);
   * const chunkCount = context.hooksRuntimes.streamTimes;
   * console.log(`Processed ${chunkCount} chunks`);
   * ```
   */
  public runStream(
    chunk: unknown,
    context: MessageSenderContext<MessageType>
  ): Promise<unknown> {
    if (context.hooksRuntimes.streamTimes === undefined) {
      this.resetRuntimesStreamTimes(context);
    }

    if (typeof context.hooksRuntimes.streamTimes === 'number') {
      context.runtimes({
        streamTimes: context.hooksRuntimes.streamTimes + 1
      });
    }

    return this.runHooks(this.plugins, 'onStream', context, chunk);
  }

  /**
   * Execute connection established event through all plugins
   *
   * Runs the `onConnected` hook for all registered plugins when a streaming
   * connection is successfully established. This allows plugins to initialize
   * state or perform setup before chunks start arriving.
   *
   * @param context - Execution context with message sender parameters
   * @returns Promise that resolves when all plugins have handled the event
   *
   * @example Notify connection
   * ```typescript
   * const context = createContext();
   *
   * try {
   *   await establishConnection();
   *   await executor.runConnected(context);
   *   console.log('All plugins notified of connection');
   * } catch (error) {
   *   console.error('Connection failed:', error);
   * }
   * ```
   */
  public runConnected(context: MessageSenderContext<MessageType>): void {
    this.runHooks(this.plugins, 'onConnected', context);
  }
}
