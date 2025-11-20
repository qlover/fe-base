import { ChatMessage } from './ChatMessage';
import { MessagesStore, MessageStatus } from '../impl/MessagesStore';
import type {
  ChatMessageStoreInterface,
  ChatMessageStoreStateInterface
} from './interface';

/**
 * 草稿消息处理模式
 *
 * 用于控制草稿消息的添加和移除顺序，影响消息的发送顺序
 */
export const DraftMode = Object.freeze({
  /**
   * STACK 模式（栈模式 - 后进先出 LIFO: Last In First Out）
   *
   * 数据结构行为：
   * - 添加消息：新消息追加到数组末尾 [...messages, newMessage]
   * - 获取消息：获取数组最后一个元素 array.at(-1)
   * - 移除消息：移除数组最后一个元素 array.slice(0, -1)
   *
   * 示例流程：
   * 1. 添加 A: [A]
   * 2. 添加 B: [A, B]
   * 3. 添加 C: [A, B, C]
   * 4. 发送: 取出 C（最后添加），剩余 [A, B]
   * 5. 发送: 取出 B，剩余 [A]
   * 6. 发送: 取出 A（最早添加），剩余 []
   *
   * 使用场景：
   * - 最新的消息优先发送（后添加的先发送）
   * - 适合需要撤销/编辑最近输入的场景
   * - 类似于文本编辑器的 Undo 栈
   */
  STACK: 'stack',

  /**
   * QUEUE 模式（队列模式 - 先进先出 FIFO: First In First Out）
   *
   * 数据结构行为：
   * - 添加消息：新消息追加到数组末尾 [...messages, newMessage]
   * - 获取消息：获取数组第一个元素 array.at(0)
   * - 移除消息：移除数组第一个元素 array.slice(1)
   *
   * 示例流程：
   * 1. 添加 A: [A]
   * 2. 添加 B: [A, B]
   * 3. 添加 C: [A, B, C]
   * 4. 发送: 取出 A（最早添加），剩余 [B, C]
   * 5. 发送: 取出 B，剩余 [C]
   * 6. 发送: 取出 C（最后添加），剩余 []
   *
   * 使用场景：
   * - 最早的消息优先发送（先添加的先发送）
   * - 适合按顺序处理消息的场景
   * - 保持输入顺序发送的业务需求
   */
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
  /**
   * 草稿消息处理模式
   *
   * @default DraftMode.QUEUE - 默认使用队列模式
   *
   * 可以在子类中重写此属性来改变模式：
   * ```typescript
   * class MyStore extends ChatMessageStore {
   *   protected draftMode = DraftMode.STACK;
   * }
   * ```
   */
  protected draftMode: DraftModeType = DraftMode.QUEUE;

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

  /**
   * 移除第一条草稿消息（根据模式决定是哪一条）
   *
   * @returns 移除后剩余的草稿消息数组
   *
   * STACK 模式（后进先出）：
   * - [A, B, C] -> [A, B]  （移除最后一个 C）
   *
   * QUEUE 模式（先进先出）：
   * - [A, B, C] -> [B, C]  （移除第一个 A）
   */
  protected sliceDraftMessages(): ChatMessage<T>[] {
    if (this.draftMode === DraftMode.QUEUE) {
      // QUEUE 模式：移除数组第一个元素（最早添加的）
      return this.getDraftMessages().slice(1);
    }

    // STACK 模式：移除数组最后一个元素（最新添加的）
    return this.getDraftMessages().slice(0, -1);
  }

  /**
   * 获取第一条草稿消息（根据模式决定是哪一条）
   *
   * @returns 第一条草稿消息，如果没有则返回 null
   *
   * STACK 模式（后进先出）：
   * - [A, B, C] -> 返回 C（最后一个，最新添加的，应该先发送）
   *
   * QUEUE 模式（先进先出）：
   * - [A, B, C] -> 返回 A（第一个，最早添加的，应该先发送）
   *
   * 注意：这里的"第一条"指的是应该被优先处理的那一条，
   * 不是数组位置上的第一条，而是逻辑上的第一条
   */
  getFirstDraftMessage(): ChatMessage<T> | null {
    if (this.draftMode === DraftMode.STACK) {
      // STACK 模式：获取最后一个（最新的）
      return this.getDraftMessages().at(-1) || null;
    }

    // QUEUE 模式：获取第一个（最早的）
    return this.getDraftMessages().at(0) || null;
  }

  /**
   * 获取并移除第一条草稿消息（类似于 Array.shift，但根据模式决定移除哪一条）
   *
   * @returns 被移除的草稿消息，如果没有草稿则返回 null
   *
   * 行为示例：
   *
   * STACK 模式（后进先出）：
   * - 移除前: [A, B, C]
   * - 移除后: [A, B]
   * - 返回: C（最新添加的）
   *
   * QUEUE 模式（先进先出）：
   * - 移除前: [A, B, C]
   * - 移除后: [B, C]
   * - 返回: A（最早添加的）
   *
   * 两种模式的区别：
   * - STACK: 移除并返回最新添加的消息（后进先出）
   * - QUEUE: 移除并返回最早添加的消息（先进先出）
   * - 确保"取出"和"删除"的是同一条消息（这是 Bug 修复的关键）
   */
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
   *
   * @param message - 要添加的消息内容（部分字段即可，会自动补全）
   *
   * 行为说明：
   *
   * STACK 模式（追加到末尾，后进先出）：
   * - 添加前: [A, B]
   * - 添加 C: [A, B, C]
   * - 添加 D: [A, B, C, D]
   * - 发送顺序: D -> C -> B -> A（后添加的先发送）
   *
   * QUEUE 模式（追加到末尾，先进先出）：
   * - 添加前: [A, B]
   * - 添加 C: [A, B, C]
   * - 添加 D: [A, B, C, D]
   * - 发送顺序: A -> B -> C -> D（先添加的先发送）
   *
   * 两种模式对比：
   * - STACK: 新消息追加到末尾，取出时从末尾取（后进先出）
   * - QUEUE: 新消息追加到末尾，取出时从开头取（先进先出）
   *
   * 注意：
   * - 会自动将消息状态设置为 MessageStatus.DRAFT
   * - 两种模式添加方式相同，区别在于取出的顺序
   */
  addDraftMessage(message: Partial<ChatMessage<T>>): void {
    const draftMessage = this.createMessage(message);

    if (draftMessage.status !== MessageStatus.DRAFT) {
      Object.assign(draftMessage, { status: MessageStatus.DRAFT });
    }

    // 两种模式都是追加到末尾
    const newDraftMessages = [...this.getDraftMessages(), draftMessage];

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
