import {
  MessageStatus,
  type MessageStoreMsg,
  type MessagesStore
} from './MessagesStore';
import type { MessageEventInterface } from '../interface/FocusBarEventInterface';
import type { MessageGetwayInterface } from '../interface/MessageGetwayInterface';
import type { MessageSenderInterface } from '../interface/MessageSenderInterface';

/**
 * 发送失败时的消息处理策略
 */
export enum SendFailureStrategy {
  /** 保留失败消息（默认）- 适合聊天应用，用户可以看到失败记录并重试 */
  KEEP_FAILED = 'keep_failed',
  /** 删除失败消息 - 消息列表保持干净，只显示成功消息 */
  DELETE_FAILED = 'delete_failed',
  /** 延迟添加 - 成功后才添加到列表（发送过程中不显示） */
  ADD_ON_SUCCESS = 'add_on_success'
}

export interface MessageSenderConfig<MessageType extends MessageStoreMsg<any>> {
  /** 发送失败时的处理策略，
   *
   * @default KEEP_FAILED
   */
  failureStrategy?: SendFailureStrategy;
  /** 是否抛出错误 */
  throwCatchError?: boolean;
  /** 事件处理器 */
  events?: MessageEventInterface<MessageType>;
  /** 网关 */
  gateway?: MessageGetwayInterface;
}

export class MessageSender<MessageType extends MessageStoreMsg<any>>
  implements MessageSenderInterface<MessageType>
{
  protected throwCatchError: boolean = false;
  protected failureStrategy: SendFailureStrategy;
  protected readonly events?: MessageEventInterface<MessageType>;
  readonly gateway?: MessageGetwayInterface;

  constructor(
    readonly messages: MessagesStore<MessageType>,
    config?: MessageSenderConfig<MessageType>
  ) {
    this.failureStrategy =
      config?.failureStrategy ?? SendFailureStrategy.KEEP_FAILED;

    this.throwCatchError = config?.throwCatchError ?? false;
    this.events = config?.events;
    this.gateway = config?.gateway;
  }

  throwIfCatchError(): void {
    this.throwCatchError = true;
  }

  catchMessage(error: unknown, messgeId: string): MessageType {
    // 如果配置为抛出错误，则直接抛出
    if (this.throwCatchError) {
      throw error;
    }

    // 尝试获取已存在的消息
    const existingMessage = this.messages.getMessageById(messgeId);

    // 如果消息存在，更新它的状态
    if (existingMessage) {
      const updatedMessage = this.messages.updateMessage(messgeId, {
        loading: false,
        error: error,
        status: MessageStatus.FAILED,
        endTime: Date.now()
      } as MessageType);

      // 正常情况下应该返回更新后的消息
      if (updatedMessage) {
        return updatedMessage;
      }
    }

    // 如果消息不存在或更新失败，创建一个临时消息对象（不参与状态更新）
    return this.messages.createMessage({
      id: messgeId,
      loading: false,
      error: error,
      status: MessageStatus.FAILED,
      endTime: Date.now()
    } as Partial<MessageType>);
  }

  protected generateSendingMessage(
    messageOrContent: Partial<MessageType> | MessageType['content'],
    files?: MessageType['files']
  ): MessageType {
    // 判断第一个参数是对象还是简单类型
    let message: Partial<MessageType>;

    if (
      typeof messageOrContent === 'object' &&
      messageOrContent !== null &&
      !Array.isArray(messageOrContent) &&
      files === undefined
    ) {
      // 第一个参数是消息对象
      message = messageOrContent;
    } else {
      // 第一个参数是 content，构造消息对象
      message = {
        content: messageOrContent,
        files
      } as Partial<MessageType>;
    }

    // 只创建消息对象，不添加到 store
    return this.messages.createMessage({
      ...message,
      status: MessageStatus.SENDING,
      loading: true,
      startTime: Date.now()
    });
  }

  async send(message: Partial<MessageType>): Promise<MessageType>;
  async send(
    content: MessageType['content'],
    files?: MessageType['files']
  ): Promise<MessageType>;

  /**
   * 发送消息（主流程）
   *
   * @overload
   * @param messageOrContent 消息对象或内容
   * @param files 附件文件
   * @returns 发送的消息
   */
  async send(
    messageOrContent: Partial<MessageType> | MessageType['content'],
    files?: MessageType['files']
  ): Promise<MessageType> {
    // 生命周期：发送前处理
    const { message, addedToStore } = this.onBeforeSend(
      messageOrContent,
      files
    );

    try {
      await this.events?.onSendBefore(message);

      const result = await this.gateway?.sendMessage(message);

      // 生命周期：发送成功处理
      const newMessage = this.onSendSuccess(message, result, addedToStore);

      if (!newMessage) {
        throw new Error('Failed to send message');
      }

      await this.events?.onSendScuccess(newMessage);

      return newMessage;
    } catch (error) {
      await this.events?.onSendError(message, error);

      // 生命周期：发送失败处理
      return this.onSendFailure(message, error, addedToStore);
    }
  }

  /**
   * 生命周期钩子：发送前处理
   *
   * 决定是否立即将消息添加到 store。
   * 可以通过继承重写此方法来自定义发送前的行为。
   *
   * @param messageOrContent 要发送的消息数据或内容
   * @param files 附件文件（可选）
   * @returns { message: 创建的消息对象, addedToStore: 是否已添加到store }
   */
  protected onBeforeSend(
    messageOrContent: Partial<MessageType> | MessageType['content'],
    files?: MessageType['files']
  ): {
    message: MessageType;
    addedToStore: boolean;
  } {
    // 使用 generateSendingMessage 生成消息对象
    const message = this.generateSendingMessage(messageOrContent, files);

    switch (this.failureStrategy) {
      case SendFailureStrategy.ADD_ON_SUCCESS:
        // 延迟添加策略：只返回消息对象，不添加到 store
        return {
          message,
          addedToStore: false
        };

      case SendFailureStrategy.KEEP_FAILED:
      case SendFailureStrategy.DELETE_FAILED:
      default:
        // 立即添加策略：添加到 store
        return {
          message: this.messages.addMessage(message),
          addedToStore: true
        };
    }
  }

  /**
   * 生命周期钩子：发送成功处理
   *
   * 决定如何更新成功的消息。
   * 可以通过继承重写此方法来自定义成功后的行为。
   *
   * @param message 发送的消息对象
   * @param result 网关返回的结果
   * @param addedToStore 消息是否已在 store 中
   * @returns 更新后的消息对象
   */
  protected onSendSuccess(
    message: MessageType,
    result: any,
    addedToStore: boolean
  ): MessageType | undefined {
    const successData = {
      ...result,
      loading: false,
      status: MessageStatus.SENT,
      endTime: Date.now()
    };

    if (addedToStore) {
      // 消息已在 store 中，更新状态
      return this.messages.updateMessage(
        message.id!,
        successData as MessageType
      );
    } else {
      // 消息不在 store 中，现在添加（ADD_ON_SUCCESS 策略）
      return this.messages.addMessage({
        ...message,
        ...successData
      });
    }
  }

  /**
   * 生命周期钩子：发送失败处理
   *
   * 决定如何处理失败的消息。
   * 可以通过继承重写此方法来自定义失败后的行为。
   *
   * @param message 发送的消息对象
   * @param error 发生的错误
   * @param addedToStore 消息是否已在 store 中
   * @returns 失败状态的消息对象
   */
  protected onSendFailure(
    message: MessageType,
    error: unknown,
    addedToStore: boolean
  ): MessageType {
    switch (this.failureStrategy) {
      case SendFailureStrategy.KEEP_FAILED:
        // 保留失败消息：更新消息状态为 FAILED
        return this.catchMessage(error, message.id!);

      case SendFailureStrategy.DELETE_FAILED:
        // 删除失败消息：从 store 删除并返回失败消息对象
        if (addedToStore && message.id) {
          this.messages.deleteMessage(message.id);
        }
        return this.messages.createMessage({
          ...message,
          loading: false,
          error: error,
          status: MessageStatus.FAILED,
          endTime: Date.now()
        } as Partial<MessageType>);

      case SendFailureStrategy.ADD_ON_SUCCESS:
        // 延迟添加策略：消息本来就不在 store，直接返回失败对象
        return this.messages.createMessage({
          ...message,
          loading: false,
          error: error,
          status: MessageStatus.FAILED,
          endTime: Date.now()
        } as Partial<MessageType>);

      default:
        return this.catchMessage(error, message.id!);
    }
  }
}
