import type { MessageSenderConfig } from '@/base/focusBar/impl/MessageSender';
import { MessageSender } from '@/base/focusBar/impl/MessageSender';
import { ChatMessageRoleType, type ChatMessage } from './ChatMessage';
import type { ChatMessageStore } from './ChatMessageStore';
import type { ChatMessageBridgeInterface } from './interface';
import type { TextAreaRef } from 'antd/es/input/TextArea';

export class ChatMessageBridge<T = string>
  extends MessageSender<ChatMessage<T>>
  implements ChatMessageBridgeInterface<T>
{
  protected ref: TextAreaRef | null = null;

  constructor(
    readonly messages: ChatMessageStore<T>,
    config?: MessageSenderConfig
  ) {
    super(messages, config);
  }

  override getMessageStore(): ChatMessageStore<T> {
    return this.messages;
  }

  onChangeContent(content: T): void {
    this.messages.changeCurrent({ content });
  }

  disableSend(): void {
    this.messages.changeDisabledSend(true);
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

  sendUser(): Promise<ChatMessage<T>>;
  sendUser(message: ChatMessage<T>): Promise<ChatMessage<T>>;
  async sendUser(message?: ChatMessage<T>): Promise<ChatMessage<T>> {
    const currentMessage = message ?? this.messages.getCurrentMessage();

    if (!this.messages.isMessage(currentMessage)) {
      throw new Error('No current message');
    }

    // 如果消息不是用户消息，则抛出错误
    if (currentMessage.role !== ChatMessageRoleType.USER) {
      throw new Error('Current message is not a user message');
    }

    this.disableSend();

    const reuslt = await this.send(currentMessage);

    this.messages.resetCurrentMessage();

    this.focus();

    this.enableSend();

    return reuslt;
  }
}
