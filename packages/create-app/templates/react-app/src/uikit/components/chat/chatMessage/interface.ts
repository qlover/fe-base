import type { MessageSenderContext } from '@/base/focusBar/impl/MessageSenderExecutor';
import type { GatewayOptions } from '@/base/focusBar/interface/MessageGetwayInterface';
import type {
  MessagesStateInterface,
  MessagesStoreInterface
} from '@/base/focusBar/interface/MessagesStoreInterface';
import type { ChatMessage } from './ChatMessage';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

export interface ChatMessageStoreStateInterface<T = unknown>
  extends MessagesStateInterface<ChatMessage<T>> {
  /**
   * 草稿消息列表
   *
   * 草稿消息列表中的消息不会被发送，而是作为草稿保存
   */
  draftMessages: ChatMessage<T>[];

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
  /**
   * 获取草稿消息
   *
   * @param messageId - 消息ID
   */
  getDarftMessageById(messageId: string): ChatMessage<T> | null;

  /**
   * 获取草稿消息列表
   */
  getDraftMessages(): ChatMessage<T>[];

  /**
   * 添加草稿消息
   *
   * @param message 草稿消息
   */
  addDraftMessage(message: Partial<ChatMessage<T>>): void;

  /**
   * 删除草稿消息
   *
   * @param messageId 草稿消息ID
   */
  deleteDraftMessage(messageId: string): void;

  /**
   * 更新草稿消息
   *
   * @param messageId 草稿消息ID
   * @param updates 要更新的字段
   */
  updateDraftMessage(
    messageId: string,
    updates: Partial<ChatMessage<T>>
  ): ChatMessage<T> | undefined;

  /**
   * 清空草稿消息
   */
  resetDraftMessages(messages?: ChatMessage<T>[]): void;

  /**
   * 获取第一个加入草稿的消息(并不是数组的第一个)
   *
   * - 这里获取的是草稿消息(draftMessages)列表中的第一个消息
   * - 而不是历史消息(messages)列表中的第一个消息
   */
  getFirstDraftMessage(): ChatMessage<T> | null;

  /**
   * 获取第一个加入草稿的消息, 并从草稿消息列表中移除
   */
  shiftFirstDraftMessage(): ChatMessage<T> | null;

  /**
   * 获取可以发送的消息
   */
  getReadySendMessage(message?: ChatMessage<T>): ChatMessage<T> | null;
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

export type ChatMessageBridgePlugin<T = unknown> = ExecutorPlugin<
  MessageSenderContext<ChatMessage<T>>
>;

export interface ChatMessageBridgeInterface<T = string>
  extends InputRefInterface {
  /**
   * @override
   * 返回更具体的 ChatMessageStoreInterface 类型
   */
  getMessageStore(): ChatMessageStoreInterface<T>;

  /**
   * 使用额外的 messageSender 插件
   *
   * @param plugin
   */
  use(plugin: ChatMessageBridgePlugin<T> | ChatMessageBridgePlugin<T>[]): this;

  /**
   * 改变输入框内容
   *
   * 如果想要获取最新ui上的草稿消息，请使用 `getFirstDraftMessage` 方法
   *
   * @param content 内容
   */
  onChangeContent(content: T): void;

  /**
   * 获取第一个草稿消息
   *
   * 他应该获取最新ui上的草稿消息
   *
   * @param draftMessages 草稿消息列表（可依赖ui层级获取，避免直接访问store, 默认获取全部消息）
   * @returns 第一个草稿消息
   */
  getFirstDraftMessage(draftMessages?: ChatMessage<T>[]): ChatMessage<T> | null;

  /**
   * 发送用户消息
   *
   * @overload
   *
   * - 如果不传入参数一，则使用当前消息对象发送
   * - 如果传入参数二，则将启用流式模式
   *
   * @param message 消息对象
   * @returns 发送的消息
   */
  send(
    message?: ChatMessage<T>,
    gatewayOptions?: GatewayOptions<ChatMessage<T>>
  ): Promise<ChatMessage<T>>;

  /**
   * 获取正在发送的消息
   *
   * @param messages 消息列表（可依赖ui层级获取，避免直接访问store, 默认获取全部消息）
   * @returns 正在发送的消息
   */
  getSendingMessage(messages?: ChatMessage<T>[]): ChatMessage<T> | null;

  /**
   * 停止发送消息
   *
   * @param messageId 消息ID
   * @returns 是否停止成功
   */
  stop(messageId?: string): boolean;
}
