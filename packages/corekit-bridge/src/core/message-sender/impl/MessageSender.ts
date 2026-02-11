import {
  type AborterConfig,
  type AborterId,
  type AborterInterface,
  type ExecutorContextInterface,
  type LifecyclePluginInterface,
  raceWithAbort
} from '@qlover/fe-corekit';
import { type MessageSenderExecutor } from './MessageSenderExecutor';
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
  type MessageSenderContext,
  type MessageSenderOptions,
  type MessageSenderPlugin
} from '../interface/MessageSenderPlugin';
import { SenderGateway } from './SenderGateway';
import { type SenderGatewayInterface } from '../interface/SenderGatewayInterface';

/**
 * Default sender name constant
 */
const defaultSenderName = 'MessageSender';

const defaultLoggerTpl = {
  failed: '[${senderName}] ${messageId} failed',
  success: '[${senderName}] ${messageId} success, speed: ${speed}ms'
} as const;

export interface MessageSenderConfig<
  MessageType extends MessageStoreMsg<unknown, unknown>
> extends MessageSenderBaseConfig {
  /**
   * Plugin executor
   *
   * Executor for managing the plugin pipeline.
   *
   * If executor is not specified, the send operation will not be executed.
   * and can't use the `use` method to register plugins.
   *
   * @example
   * ```typescript
   * const executor = new MessageSenderExecutor();
   * executor.use(validationPlugin);
   * executor.use(loggingPlugin);
   * executor.use(transformPlugin);
   * ```
   */
  executor?: MessageSenderExecutor<MessageType>;

  /**
   * Aborter for managing abort signals and operation cancellation
   *
   * Provides centralized abort signal management for message send operations.
   * When configured with `AborterPlugin`, enables automatic signal creation
   * and cleanup for each send operation.
   *
   * **Important notes:**
   * - Required for `stop()` and `stopAll()` methods to work
   * - Must be used with `AborterPlugin` for automatic signal management
   * - Without aborter: `stop()` returns `false`, send operations cannot be cancelled
   * - With aborter but no plugin: Manual signal registration required
   *
   * **Recommended setup:**
   * ```typescript
   * const aborter = new Aborter('MessageSenderAborter');
   * const sender = new MessageSender(store, {
   *   aborter,
   *   executor: new MessageSenderExecutor()
   * });
   *
   * // Register AborterPlugin for automatic signal management
   * sender.use(new AborterPlugin({
   *   aborter,
   *   getConfig: (params) => ({
   *     abortId: params.currentMessage.id,
   *     signal: params.gatewayOptions?.signal
   *   })
   * }));
   * ```
   *
   * @example Manual abort control
   * ```typescript
   * // Without plugin, use custom signal
   * const controller = new AbortController();
   * sender.send({ content: 'Hello' }, { signal: controller.signal });
   * controller.abort(); // Manual cancellation
   * ```
   */
  aborter?: AborterInterface<AborterConfig>;

  /**
   * Sender gateway
   *
   * Sender gateway for managing the message send operation.
   *
   * @default `new SenderGateway()`
   * @example
   * ```typescript
   * const senderGateway = new SenderGateway();
   * senderGateway.createGatewayOptions(gatewayOptions, context);
   * ```
   */
  senderGateway?: SenderGatewayInterface<MessageType>;

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
> implements MessageSenderInterface<MessageType> {
  protected readonly senderName: string;

  protected loggerTpl: {
    failed: string;
    success: string;
  };

  protected readonly senderGateway: SenderGatewayInterface<MessageType>;

  constructor(
    protected readonly messages: MessagesStore<MessageType>,
    protected readonly config?: MessageSenderConfig<MessageType>
  ) {
    this.senderName = config?.senderName || defaultSenderName;
    this.senderGateway =
      config?.senderGateway || new SenderGateway(config?.executor);

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
  public use(
    plugin:
      | MessageSenderPlugin<MessageType>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | LifecyclePluginInterface<ExecutorContextInterface<any, any>>
  ): this {
    if (!this.executor) {
      throw new Error(this.senderName + ' executor is not set');
    }

    this.executor.use(plugin);
    return this;
  }

  /**
   * Stop sending a specific message
   *
   * Cancels an ongoing message send operation by message ID. This method
   * delegates to the configured aborter to trigger the abort signal.
   *
   * **Prerequisites:**
   * - Aborter must be configured in constructor
   * - `AborterPlugin` must be registered for automatic signal management
   * - Message must be sent without custom signal (plugin creates signal automatically)
   *
   * **Behavior:**
   * - With aborter + plugin: Aborts the operation, triggers `AbortError`
   * - Without aborter: Returns `false`, no effect
   * - With custom signal: Returns `true` but doesn't affect custom signal
   *
   * **Result handling:**
   * - Message status set to `STOPPED` by `SenderStrategyPlugin`
   * - `gatewayOptions.onAborted` callback invoked if provided
   * - Resources cleaned up automatically by `AborterPlugin`
   *
   * @param messageId - ID of the message to stop sending
   * @returns `true` if abort signal was triggered, `false` if aborter not configured
   *
   * @example Basic usage with AborterPlugin
   * ```typescript
   * // Setup with AborterPlugin
   * const aborter = new Aborter();
   * sender.use(new AborterPlugin({ aborter, getConfig: ... }));
   *
   * // Send message (plugin creates signal automatically)
   * const promise = sender.send({ id: 'msg-1', content: 'Hello' });
   *
   * // Stop the send operation
   * const stopped = sender.stop('msg-1');
   * console.log('Stopped:', stopped); // true
   *
   * // Promise rejects with AbortError
   * const result = await promise;
   * console.log('Status:', result.status); // 'stopped'
   * ```
   *
   * @example With custom signal (stop has no effect)
   * ```typescript
   * const controller = new AbortController();
   * sender.send(
   *   { id: 'msg-1', content: 'Hello' },
   *   { signal: controller.signal }
   * );
   *
   * // This returns true but doesn't affect the custom signal
   * sender.stop('msg-1');
   *
   * // Must use controller to actually abort
   * controller.abort();
   * ```
   *
   * @example With abort callback
   * ```typescript
   * sender.send(
   *   { id: 'msg-1', content: 'Hello' },
   *   {
   *     onAborted: (msg) => {
   *       console.log('Message aborted:', msg.id);
   *       // Cleanup UI, show notification, etc.
   *     }
   *   }
   * );
   *
   * sender.stop('msg-1'); // Triggers onAborted callback
   * ```
   */
  public stop(messageId: AborterId): boolean {
    return this.aborter?.abort(messageId) || false;
  }

  /**
   * Stop all ongoing message sends
   *
   * Cancels all currently active message send operations by triggering
   * abort signals for all registered operations in the aborter.
   *
   * **Prerequisites:**
   * - Aborter must be configured in constructor
   * - `AborterPlugin` must be registered for automatic signal management
   *
   * **Behavior:**
   * - Aborts all operations managed by the aborter
   * - Each operation receives `AbortError` and status set to `STOPPED`
   * - `onAborted` callbacks invoked for each aborted operation
   * - Resources cleaned up automatically by `AborterPlugin`
   * - Operations with custom signals are not affected
   *
   * @example Basic usage
   * ```typescript
   * // Send multiple messages
   * sender.send({ id: 'msg-1', content: 'Hello' });
   * sender.send({ id: 'msg-2', content: 'World' });
   * sender.send({ id: 'msg-3', content: 'Test' });
   *
   * // Cancel all pending sends
   * sender.stopAll();
   * console.log('All sends cancelled');
   * ```
   *
   * @example With cleanup handling
   * ```typescript
   * // Setup abort handlers
   * const sendWithHandler = (content: string) => {
   *   return sender.send(
   *     { content },
   *     {
   *       onAborted: (msg) => {
   *         console.log('Aborted:', msg.id);
   *         // Cleanup for this specific message
   *       }
   *     }
   *   );
   * };
   *
   * sendWithHandler('Message 1');
   * sendWithHandler('Message 2');
   *
   * // Triggers onAborted for all messages
   * sender.stopAll();
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
    options: MessageSenderOptions<MessageType>,
    context?: MessageSenderContext<MessageType>
  ): Promise<MessageType> {
    const { currentMessage, gatewayOptions } = options;

    const contextMessage = context?.parameters.currentMessage ?? currentMessage;

    const gatewayOpts = this.senderGateway.createGatewayOptions(
      context?.parameters.gatewayOptions ??
        gatewayOptions ??
        this.config?.gatewayOptions ??
        {},
      context
    );

    const gatewayPromise = this.getGateway()?.sendMessage(
      contextMessage,
      gatewayOpts
    );

    const result = await raceWithAbort(gatewayPromise!, gatewayOpts?.signal);

    return this.messages.mergeMessage(contextMessage, {
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
   * Processes errors that occur during message sending. Merges error information
   * with the current message state, logs failures, and either throws or returns
   * an error message based on configuration.
   *
   * **Error flow:**
   * 1. Check `throwIfError` configuration
   * 2. Retrieve current message state from store
   * 3. Log failure if logger configured
   * 4. Merge error with message state
   * 5. Set status to `FAILED` if still `SENDING`
   * 6. Return error message or throw
   *
   * **Status handling:**
   * Plugins can modify the final status before this method is called.
   * Common plugin-modified statuses:
   * - `STOPPED`: Set by `SenderStrategyPlugin` for abort errors
   * - `FAILED`: Default for regular errors (set here if still `SENDING`)
   *
   * **Important notes:**
   * - Always retrieves latest message state from store
   * - Preserves plugin-modified status (e.g., `STOPPED`)
   * - Sets `loading=false` and `endTime` if not already set
   * - Error object attached to message for inspection
   *
   * @param error - Error that occurred during send (any type)
   * @param options - Message sender options containing current message and config
   * @returns Message with error state merged
   *
   * @throws Error when `throwIfError` configuration is `true`
   *
   * @example Error message structure
   * ```typescript
   * // Returned error message structure:
   * {
   *   id: 'msg-1',
   *   content: 'Hello',
   *   status: 'failed', // or 'stopped' if aborted
   *   error: Error('Network error'),
   *   loading: false,
   *   startTime: 1234567890,
   *   endTime: 1234567900
   * }
   * ```
   */
  protected async handleError(
    error: unknown,
    options: MessageSenderOptions<MessageType>
  ): Promise<MessageType> {
    if (options.throwIfError) {
      throw error;
    }

    const sendingMessage = options.currentMessage;

    const storeMessage = this.messages.getMessageById(sendingMessage.id!);

    if (this.logger) {
      this.logger.debug(
        template(this.loggerTpl.failed, {
          senderName: this.senderName,
          messageId: sendingMessage.id!
        })
      );
    }

    const result = this.messages.mergeMessage(sendingMessage, storeMessage!);

    return Object.assign(result, {
      error: error,
      loading: false,
      status:
        result.status === MessageStatus.SENDING
          ? MessageStatus.FAILED
          : result.status,
      endTime: result.endTime || Date.now()
    } as MessageType);
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
    return {
      store: this.messages,
      currentMessage: sendingMessage,
      throwIfError: this.config?.throwIfError,
      gateway: this.config?.gateway,
      gatewayOptions: {
        ...this.config?.gatewayOptions,
        ...gatewayOptions
      }
    };
  }

  /**
   * Send a message through the sender pipeline
   *
   * Main public API for sending messages. Orchestrates the complete send lifecycle
   * including message preparation, plugin execution, gateway communication,
   * error handling, and performance logging.
   *
   * **Send flow:**
   * 1. Generate sending message with `SENDING` status
   * 2. Create send options with merged configuration
   * 3. Execute through plugin pipeline (if executor configured)
   * 4. Send via gateway with abort signal support
   * 5. Handle success/error and log performance
   * 6. Return final message with result or error
   *
   * **Error handling:**
   * - `throwIfError=true`: Throws error, no message returned
   * - `throwIfError=false` (default): Returns message with error state
   * - Plugins can intercept and modify error handling
   *
   * **Abort signal management:**
   * - No signal provided + `AborterPlugin`: Plugin creates signal automatically (stoppable via `stop()`)
   * - Custom signal provided: Uses custom signal (must abort manually, `stop()` has no effect)
   * - No signal + no plugin: Operation not cancellable
   *
   * **Resource cleanup:**
   * - Managed automatically by `AborterPlugin` when configured
   * - Event listeners removed after operation completes
   * - Abort controllers cleaned up properly
   *
   * @override
   * @param message - Partial message object to send (ID generated if not provided)
   * @param gatewayOptions - Optional gateway configuration for this specific send
   * @returns Promise resolving to sent message with response data or error state
   *
   * @throws Error when `throwIfError` is `true` and send fails
   *
   * @example Basic send
   * ```typescript
   * const result = await sender.send({
   *   content: 'Hello, world!'
   * });
   * console.log('Sent:', result.id, result.status);
   * // Output: Sent: msg-123 sent
   * ```
   *
   * @example With error handling
   * ```typescript
   * const result = await sender.send({ content: 'Hello' });
   * if (result.status === 'failed') {
   *   console.error('Send failed:', result.error);
   *   // Retry logic here
   * }
   * ```
   *
   * @example With streaming
   * ```typescript
   * await sender.send(
   *   { content: 'Generate story' },
   *   {
   *     stream: true,
   *     onConnected: () => {
   *       console.log('Stream connected');
   *     },
   *     onChunk: (chunk) => {
   *       // Update UI with partial content
   *       updateUI(chunk.content);
   *     },
   *     onComplete: (msg) => {
   *       console.log('Stream complete:', msg.id);
   *     }
   *   }
   * );
   * ```
   *
   * @example With automatic abort (AborterPlugin)
   * ```typescript
   * // Setup with AborterPlugin
   * sender.use(new AborterPlugin({ aborter, getConfig: ... }));
   *
   * // Send message (plugin creates signal automatically)
   * const promise = sender.send({ id: 'msg-1', content: 'Hello' });
   *
   * // Can stop via sender.stop()
   * setTimeout(() => sender.stop('msg-1'), 1000);
   *
   * const result = await promise;
   * console.log('Status:', result.status); // 'stopped'
   * ```
   *
   * @example With custom abort control
   * ```typescript
   * const controller = new AbortController();
   *
   * const promise = sender.send(
   *   { content: 'Hello' },
   *   {
   *     signal: controller.signal,
   *     onAborted: (msg) => {
   *       console.log('Aborted:', msg.id);
   *     }
   *   }
   * );
   *
   * // Must use controller to abort (sender.stop() won't work)
   * setTimeout(() => controller.abort(), 5000);
   *
   * try {
   *   await promise;
   * } catch (error) {
   *   console.log('Send cancelled');
   * }
   * ```
   *
   * @example With timeout
   * ```typescript
   * const result = await sender.send(
   *   { content: 'Hello' },
   *   { timeout: 5000 } // 5 second timeout
   * );
   * ```
   */
  public async send(
    message: Partial<MessageType>,
    gatewayOptions?: GatewayOptions<MessageType>
  ): Promise<MessageType> {
    const sendingMessage = this.generateSendingMessage(message);
    const options = this.createSendOptions(sendingMessage, gatewayOptions);

    try {
      const result = this.executor
        ? await this.sendMessageExecutor(options, this.executor)
        : await this.sendMessage(options);

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

  protected sendMessageExecutor(
    options: MessageSenderOptions<MessageType>,
    executor: MessageSenderExecutor<MessageType>
  ): Promise<MessageType> {
    return executor.exec(options, (ctx) =>
      this.sendMessage(ctx.parameters, ctx)
    );
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
