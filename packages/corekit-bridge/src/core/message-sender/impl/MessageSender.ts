import { ExecutorError, type ExecutorPlugin } from '@qlover/fe-corekit';
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
import type { LoggerInterface } from '@qlover/logger';
import { AbortablePromiseRunner } from './AbortablePromiseRunner';
import { gatewayOptionsWithAbort } from '../utils/callbackWithAbort';

/**
 * Configuration options for message sender
 *
 * Defines behavior, logging, gateway integration, and error handling
 * for the message sender instance.
 *
 * @since 1.11.0 - Abort control removed from core MessageSender.
 * Use AbortPlugin for abort functionality.
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
 */

/**
 * Message sender implementation
 *
 * Core class responsible for orchestrating message sending operations,
 * including gateway communication, plugin execution, error handling,
 * and streaming support.
 *
 * Core features:
 * - Message sending with plugin pipeline
 * - Gateway integration and abstraction
 * - Streaming and normal mode support
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
 *
 * @example Use  abort control
 *
 * v1.11.0 - Abort control removed from core MessageSender
 *
 * Starting from version 1.11.0, MessageSender no longer provides built-in abort control.
 * For abort functionality, please use the AbortPlugin:
 *
 * ```typescript
 * import { AbortPlugin } from '@qlover/fe-corekit';
 *
 *
 * // Add abort plugin for cancellation support
 * // MessageSenderAbortPlugin is a subclass of AbortPlugin that is specific to message sender
 * // Inner modified the getConfig method to ensure type safety, and the assignSignalToContext method to ensure that the signal is correctly injected into the context
 * const abortPlugin = new MessageSenderAbortPlugin({
 *   abortManager: new RequestAbortManager('MessageSender')
 * });
 *
 * const sender = new MessageSender(store, { gateway: myGateway })
 *   .use(abortPlugin);
 *
 * // Send message with abort control
 * const promise = sender.send({ abortId: 'message-send', content: 'Hello' });
 *
 * // Cancel the operation, use abortId
 * abortPlugin.abort('message-send');
 * ```
 *
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
  };

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
    protected readonly config: MessageSenderConfig = {}
  ) {
    this.senderName = config?.senderName || defaultSenderName;
    this.executor = new MessageSenderExecutor();
  }

  /**
   * Get the message store instance
   *
   * Returns the MessagesStore instance used by this sender to manage
   * message state, storage, and retrieval operations.
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
   * Returns the MessageGetwayInterface instance configured for this sender,
   * which handles the actual message transmission to external services.
   * Returns undefined if no gateway was configured during initialization.
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
   * Registers an ExecutorPlugin to be executed during the message sending pipeline.
   * Plugins are executed in registration order and can intercept, modify, or extend
   * the sending process. Returns the sender instance to enable method chaining.
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
   * Create gateway options with abort support
   *
   * Processes and enhances the gateway options from the execution context.
   * Wraps callback functions (onConnected, onChunk, etc.) with abort signal checking
   * using `gatewayOptionsWithAbort`, ensuring callbacks are cancelled when abort occurs.
   * Also resets streaming runtime counters for proper plugin execution.
   *
   * @param context - Execution context containing gateway options
   * @returns Enhanced gateway options with abort-aware callbacks, or undefined if no options
   */
  protected createGatewayOptions(
    context: MessageSenderPluginContext<MessageType>
  ): GatewayOptions<MessageType> | undefined {
    const gatewayOptions = context.parameters.gatewayOptions;

    if (typeof gatewayOptions !== 'object' || gatewayOptions == null) {
      return undefined;
    }

    // Extract only necessary references to minimize closure capture
    const originalOnChunk = gatewayOptions.onChunk;
    const originalOnConnected = gatewayOptions.onConnected;
    const executor = this.executor;

    executor.resetRuntimesStreamTimes(context);

    return gatewayOptionsWithAbort({
      ...gatewayOptions,
      onConnected: async () => {
        await executor.runConnected(context);

        originalOnConnected?.();
      },
      onChunk: async (chunk) => {
        // Pass context for plugin hooks, but don't capture it in closure unnecessarily
        const result = await executor.runStream(chunk, context);

        if (originalOnChunk) {
          originalOnChunk(result || chunk);
        }
      }
    });
  }

  /**
   * Create gateway promise with abort handling
   *
   * Creates a Promise that wraps the gateway's sendMessage call with abort signal support.
   * Uses AbortablePromiseRunner.raceWithAbort to ensure the gateway operation can be
   * cancelled when the abort signal is triggered. Validates that the gateway is properly
   * configured before attempting to send.
   *
   * @param message - Message to send through the gateway
   * @param gatewayOptions - Gateway options including abort signal
   * @returns Promise that resolves to gateway response or rejects on abort/error
   */
  protected createGatewayPromise(
    message: MessageType,
    gatewayOptions: GatewayOptions<MessageType> | undefined
  ): Promise<unknown> {
    const gateway = this.getGateway();

    if (
      typeof gateway === 'object' &&
      gateway != null &&
      typeof gateway.sendMessage === 'function'
    ) {
      // gateway maybe not handle signal?
      // so we need to wrap the promise with AbortablePromiseRunner
      return AbortablePromiseRunner.raceWithAbort(
        gateway.sendMessage(message, gatewayOptions),
        gatewayOptions?.signal
      );
    }

    this.config.logger?.warn('Gateway is not a valid object');

    return Promise.resolve(null);
  }

  /**
   * Send message through gateway
   *
   * Core method that handles the actual message transmission through the
   * configured gateway. Creates gateway options with abort support, initiates
   * the gateway promise, waits for completion, and merges the response data
   * back into the message with SENT status. Updates message loading state
   * and end time upon completion.
   *
   * @param message - Message to send
   * @param context - Execution context with sender parameters
   * @returns Sent message with response data merged
   */
  protected async sendMessage(
    message: MessageType,
    context: MessageSenderPluginContext<MessageType>
  ): Promise<MessageType> {
    const gatewayOptions = this.createGatewayOptions(context);
    const gatewayPromise = this.createGatewayPromise(message, gatewayOptions);

    return this.messages.mergeMessage(message, {
      status: MessageStatus.SENT,
      result: await gatewayPromise!,
      loading: false,
      endTime: Date.now()
    } as Partial<MessageType>);
  }

  /**
   * Generate a sending message from partial data
   *
   * Creates a complete message object from partial input data, setting up
   * all required fields for sending. Sets status to SENDING, loading to true,
   * initializes startTime to current timestamp, clears endTime, and resets
   * any existing error state.
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
   * async errors to MESSAGE_SENDER_ERROR format for consistency, logs failures
   * using the configured logger, and either throws the error or returns a
   * failed message based on the throwIfError configuration.
   *
   * **Status handling:**
   * Allows plugins to modify final status. If status is still `SENDING` at
   * this point, it's reset to `FAILED`. Updates message loading state to false,
   * sets error field, and records end time.
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
      processedError = new ExecutorError(this.messageSenderErrorId, error);
    }

    if (this.config?.throwIfError) {
      throw processedError;
    }

    const { currentMessage } = context;
    const endTime = currentMessage.endTime || Date.now();
    // Allow plugins to modify final status; may not always be FAILED in some cases
    // If status is still SENDING at this final step, reset to FAILED
    const currentStatus = currentMessage.status;
    const status =
      currentStatus === MessageStatus.SENDING
        ? MessageStatus.FAILED
        : currentStatus;

    if (this.config.logger) {
      this.config.logger.debug(
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
   * merging configuration from the sender instance with options provided for
   * this specific send operation. Combines gateway options from config and
   * parameters, sets the message ID, and creates the full context with store,
   * message, error handling settings, gateway, and options.
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
   * error handling, and logging. Generates a sending message from partial input,
   * creates execution context, runs through plugin pipeline, and handles success/failure.
   *
   * **Behavior:**
   * - Prepares message with SENDING status and timestamps
   * - Executes plugin pipeline with before/after hooks
   * - Sends through gateway with abort support
   * - Logs success with duration metrics
   * - If `throwIfError=true`: Throws on send failure
   * - If `throwIfError=false` (default): Returns error message on failure
   * - If `gatewayOptions` provided: Uses specified configuration
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

      if (this.config.logger) {
        this.config.logger.info(
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
   * Calculates the time taken to send a message in milliseconds by subtracting
   * the startTime from endTime. Returns 0 if message has no endTime (indicating
   * the message is still in progress or failed before completion).
   *
   * @param message - Message to calculate duration for
   * @returns Duration in milliseconds, or 0 if message not completed
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
