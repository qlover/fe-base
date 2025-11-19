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
    this.messages.changeCurrent({ content });
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
    const currentMessage = message ?? this.messages.getCurrentMessage();

    if (!this.messages.isMessage(currentMessage)) {
      throw new Error('No current message');
    }

    // 如果消息不是用户消息，则抛出错误
    if (currentMessage.role !== ChatMessageRoleType.USER) {
      throw new Error('Current message is not a user message');
    }

    this.disableSend();

    const reuslt = await this.messageSender.send(
      currentMessage,
      gatewayOptions
    );

    this.focus();

    this.enableSend();

    return reuslt;
  }

  sendStream(
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>> {
    return this.send(
      undefined,
      Object.assign(
        { stream: true } as GatewayOptions<ChatMessage<T>>,
        gatewayOptions
      )
    );
  }

  /**
   * 停止指定消息的发送
   * @param messageId - 消息ID
   * @returns 是否成功停止
   */
  stop(messageId: string): boolean {
    return this.messageSender.stop(messageId);
  }

  /**
   * 停止所有正在发送的消息
   */
  stopAll(): void {
    this.messageSender.stopAll();
  }
}
