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

export class ChatMessageBridge<T = string>
  implements ChatMessageBridgeInterface<T>
{
  protected ref: TextAreaRef | null = null;
  protected readonly messageSender: MessageSender<ChatMessage<T>>;

  constructor(
    protected readonly messages: ChatMessageStore<T>,
    config?: MessageSenderConfig
  ) {
    this.messageSender = new MessageSender(messages, config);
  }

  use(plugin: ChatMessageBridgePlugin<T> | ChatMessageBridgePlugin<T>[]): this {
    if (Array.isArray(plugin)) {
      plugin.forEach((p) => this.messageSender.use(p));
    } else {
      this.messageSender.use(plugin);
    }
    return this;
  }

  getMessageStore(): ChatMessageStore<T> {
    return this.messages;
  }

  /**
   * 禁用规则
   * 1. 如果正在 streaming，则不允许发送
   * 2. 如果正在 sending，则不允许发送

   */
  getDisabledSend(params?: DisabledSendParams<T>): boolean {
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

  onChangeContent(content: T): void {
    const firstDraft = this.getFirstDraftMessage();

    // 如果已经有草稿消息，更新它的内容
    if (firstDraft && firstDraft.id) {
      this.messages.updateDraftMessage(firstDraft.id, {
        content
      });
    } else {
      // 如果没有草稿消息，创建一个新的
      this.messages.addDraftMessage({
        content,
        role: ChatMessageRole.USER
      });
    }
  }

  getFirstDraftMessage(): ChatMessage<T> | null {
    return this.messages.getFirstDraftMessage();
  }

  setRef(ref: unknown): void {
    this.ref = ref as TextAreaRef;
  }

  focus(): void {
    requestAnimationFrame(() => {
      this.ref?.focus();
    });
  }

  sendMessage(
    messages: ChatMessage<T>,
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>> {
    if (this.messages.state.disabledSend) {
      throw new Error('Send is disabled');
    }

    return this.messageSender.send(messages, gatewayOptions);
  }

  /**
   * 发送消息
   *
   * - 如果直接传入一个对象不存在则不允许发送, 只能允许发送草稿消息和重发历史消息
   * - 如果正在 streaming，则不允许发送
   * - 如果正在 loading，则不允许发送
   * - 如果没有可以发送的消息，则不允许发送
   *
   * @param message - 消息对象
   * @param gatewayOptions - 网关选项
   */
  send(
    message?: ChatMessage<T>,
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>> {
    const disabledSend = this.getDisabledSend();

    if (disabledSend) {
      throw new Error('Send is not allowed');
    }

    // 3. 如果没有可以发送的消息，则不允许发送
    const targetMessage = this.messages.getReadySendMessage(message);
    if (!targetMessage) {
      throw new Error('No message to send');
    }

    // 4. 如果正在 loading，则不允许发送
    if (targetMessage.loading) {
      return Promise.resolve(targetMessage);
    }

    return this.sendMessage(targetMessage, gatewayOptions);
  }

  getSendingMessage(messages?: ChatMessage<T>[]): ChatMessage<T> | null {
    messages = messages || this.messages.getMessages();
    return (
      messages.find(
        (msg) =>
          msg.status === MessageStatus.SENDING &&
          msg.role === ChatMessageRole.USER
      ) || null
    );
  }

  stop(messageId?: string): boolean {
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
   * 停止所有正在发送的消息
   */
  stopAll(): void {
    this.messageSender.stopAll();
  }
}
