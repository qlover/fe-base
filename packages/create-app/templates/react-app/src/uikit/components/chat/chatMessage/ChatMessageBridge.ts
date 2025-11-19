import type { MessageSenderConfig } from '@/base/focusBar/impl/MessageSender';
import { MessageSender } from '@/base/focusBar/impl/MessageSender';
import { MessageStatus } from '@/base/focusBar/impl/MessagesStore';
import type { GatewayOptions } from '@/base/focusBar/interface/MessageGetwayInterface';
import { ChatMessageRoleType, type ChatMessage } from './ChatMessage';
import type { ChatMessageStore } from './ChatMessageStore';
import type {
  ChatMessageBridgeInterface,
  ChatMessageBridgePlugin
} from './interface';
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

  onChangeContent(content: T): void {
    const firstDraft = this.messages.getFirstDraftMessage();

    // 如果已经有草稿消息，更新它的内容
    if (firstDraft && firstDraft.id) {
      this.messages.updateDraftMessage(firstDraft.id, {
        content
      });
    } else {
      // 如果没有草稿消息，创建一个新的
      this.messages.addDraftMessage({
        content,
        role: ChatMessageRoleType.USER
      });
    }
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
    return this.messageSender.send(messages, gatewayOptions);
  }

  /**
   * 发送消息
   *
   * - 如果直接传入一个对象不存在则不允许发送, 只能允许发送草稿消息和重发历史消息
   *
   * @param message - 消息对象
   * @param gatewayOptions - 网关选项
   */
  send(
    message?: ChatMessage<T>,
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>> {
    const targetMessage = this.messages.getReadySendMessage(message);

    if (!targetMessage) {
      throw new Error('No message to send');
    }

    if (targetMessage.loading) {
      return Promise.resolve(targetMessage);
    }

    return this.sendMessage(targetMessage, gatewayOptions);
  }

  getSendingMessage(): ChatMessage<T> | null {
    return (
      this.messages
        .getMessages()
        .find((msg) => msg.status === MessageStatus.SENDING) || null
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
