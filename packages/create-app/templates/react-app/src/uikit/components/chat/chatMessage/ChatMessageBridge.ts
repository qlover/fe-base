import type { MessageSenderConfig } from '@/base/focusBar/impl/MessageSender';
import { MessageSender } from '@/base/focusBar/impl/MessageSender';
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
    const lastDraft = this.messages.getLastDraftMessage();

    // 如果已经有草稿消息，更新它的内容
    if (lastDraft && lastDraft.id) {
      this.messages.updateDraftMessage(lastDraft.id, {
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

  disableSend(): void {
    // this.messages.changeDisabledSend(true);
  }

  enableSend(): void {
    this.messages.changeDisabledSend(false);
  }

  setRef(ref: unknown): void {
    this.ref = ref as TextAreaRef;
  }

  focus(): void {
    requestAnimationFrame(() => {
      this.ref?.focus();
    });
  }

  async send(
    message?: ChatMessage<T>,
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>> {
    // 如果没有传入消息，则从 draftMessages 中取出最后一个
    let currentMessage = message;

    if (!currentMessage) {
      currentMessage = this.messages.popLastDraftMessage() ?? undefined;
    }

    if (!this.messages.isMessage(currentMessage)) {
      throw new Error('No current message to send');
    }

    // 如果消息不是用户消息，则抛出错误
    if (currentMessage.role !== ChatMessageRoleType.USER) {
      throw new Error('Current message is not a user message');
    }

    this.disableSend();

    const result = await this.messageSender.send(
      currentMessage,
      gatewayOptions
    );

    this.focus();

    this.enableSend();

    return result;
  }

  stop(messageId?: string): boolean {
    if (messageId) {
      return this.messageSender.stop(messageId);
    }

    // 停止最后一个正在 loading 的消息
    const messages = this.messages.getMessages();
    const loadingMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.loading);

    if (loadingMessage && loadingMessage.id) {
      return this.messageSender.stop(loadingMessage.id);
    }

    return false;
  }

  /**
   * 停止所有正在发送的消息
   */
  stopAll(): void {
    this.messageSender.stopAll();
  }
}
