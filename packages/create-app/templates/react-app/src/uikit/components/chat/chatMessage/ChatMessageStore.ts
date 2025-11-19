import {
  MessagesStore,
  MessageStatus
} from '@/base/focusBar/impl/MessagesStore';
import { ChatMessage } from './ChatMessage';
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
  draftMessages: ChatMessage<T>[] = [];

  /**
   * 是否禁用发送
   */
  disabledSend: boolean = false;
}

export class ChatMessageStore<T = unknown>
  extends MessagesStore<ChatMessage<T>, ChatMessageStoreState<T>>
  implements ChatMessageStoreInterface<T>
{
  /**
   * 获取最后一个草稿消息
   */
  getLastDraftMessage(): ChatMessage<T> | null {
    return this.state.draftMessages.at(-1) || null;
  }

  /**
   * 弹出最后一个草稿消息（从队列中移除并返回）
   */
  popLastDraftMessage(): ChatMessage<T> | null {
    const draftMessages = this.state.draftMessages;

    if (draftMessages.length === 0) {
      return null;
    }

    const lastDraft = this.getLastDraftMessage();
    const newDraftMessages = draftMessages.slice(0, -1);

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );

    return lastDraft;
  }

  /**
   * 获取所有草稿消息
   */
  getDraftMessages(): ChatMessage<T>[] {
    return this.state.draftMessages;
  }

  /**
   * 添加草稿消息
   */
  addDraftMessage(message: Partial<ChatMessage<T>>): void {
    const draftMessage = this.createMessage(message);

    if (draftMessage.status !== MessageStatus.DRAFT) {
      Object.assign(draftMessage, { status: MessageStatus.DRAFT });
    }

    const newDraftMessages = [...this.state.draftMessages, draftMessage];

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );
  }

  /**
   * 删除指定 ID 的草稿消息
   */
  deleteDraftMessage(messageId: string): void {
    const draftMessages = this.state.draftMessages;
    const newDraftMessages = draftMessages.filter(
      (msg) => msg.id !== messageId
    );

    // 如果数组长度没变，说明没有找到要删除的消息
    if (newDraftMessages.length === draftMessages.length) {
      return;
    }

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );
  }

  /**
   * 更新指定 ID 的草稿消息
   */
  updateDraftMessage(
    messageId: string,
    updates: Partial<ChatMessage<T>>
  ): ChatMessage<T> | undefined {
    let updatedMessage: ChatMessage<T> | undefined;
    const draftMessages = this.state.draftMessages;

    // 使用 map 一次遍历完成查找和更新
    const newDraftMessages = draftMessages.map((msg) => {
      if (msg.id === messageId) {
        updatedMessage = this.mergeMessage(msg, updates);
        return updatedMessage;
      }
      return msg;
    });

    // 如果没有找到匹配的消息，直接返回
    if (!updatedMessage) {
      return;
    }

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );

    return updatedMessage;
  }

  /**
   * 重置草稿消息列表
   * @param messages 新的草稿消息列表，如果不传则清空
   */
  resetDraftMessages(messages?: ChatMessage<T>[]): void {
    const newDraftMessages = messages
      ? messages.map((msg) => this.createMessage(msg))
      : [];

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );
  }

  /**
   * 修改禁用发送状态
   */
  changeDisabledSend(disabled: boolean): void {
    this.emit(this.cloneState({ disabledSend: disabled }));
  }

  override createMessage<M extends ChatMessage<T>>(
    message: Partial<M> = {} as Partial<M>
  ): M {
    return new ChatMessage<T>(super.createMessage(message)) as M;
  }

  override isMessage<M extends ChatMessage<T>>(message: unknown): message is M {
    return message instanceof ChatMessage;
  }
}
