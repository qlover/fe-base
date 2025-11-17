import type { MessageSenderInterface } from '@/base/focusBar/interface/MessageSenderInterface';
import type {
  MessagesStateInterface,
  MessagesStoreInterface
} from '@/base/focusBar/interface/MessagesStoreInterface';
import type { ChatMessage } from './ChatMessage';

export interface ChatMessageStoreStateInterface<T = unknown>
  extends MessagesStateInterface<ChatMessage<T>> {
  currentMessage: ChatMessage<T> | null;

  /**
   * 是否禁用发送
   */
  disabledSend: boolean;
}

export interface ChatMessageStoreInterface<T = unknown>
  extends MessagesStoreInterface<
    ChatMessage<T>,
    ChatMessageStoreStateInterface<T>
  > {
  changeCurrent(message: Partial<ChatMessage<T>>): ChatMessage<T>;

  changeDisabledSend(disabled: boolean): void;

  getCurrentMessage(): ChatMessage<T> | null;

  resetCurrentMessage(): void;
}

export interface InputRefInterface {
  /**
   * 设置输入框引用
   *
   * @param ref 输入框引用
   */
  setRef(ref: unknown): void;

  focus(): void;
}

export interface ChatMessageBridgeInterface<T = string>
  extends MessageSenderInterface<ChatMessage<T>>,
    InputRefInterface {
  /**
   * @override
   * 返回更具体的 ChatMessageStoreInterface 类型
   */
  getMessageStore(): ChatMessageStoreInterface<T>;

  onChangeContent(content: T): void;

  disableSend(): void;

  enableSend(): void;

  /**
   * 发送用户消息
   *
   * @overload
   *
   * - 如果传入消息对象，则使用传入的消息对象发送
   * - 如果不传入任何参数，则使用当前消息对象发送
   *
   * @param message 消息对象
   * @returns 发送的消息
   */
  sendUser(): Promise<ChatMessage<T>>;
  sendUser(message: ChatMessage<T>): Promise<ChatMessage<T>>;
}
