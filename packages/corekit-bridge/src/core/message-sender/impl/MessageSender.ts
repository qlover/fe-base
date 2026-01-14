import {
  AborterConfig,
  AborterId,
  AborterInterface,
  ExecutorError,
  raceWithAbort
} from '@qlover/fe-corekit';
import { MessageSenderExecutor } from './MessageSenderExecutor';
import {
  MessageStatus,
  type MessageStoreMsg,
  type MessagesStore
} from './MessageStore';
import { template } from './utils';
import type {
  GatewayOptions,
  MessageGetwayInterface
} from '../interface/MessageGetwayInterface';
import type {
  MessageSenderBaseConfig,
  MessageSenderInterface
} from '../interface/MessageSenderInterface';
import type { LoggerInterface } from '@qlover/logger';
import {
  MessageSenderContext,
  MessageSenderOptions,
  MessageSenderPlugin
} from '../interface/MessageSenderPlugin';

/**
 * Default sender name constant
 */
const defaultSenderName = 'MessageSender';

/**
 * Default error ID for message sender errors
 */
export const MESSAGE_SENDER_ERROR_ID = 'MESSAGE_SENDER_ERROR';

const defaultLoggerTpl = {
  failed: '[${senderName}] ${messageId} failed',
  success: '[${senderName}] ${messageId} success, speed: ${speed}ms'
} as const;

export interface MessageSenderConfig<
  MessageType extends MessageStoreMsg<unknown, unknown>
> extends MessageSenderBaseConfig {
  executor?: MessageSenderExecutor<MessageType>;
  aborter?: AborterInterface<AborterConfig>;

  /**
   * Logger templates
   *
   * Templates for logging messages.
   *
   * @example
   * ```typescript
   * const loggerTpl = {
   *   failed: '[${senderName}] ${messageId} failed',
   *   success: '[${senderName}] ${messageId} success, speed: ${speed}ms'
   * };
   */
  loggerTpl?: {
    failed?: string;
    success?: string;
  };
}

/**
 * Message sender implementation
 *
 * Core class responsible for orchestrating message sending operations,
 * including gateway communication, plugin execution, error handling,
 * abort control, and streaming support.
 *
 * Core features:
 * - Message sending with plugin pipeline
 * - Gateway integration and abstraction
 * - Streaming and normal mode support
 * - Abort/cancel operations
 * - Comprehensive error handling
 * - Performance logging
 *
 * @template MessageType - Type of messages managed by this sender
 *
 * @example Basic usage
 * ```typescript
 * const store = new MessagesStore();
 * const sender = new MessageSender(store, {
 *   gateway: myGateway,
 *   logger: myLogger
 * });
 *
 * // Send message
 * const result = await sender.send({ content: 'Hello' });
 * ```
 *
 * @example With plugins
 * ```typescript
 * sender
 *   .use(validationPlugin)
 *   .use(loggingPlugin)
 *   .use(transformPlugin);
 *
 * await sender.send({ content: 'Hello' });
 * ```
 *
 * @example With streaming
 * ```typescript
 * await sender.send(
 *   { content: 'Hello' },
 *   {
 *     onConnected: () => console.log('Connected'),
 *     onChunk: (chunk) => updateUI(chunk),
 *     onComplete: (msg) => console.log('Complete')
 *   }
 * );
 * ```
 */
export class MessageSender<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MessageType extends MessageStoreMsg<any, any>
> implements MessageSenderInterface<MessageType>
{
  protected readonly senderName: string;

  protected loggerTpl: {
    failed: string;
    success: string;
  };

  constructor(
    protected readonly messages: MessagesStore<MessageType>,
    protected readonly config?: MessageSenderConfig<MessageType>
  ) {
    this.senderName = config?.senderName || defaultSenderName;
    this.loggerTpl = {
      ...defaultLoggerTpl,
      ...config?.loggerTpl
    };
  }

  public get executor(): MessageSenderExecutor<MessageType> | undefined {
    return this.config?.executor;
  }

  public get aborter(): AborterInterface<AborterConfig> | undefined {
    return this.config?.aborter;
  }

  public get logger(): LoggerInterface | undefined {
    return this.config?.logger;
  }

  /**
   * Get the message store instance
   *
   * @override
   * @returns Message store managing message state
   */
  public getMessageStore(): MessagesStore<MessageType> {
    return this.messages;
  }

  /**
   * Get the configured gateway instance
   *
   * @override
   * @returns Gateway instance or `undefined` if not configured
   */
  public getGateway(): MessageGetwayInterface | undefined {
    return this.config?.gateway;
  }

  /**
   * Register a plugin with the sender
   *
   * Plugins are executed in registration order during message sending.
   * Returns `this` for method chaining.
   *
   * @override
   * @param plugin - Plugin to register
   * @returns This sender instance for chaining
   *
   * @example
   * ```typescript
   * sender
   *   .use(validationPlugin)
   *   .use(loggingPlugin)
   *   .use(transformPlugin);
   * ```
   */
  public use(plugin: MessageSenderPlugin<MessageType>): this {
    if (!this.executor) {
      throw new Error(this.senderName + ' executor is not set');
    }

    this.executor.use(plugin);
    return this;
  }

  /**
   * Stop sending a specific message
   *
   * Cancels an ongoing message send operation by ID. This only works
   * for requests created automatically by MessageSender (without custom signal).
   *
   * **Important notes:**
   * - Only affects requests created by MessageSender (no custom signal provided)
   * - If a custom signal was provided during send, this method has no effect
   * - Automatically cleans up related resources (managed by AbortPlugin)
   *
   * @param messageId - ID of the message to stop sending
   * @returns `true` if stop was successful, `false` otherwise
   *
   * @example
   * ```typescript
   * const message = await sender.send({ content: 'Hello' });
   *
   * // Later, cancel the send
   * const stopped = sender.stop(message.id);
   * if (stopped) {
   *   console.log('Send cancelled successfully');
   * }
   * ```
   */
  public stop(messageId: AborterId): boolean {
    return this.aborter?.abort(messageId) || false;
  }

  /**
   * Stop all ongoing message sends
   *
   * Cancels all currently active message send operations.
   * Automatically cleans up all related resources (managed by AbortPlugin).
   *
   * @example
   * ```typescript
   * // Cancel all pending sends
   * sender.stopAll();
   * console.log('All sends cancelled');
   * ```
   */
  public stopAll(): void {
    this.aborter?.abortAll();
  }

  /**
   * Send message through gateway
   *
   * Core method that handles the actual message transmission through the
   * configured gateway. Manages streaming setup, plugin hook execution,
   * abort signal handling, and response processing.
   *
   * @param message - Message to send
   * @param context - Execution context with sender parameters
   * @returns Sent message with response data merged
   *
   * @throws {AbortError} When send operation is cancelled
   */
  protected async sendMessage(
    message: MessageType,
    context?: MessageSenderContext<MessageType>
  ): Promise<MessageType> {
    const gateway = this.getGateway();
    const executor = this.executor;

    const gatewayOptions = context?.parameters.gatewayOptions;
    let newGatewayOptions: GatewayOptions<MessageType> | undefined;

    if (executor && gatewayOptions && context) {
      const originalOnChunk = gatewayOptions.onChunk;
      const originalOnConnected = gatewayOptions.onConnected;
      const signal = gatewayOptions.signal;

      executor.resetRuntimesStreamTimes(context);

      newGatewayOptions = Object.assign({}, gatewayOptions, {
        onConnected: async () => {
          signal?.throwIfAborted();

          await executor.runConnected(context);
          originalOnConnected?.();
        },
        onChunk: async (chunk) => {
          signal?.throwIfAborted();

          // Pass context for plugin hooks, but don't capture it in closure unnecessarily
          const result = await executor.runStream(chunk, context);

          if (originalOnChunk) {
            originalOnChunk(result || chunk);
          }
        }
      } as GatewayOptions<MessageType>);
    }

    const gatewayPromise = gateway?.sendMessage(message, newGatewayOptions);
    const result = await raceWithAbort(gatewayPromise!, gatewayOptions?.signal);

    return this.messages.mergeMessage(message, {
      status: MessageStatus.SENT,
      result: result,
      loading: false,
      endTime: Date.now()
    } as Partial<MessageType>);
  }

  /**
   * Generate a sending message from partial data
   *
   * Creates a complete message object ready for sending with proper
   * status, loading state, and timestamps.
   *
   * @param message - Partial message specification
   * @returns Complete message ready for sending
   */
  protected generateSendingMessage(message: Partial<MessageType>): MessageType {
    return this.messages.createMessage({
      ...message,
      status: MessageStatus.SENDING,
      loading: true,
      startTime: Date.now(),
      endTime: 0,
      error: null
    } as Partial<MessageType>);
  }

  /**
   * Handle send operation errors
   *
   * Processes errors that occur during message sending. Converts unknown
   * async errors to MESSAGE_SENDER_ERROR format, logs failures, and either
   * throws or returns an error message based on configuration.
   *
   * **Status handling:**
   * Allows plugins to modify final status. If status is still `SENDING` at
   * this point, it's reset to `FAILED`. Examples of plugin-modified status:
   * `STOPPED` for cancelled operations.
   *
   * @param error - Error that occurred during send
   * @param context - Execution context containing message sender parameters
   * @returns Message with error state, or throws if `throwIfError` is `true`
   *
   * @throws Error when `throwIfError` configuration is `true`
   */
  protected async handleError(
    error: unknown,
    context: MessageSenderOptions<MessageType>
  ): Promise<MessageType> {
    // If is unknown async error, create a new error with MESSAGE_SENDER_ERROR id
    let processedError = error;
    if (error instanceof ExecutorError && error.id === 'UNKNOWN_ASYNC_ERROR') {
      // Create a new ExecutorError instead of modifying the original
      // The constructor will automatically preserve the stack trace from the original error
      processedError = new ExecutorError(MESSAGE_SENDER_ERROR_ID, error);
    }

    if (this.config?.throwIfError) {
      throw processedError;
    }

    const { currentMessage } = context;
    const endTime = currentMessage.endTime || Date.now();
    // Allow plugins to modify final status; may not always be FAILED in some cases
    // If status is still SENDING at this final step, reset to FAILED
    // Example: STOPPED status set by abort handling
    const currentStatus = currentMessage.status;
    const status =
      currentStatus === MessageStatus.SENDING
        ? MessageStatus.FAILED
        : currentStatus;

    if (this.logger) {
      this.logger.debug(
        template(this.loggerTpl.failed, {
          senderName: this.senderName,
          messageId: currentMessage.id!
        })
      );
    }

    // Create a new message object instead of modifying the original
    return this.messages.mergeMessage(context.currentMessage, {
      loading: false,
      error: processedError,
      status: status,
      endTime: endTime
    } as Partial<MessageType>);
  }

  /**
   * Create execution context for sending
   *
   * Constructs the complete context object needed for message send execution,
   * merging configuration and options, and using message ID for abort control.
   *
   * @param sendingMessage - Message being sent
   * @param gatewayOptions - Optional gateway configuration
   * @returns Complete execution context for message sending
   */
  protected createSendOptions(
    sendingMessage: MessageType,
    gatewayOptions?: GatewayOptions<MessageType>
  ): MessageSenderOptions<MessageType> {
    const _gatewayOptions = {
      ...this.config?.gatewayOptions,
      ...gatewayOptions,
      // Use message ID as AbortPlugin request identifier
      id: sendingMessage.id
    };

    return {
      store: this.messages,
      currentMessage: sendingMessage,
      throwIfError: this.config?.throwIfError,
      gateway: this.config?.gateway,
      gatewayOptions: _gatewayOptions
    };
  }

  /**
   * Send a message through the sender pipeline
   *
   * Main public API for sending messages. Handles the complete send lifecycle
   * including message preparation, plugin execution, gateway communication,
   * error handling, and logging.
   *
   * **Behavior:**
   * - If `throwIfError=true`: Throws on send failure
   * - If `throwIfError=false` (default): Returns error message on failure
   * - If `gatewayOptions` provided: Uses specified configuration
   * - If `gatewayOptions.signal` provided: Uses custom signal (stop method won't work)
   * - If no signal provided: AbortPlugin creates one automatically (stoppable via stop method)
   * - Resource cleanup managed automatically by AbortPlugin
   *
   * @override
   * @param message - Partial message object to send
   * @param gatewayOptions - Optional gateway configuration for this specific send
   * @returns Promise resolving to sent message with response data
   *
   * @throws Error when `throwIfError` is `true` and send fails
   *
   * @example Basic send
   * ```typescript
   * const result = await sender.send({
   *   content: 'Hello, world!'
   * });
   * console.log('Sent:', result.id);
   * ```
   *
   * @example With streaming
   * ```typescript
   * await sender.send(
   *   { content: 'Hello' },
   *   {
   *     stream: true,
   *     onConnected: () => console.log('Connected'),
   *     onChunk: (chunk) => updateUI(chunk),
   *     onComplete: (msg) => console.log('Complete')
   *   }
   * );
   * ```
   *
   * @example With custom abort control
   * ```typescript
   * const controller = new AbortController();
   *
   * const promise = sender.send(
   *   { content: 'Hello' },
   *   { signal: controller.signal }
   * );
   *
   * // Cancel manually
   * setTimeout(() => controller.abort(), 5000);
   *
   * try {
   *   await promise;
   * } catch (error) {
   *   console.log('Send cancelled');
   * }
   * ```
   */
  public async send(
    message: Partial<MessageType>,
    gatewayOptions?: GatewayOptions<MessageType>
  ): Promise<MessageType> {
    const sendingMessage = this.generateSendingMessage(message);
    const options = this.createSendOptions(sendingMessage, gatewayOptions);

    try {
      let result: MessageType | undefined;

      if (!this.executor) {
        result = await this.sendMessage(options.currentMessage);
      } else {
        result = await this.executor.exec(options, async (ctx) => {
          return await this.sendMessage(ctx.parameters.currentMessage, ctx);
        });
      }

      if (this.logger) {
        this.logger.info(
          template(this.loggerTpl.success, {
            senderName: this.senderName,
            messageId: sendingMessage.id!,
            speed: String(this.getDuration(result))
          })
        );
      }

      return result;
    } catch (error) {
      return this.handleError(error, options);
    }
  }

  /**
   * Get message send duration
   *
   * Calculates the time taken to send a message in milliseconds.
   * Returns 0 if message has no end time (still in progress).
   *
   * @param message - Message to calculate duration for
   * @returns Duration in milliseconds
   *
   * @example
   * ```typescript
   * const message = await sender.send({ content: 'Hello' });
   * const duration = sender.getDuration(message);
   * console.log(`Send took ${duration}ms`);
   * ```
   */
  public getDuration(message: MessageType): number {
    return message.endTime ? message.endTime - message.startTime : 0;
  }
}
