import {
  MessageSender,
  ChatMessageRole,
  MessageStatus
} from '@qlover/corekit-bridge';
import type {
  ChatMessage,
  ChatMessageStore,
  ChatMessageBridgeInterface,
  ChatMessageBridgePlugin,
  DisabledSendParams,
  MessageSenderConfig,
  GatewayOptions
} from '@qlover/corekit-bridge';
import type { TextAreaRef } from 'antd/es/input/TextArea';

export class ChatMessageBridge<
  T = string
> implements ChatMessageBridgeInterface<T> {
  protected ref: TextAreaRef | null = null;
  protected readonly messageSender: MessageSender<ChatMessage<T>>;

  constructor(
    protected readonly messages: ChatMessageStore<T>,
    config?: MessageSenderConfig
  ) {
    this.messageSender = new MessageSender(messages, config);
  }

  public use(
    plugin: ChatMessageBridgePlugin<T> | ChatMessageBridgePlugin<T>[]
  ): this {
    if (Array.isArray(plugin)) {
      plugin.forEach((p) => this.messageSender.use(p));
    } else {
      this.messageSender.use(plugin);
    }

    return this;
  }

  public getMessageStore(): ChatMessageStore<T> {
    return this.messages;
  }

  /**
   * Disable rules
   * 1. If streaming, don't allow sending
   * 2. If sending, don't allow sending
   */
  public getDisabledSend(params?: DisabledSendParams<T>): boolean {
    const disabledSend =
      params?.disabledSend || this.messages.state.disabledSend;

    if (disabledSend || this.messages.state.streaming) {
      return true;
    }

    const sendingMessage = this.getSendingMessage();
    if (sendingMessage) {
      return true;
    }

    return false;
  }

  public onChangeContent(content: T): void {
    const firstDraft = this.getFirstDraftMessage();

    // If draft message exists, update its content
    if (firstDraft && firstDraft.id) {
      this.messages.updateDraftMessage(firstDraft.id, {
        content
      });
    } else {
      // If no draft message, create a new one
      this.messages.addDraftMessage({
        content,
        role: ChatMessageRole.USER
      });
    }
  }

  public getFirstDraftMessage(): ChatMessage<T> | null {
    return this.messages.getFirstDraftMessage();
  }

  public setRef(ref: unknown): void {
    this.ref = ref as TextAreaRef;
  }

  public focus(): void {
    requestAnimationFrame(() => {
      this.ref?.focus();
    });
  }

  public sendMessage(
    messages: ChatMessage<T>,
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>> {
    if (this.messages.state.disabledSend) {
      throw new Error('Send is disabled');
    }

    return this.messageSender.send(messages, gatewayOptions);
  }

  /**
   * Send message
   *
   * - If passing an object that doesn't exist, sending is not allowed; only draft messages and resending history messages are allowed
   * - If streaming, sending is not allowed
   * - If loading, sending is not allowed
   * - If no message to send, sending is not allowed
   *
   * @param message - Message object
   * @param gatewayOptions - Gateway options
   */
  public send(
    message?: ChatMessage<T>,
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>> {
    const disabledSend = this.getDisabledSend();

    if (disabledSend) {
      throw new Error('Send is not allowed');
    }

    // 3. If no message to send, sending is not allowed
    const targetMessage = this.messages.getReadySendMessage(message);

    if (!targetMessage) {
      throw new Error('No message to send');
    }

    // 4. If loading, sending is not allowed
    if (targetMessage.loading) {
      return Promise.resolve(targetMessage);
    }

    return this.sendMessage(targetMessage, gatewayOptions);
  }

  public getSendingMessage(messages?: ChatMessage<T>[]): ChatMessage<T> | null {
    messages = messages || this.messages.getMessages();

    return (
      messages.find(
        (msg) =>
          msg.status === MessageStatus.SENDING &&
          msg.role === ChatMessageRole.USER
      ) || null
    );
  }

  public stop(messageId?: string): boolean {
    if (!messageId) {
      const sendingMessage = this.getSendingMessage();
      if (sendingMessage) {
        messageId = sendingMessage.id;
      }
    }

    if (!messageId) {
      return false;
    }

    return this.messageSender.stop(messageId);
  }

  /**
   * Stop all sending messages
   */
  public stopAll(): void {
    this.messageSender.stopAll();
  }
}
