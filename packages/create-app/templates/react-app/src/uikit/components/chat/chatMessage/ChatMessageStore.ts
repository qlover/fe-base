import {
  MessagesStore,
  MessageStatus
} from '@/base/focusBar/impl/MessagesStore';
import { ChatMessage } from './ChatMessage';
import type {
  ChatMessageStoreInterface,
  ChatMessageStoreStateInterface
} from './interface';

export const DraftMode = Object.freeze({
  STACK: 'stack',
  QUEUE: 'queue'
});

export type DraftModeType = (typeof DraftMode)[keyof typeof DraftMode];

function createChatMessageState<T>(): ChatMessageStoreStateInterface<T> {
  return {
    messages: [],
    draftMessages: [],
    disabledSend: false
  };
}

export class ChatMessageStore<T = unknown>
  extends MessagesStore<ChatMessage<T>, ChatMessageStoreStateInterface<T>>
  implements ChatMessageStoreInterface<T>
{
  protected draftMode: DraftModeType = DraftMode.STACK;

  constructor(
    initialState: () => ChatMessageStoreStateInterface<T> = createChatMessageState
  ) {
    super(initialState);
  }

  override createMessage<M extends ChatMessage<T>>(
    message: Partial<M> = {} as Partial<M>
  ): M {
    return new ChatMessage<T>(super.createMessage(message)) as M;
  }

  override isMessage<M extends ChatMessage<T>>(message: unknown): message is M {
    return message instanceof ChatMessage;
  }

  protected sliceDraftMessages(): ChatMessage<T>[] {
    if (this.draftMode === DraftMode.STACK) {
      return this.getDraftMessages().slice(1);
    }

    return this.getDraftMessages().slice(0, -1);
  }

  getFirstDraftMessage(): ChatMessage<T> | null {
    if (this.draftMode === DraftMode.STACK) {
      return this.getDraftMessages().at(-1) || null;
    }

    return this.getDraftMessages().at(0) || null;
  }

  shiftFirstDraftMessage(): ChatMessage<T> | null {
    const draftMessages = this.getDraftMessages();

    if (draftMessages.length === 0) {
      return null;
    }

    const firstDraft = this.getFirstDraftMessage();
    const newDraftMessages = this.sliceDraftMessages();

    this.emit(
      this.cloneState({
        draftMessages: newDraftMessages
      })
    );

    return firstDraft;
  }

  /**
   * 获取所有草稿消息
   */
  getDraftMessages(): ChatMessage<T>[] {
    return this.state.draftMessages ?? [];
  }

  /**
   * 添加草稿消息
   */
  addDraftMessage(message: Partial<ChatMessage<T>>): void {
    const draftMessage = this.createMessage(message);

    if (draftMessage.status !== MessageStatus.DRAFT) {
      Object.assign(draftMessage, { status: MessageStatus.DRAFT });
    }

    const newDraftMessages =
      this.draftMode === DraftMode.STACK
        ? [...this.getDraftMessages(), draftMessage]
        : [draftMessage, ...this.getDraftMessages()];

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
    const draftMessages = this.getDraftMessages();
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
    const draftMessages = this.getDraftMessages();

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

  getDarftMessageById(messageId: string): ChatMessage<T> | null {
    return this.getDraftMessages().find((msg) => msg.id === messageId) || null;
  }

  getReadySendMessage(message?: ChatMessage<T>): ChatMessage<T> | null {
    let targetMessage: ChatMessage<T> | null = null;

    if (this.isMessage(message) && message.id) {
      targetMessage = this.getDarftMessageById(message.id);

      if (!targetMessage) {
        targetMessage = this.getMessageById(message.id)!;
      }
    }

    if (!targetMessage) {
      targetMessage = this.shiftFirstDraftMessage();
    }

    return targetMessage;
  }
}
