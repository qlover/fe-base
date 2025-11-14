import {
  MessagesStoreInterface,
  type MessageInterface,
  type MessagesStateInterface
} from '../interface/MessagesStoreInterface';

/**
 * 消息状态枚举
 */
export const MessageStatus = Object.freeze({
  /** 草稿/编辑中 */
  DRAFT: 'draft',
  /** 发送中 */
  SENDING: 'sending',
  /** 发送成功 */
  SENT: 'sent',
  /** 发送失败 */
  FAILED: 'failed',
  /** 停止 */
  STOPPED: 'stopped'
});

export type MessageStatusType =
  (typeof MessageStatus)[keyof typeof MessageStatus];

export interface MessageStoreMsg<T, R = unknown> extends MessageInterface<R> {
  /** 输入前，占位符 */
  placeholder?: string;

  content?: T;

  /** 附件文件（后期支持） */
  files?: File[];

  /** 消息状态 */
  status?: MessageStatusType;
}

export class MessagesStore<
  MessageType extends MessageStoreMsg<unknown> = MessageStoreMsg<any>,
  State extends
    MessagesStateInterface<MessageType> = MessagesStateInterface<MessageType>
> extends MessagesStoreInterface<MessageType, State> {
  /**
   * 合并消息对象，保留实例原型链
   */
  override mergeMessage<T extends MessageType>(
    target: T,
    ...updates: Partial<T>[]
  ): T {
    // 检查是否为类实例（非普通对象）
    const proto = Object.getPrototypeOf(target);
    if (proto && proto.constructor && proto.constructor !== Object) {
      // 保持原型链：创建新对象并继承原型
      return Object.assign(Object.create(proto), target, ...updates);
    }

    // 普通对象，直接合并
    return Object.assign({}, target, ...updates);
  }

  override getMessages(): MessageType[] {
    return this.state.messages ?? [];
  }

  protected defaultId(message: Partial<MessageType>): string {
    return `${message.startTime ?? Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  override createMessage<T extends MessageType>(message: Partial<T> = {}): T {
    const startTime = message.startTime ?? Date.now();
    const id = message.id ?? this.defaultId(message);
    const status = message.status ?? MessageStatus.DRAFT;
    const loading = message.loading ?? false;
    const endTime = message.endTime ?? 0;

    return Object.assign({}, message, {
      id,
      status,
      loading,
      result: message.result ?? null,
      error: message.error ?? null,
      startTime,
      endTime
    }) as T;
  }

  override getMessageById(id: string): MessageType | undefined {
    return this.getMessages().find((message) => message.id === id);
  }

  override addMessage<M extends MessageType>(message: Partial<M>): M {
    // If the message has an id, update the message instead of adding it
    if (message.id) {
      const existingMessage = this.getMessageById(message.id) as M;

      if (existingMessage) {
        return this.updateMessage<M>(message.id, existingMessage, message)!;
      }
    }

    const finalMessage = this.createMessage(message);
    const newMessages = [...this.getMessages(), finalMessage];

    this.emit(
      this.cloneState({
        messages: newMessages
      } as Partial<State>)
    );

    return finalMessage;
  }

  override updateMessage<M extends MessageType>(
    id: string,
    ...updates: Partial<M>[]
  ): M | undefined {
    let updatedMessage: M | undefined;
    const messages = this.getMessages();

    // 使用 map 一次遍历完成查找和更新
    const newMessages = messages.map((msg) => {
      if (msg.id === id) {
        updatedMessage = this.mergeMessage(msg as M, ...updates);
        return updatedMessage;
      }
      return msg;
    });

    // 如果没有找到匹配的消息，直接返回
    if (!updatedMessage) {
      return;
    }

    this.emit(this.cloneState({ messages: newMessages } as Partial<State>));

    return updatedMessage;
  }

  override deleteMessage(id: string): void {
    const messages = this.getMessages();
    // 使用 filter 一次遍历完成删除
    const newMessages = messages.filter((message) => message.id !== id);

    // 如果数组长度没变，说明没有找到要删除的消息
    if (newMessages.length === messages.length) {
      return;
    }

    this.emit(this.cloneState({ messages: newMessages } as Partial<State>));
  }
}
