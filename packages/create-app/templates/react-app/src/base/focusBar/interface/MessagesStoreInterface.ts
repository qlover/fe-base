import {
  type AsyncStateInterface,
  StoreInterface,
  type StoreStateInterface
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

export abstract class MessagesStoreInterface<
  MessageType extends MessageInterface<any>,
  State extends MessagesStateInterface<MessageType>
> extends StoreInterface<State> {
  abstract mergeMessage<T extends MessageType>(
    target: T,
    ...updates: Partial<T>[]
  ): T;

  abstract createMessage<T extends MessageType>(message: Partial<T>): T;

  abstract getMessages(): MessageType[];

  abstract getMessageById(id: string): MessageType | undefined;

  abstract addMessage<M extends MessageType>(message: Partial<M>): M;

  abstract updateMessage<M extends MessageType>(
    id: string,
    ...updates: Partial<M>[]
  ): M | undefined;

  abstract deleteMessage(id: string): void;

  abstract isMessage<T extends MessageType>(message: unknown): message is T;

  abstract getMessageIndex(id: string): number;

  abstract getMessageByIndex(index: number): MessageType | undefined;

  abstract resetMessages(messages: MessageType[]): void;

  abstract toJson(): Record<string, any>[];
}
