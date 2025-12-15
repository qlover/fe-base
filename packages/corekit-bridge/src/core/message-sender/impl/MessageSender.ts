import { ExecutorError } from '@qlover/fe-corekit';
import { AbortPlugin, type AbortPluginConfig } from '@qlover/fe-corekit';
import {
  type MessageSenderContextOptions,
  type MessageSenderPluginContext,
  MessageSenderExecutor
} from './MessageSenderExecutor';
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
import type { MessageSenderInterface } from '../interface/MessageSenderInterface';
import type { ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Configuration options for message sender
 *
 * Defines behavior, logging, gateway integration, and error handling
 * for the message sender instance.
 */
export interface MessageSenderConfig {
  /**
   * Sender instance name
   *
   * Used for logging and identification purposes. Helpful when
   * multiple sender instances exist in the application.
   *
   * @default `'MessageSender'`
   *
   * @example
   * ```typescript
   * const config = {
   *   senderName: 'ChatSender'
   * };
   * ```
   */
  senderName?: string;

  /**
   * Logger instance for debugging and monitoring
   *
   * Optional logger for tracking message send operations,
   * errors, and performance metrics.
   */
  logger?: LoggerInterface;

  /**
   * Whether to throw errors on send failure
   *
   * When `true`, failed send operations throw errors instead of
   * returning error messages. Useful for error boundary handling.
   *
   * @default `false`
   *
   * @example
   * ```typescript
   * const config = {
   *   throwIfError: true // Throw on failures
   * };
   * ```
   */
  throwIfError?: boolean;

  /**
   * Message gateway instance
   *
   * Gateway responsible for actually sending messages to external
   * services (APIs, WebSocket servers, etc.).
   */
  gateway?: MessageGetwayInterface;

  /**
   * Gateway options for message operations
   *
   * Configuration for gateway behavior including:
   * - Stream event handlers (`onChunk`, `onComplete`, `onError`, `onProgress`)
   * - Abort signal for cancellation control
   * - Custom request parameters
   *
   * @example
   * ```typescript
   * const config = {
   *   gatewayOptions: {
   *     stream: true,
   *     onChunk: (chunk) => console.log(chunk),
   *     timeout: 30000
   *   }
   * };
   * ```
   */
  gatewayOptions?: GatewayOptions<unknown>;
}

/**
 * Default sender name constant
 */
const defaultSenderName = 'MessageSender';

/**
 * Default error ID for message sender errors
 */
const defaultMessageSenderErrorId = 'MESSAGE_SENDER_ERROR';

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
  /** Error ID for message sender errors */
  protected messageSenderErrorId = defaultMessageSenderErrorId;

  /** Plugin executor for managing send pipeline */
  protected readonly executor: MessageSenderExecutor<MessageType>;

  /** Abort plugin for handling message cancellation */
  protected readonly abortPlugin: AbortPlugin<
    MessageSenderContextOptions<MessageType>
  >;

  /** Optional logger instance */
  protected readonly logger?: LoggerInterface;

  /** Name of this sender instance */
  protected readonly senderName: string;

  /**
   * Logger message templates
   *
   * Predefined templates for consistent logging throughout
   * the sender's lifecycle.
   */
  protected loggerTpl = {
    failed: '[${senderName}] ${messageId} failed',
    success: '[${senderName}] ${messageId} success, speed: ${speed}ms'
  } as const;

  /**
   * Create a new message sender
   *
   * @param messages - Message store instance for managing message state
   * @param config - Optional configuration for sender behavior
   *
   * @example
   * ```typescript
   * const store = new MessagesStore();
   * const sender = new MessageSender(store, {
   *   senderName: 'ChatSender',
   *   gateway: chatGateway,
   *   logger: consoleLogger,
   *   throwIfError: true
   * });
   * ```
   */
  constructor(
    protected readonly messages: MessagesStore<MessageType>,
    protected readonly config?: MessageSenderConfig
  ) {
    this.logger = config?.logger;
    this.senderName = config?.senderName || defaultSenderName;
    this.executor = new MessageSenderExecutor();

    this.abortPlugin = new AbortPlugin<
      MessageSenderContextOptions<MessageType>
    >({
      getConfig: (parameters) =>
        (parameters.gatewayOptions || parameters) as AbortPluginConfig,
      logger: config?.logger,
      timeout: config?.gatewayOptions?.timeout
    });
    this.executor.use(this.abortPlugin);
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
  public use<T = MessageSenderContextOptions<MessageType>>(
    plugin: ExecutorPlugin<T>
  ): this {
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
  public stop(messageId: string): boolean {
    return this.abortPlugin.abort(messageId);
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
    this.abortPlugin.abortAll();
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
    context: MessageSenderPluginContext<MessageType>
  ): Promise<MessageType> {
    const gateway = this.getGateway();

    const gatewayOptions = context.parameters.gatewayOptions;
    let newGatewayOptions: GatewayOptions<MessageType> | undefined;
    if (gatewayOptions) {
      // Extract only necessary references to minimize closure capture
      const originalOnChunk = gatewayOptions.onChunk;
      const originalOnConnected = gatewayOptions.onConnected;
      const executor = this.executor;
      const signal = gatewayOptions.signal;

      executor.resetRuntimesStreamTimes(context);

      newGatewayOptions = {
        ...gatewayOptions,
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
      };
    }

    // Use AbortPlugin.raceWithAbort to ensure abort response even if gateway doesn't check signal
    const gatewayPromise = gateway?.sendMessage(message, newGatewayOptions);
    const result = await this.abortPlugin.raceWithAbort(
      gatewayPromise!,
      gatewayOptions?.signal
    );

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
    context: MessageSenderContextOptions<MessageType>
  ): Promise<MessageType> {
    // If is unknown async error, create a new error with MESSAGE_SENDER_ERROR id
    let processedError = error;
    if (error instanceof ExecutorError && error.id === 'UNKNOWN_ASYNC_ERROR') {
      // Create a new ExecutorError instead of modifying the original
      // The constructor will automatically preserve the stack trace from the original error
      processedError = new ExecutorError(this.messageSenderErrorId, error);
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
  protected createSendContext(
    sendingMessage: MessageType,
    gatewayOptions?: GatewayOptions<MessageType>
  ): MessageSenderContextOptions<MessageType> {
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
    const context = this.createSendContext(sendingMessage, gatewayOptions);

    try {
      const reuslt = await this.executor.exec(context, async (ctx) => {
        return await this.sendMessage(ctx.parameters.currentMessage, ctx);
      });

      if (this.logger) {
        this.logger.info(
          template(this.loggerTpl.success, {
            senderName: this.senderName,
            messageId: sendingMessage.id!,
            speed: String(this.getDuration(reuslt))
          })
        );
      }

      return reuslt;
    } catch (error) {
      return this.handleError(error, context);
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
