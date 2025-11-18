import { MessagesStore } from '@/base/focusBar/impl/MessagesStore';
import { ChatMessage, ChatMessageRoleType } from './ChatMessage';
import type {
  ChatMessageStoreInterface,
  ChatMessageStoreStateInterface
} from './interface';

export class ChatMessageStoreState<T = unknown>
  implements ChatMessageStoreStateInterface<T>
{
  messages: ChatMessage<T>[] = [];

  /**
   * 表示当前真正输入的消息
   */
  currentMessage: ChatMessage<T> | null = null;

  /**
   * 是否禁用发送
   */
  disabledSend: boolean = false;
}

export class ChatMessageStore<T = unknown>
  extends MessagesStore<ChatMessage<T>, ChatMessageStoreState<T>>
  implements ChatMessageStoreInterface<T>
{
  override createMessage<M extends ChatMessage<T>>(
    message: Partial<M> = {} as Partial<M>
  ): M {
    return new ChatMessage<T>(super.createMessage(message)) as M;
  }

  override isMessage<M extends ChatMessage<T>>(message: unknown): message is M {
    return message instanceof ChatMessage;
  }

  changeCurrent<M extends ChatMessage<T>>(message: Partial<M>): M {
    let currentMessage = this.getCurrentMessage() as M;

    // 如果当前没有消息，则创建一个新消息
    if (!currentMessage) {
      currentMessage = this.createMessage();
    }

    const newMessage = this.mergeMessage(currentMessage, message);

    this.emit(this.cloneState({ currentMessage: newMessage }));

    return newMessage;
  }

  changeDisabledSend(disabled: boolean): void {
    this.emit(this.cloneState({ disabledSend: disabled }));
  }

  getCurrentMessage(): ChatMessage<T> | null {
    return this.state.currentMessage;
  }

  resetCurrentMessage(): void {
    const currentMessage = this.createMessage({
      id: this.state.currentMessage?.id,
      role: ChatMessageRoleType.USER
    });

    this.emit(
      this.cloneState({
        currentMessage
      })
    );
  }
}
