import type {
  AsyncStateInterface,
  StoreStateInterface
} from '@qlover/corekit-bridge';

/**
 * 消息对象
 * 描述一条完整的消息
 */
export interface MessageInterface<T = unknown> extends AsyncStateInterface<T> {
  /** 消息 ID（可选，发送成功后由服务器返回） */
  id?: string;
}

/**
 * FocusBar 状态接口
 */
export interface MessagesStateInterface<T> extends StoreStateInterface {
  /** 历史消息列表 */
  messages: T[];
}

export interface MessagesStoreInterface<
  MessageType extends MessageInterface<any>,
  State extends MessagesStateInterface<MessageType>
> {
  readonly state: State;

  mergeMessage<T extends MessageType>(target: T, ...updates: Partial<T>[]): T;

  createMessage<T extends MessageType>(message: Partial<T>): T;

  getMessages(): MessageType[];

  getMessageById(id: string): MessageType | undefined;

  addMessage<M extends MessageType>(message: Partial<M>): M;

  updateMessage<M extends MessageType>(
    id: string,
    ...updates: Partial<M>[]
  ): M | undefined;

  deleteMessage(id: string): void;
}
