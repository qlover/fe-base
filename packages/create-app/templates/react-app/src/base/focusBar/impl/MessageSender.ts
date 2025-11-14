import { AsyncExecutor, ExecutorError } from '@qlover/fe-corekit';
import {
  MessageStatus,
  type MessageStoreMsg,
  type MessagesStore
} from './MessagesStore';
import type { MessageGetwayInterface } from '../interface/MessageGetwayInterface';
import type { MessageSenderInterface } from '../interface/MessageSenderInterface';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

export interface MessageSenderContext<
  MessageType extends MessageStoreMsg<any> = MessageStoreMsg<any>
> {
  messages: MessagesStore<MessageType>;
  /**
   * 整个流程中的当前消息
   */
  currentMessage: MessageType;
  /**
   * 消息是否已添加到 store
   */
  addedToStore?: boolean;
}

export interface MessageSenderConfig {
  /**
   *
   * 是否在发送失败时抛出错误
   *
   * @default false
   */
  throwIfError?: boolean;
  /** 网关 */
  gateway?: MessageGetwayInterface;
}

export class MessageSender<MessageType extends MessageStoreMsg<any>>
  implements MessageSenderInterface<MessageType>
{
  protected messageSenderErrorId = 'MESSAGE_SENDER_ERROR';

  protected readonly executor: AsyncExecutor;
  protected throwIfError: boolean;

  readonly gateway?: MessageGetwayInterface;

  constructor(
    readonly messages: MessagesStore<MessageType>,
    config?: MessageSenderConfig
  ) {
    this.executor = new AsyncExecutor();

    this.gateway = config?.gateway;
    this.throwIfError = config?.throwIfError ?? false;
  }

  use(plugin: ExecutorPlugin<MessageSenderContext<MessageType>>): this {
    this.executor.use(plugin);
    return this;
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

    return this.messages.createMessage({
      ...message,
      status: MessageStatus.SENDING,
      loading: true,
      startTime: Date.now(),
      endTime: 0,
      // 重置错误
      error: null
    });
  }

  protected async sendMessage(message: MessageType): Promise<MessageType> {
    let currentMessage: MessageType = message;

    // 调用网关发送消息
    const result = await this.gateway?.sendMessage(message);

    const endTime = Date.now();

    // 返回带成功状态的消息对象（不更新 store，由插件决定）
    return this.messages.mergeMessage(currentMessage, {
      status: MessageStatus.SENT,
      result: result,
      loading: false,
      endTime: endTime
    } as Partial<MessageType>);
  }

  async send(message: Partial<MessageType>): Promise<MessageType>;
  async send(
    content: MessageType['content'],
    files?: MessageType['files']
  ): Promise<MessageType>;

  /**
   * 发送消息
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
    const createMessage = this.generateSendingMessage(messageOrContent, files);

    const context: MessageSenderContext<MessageType> = {
      messages: this.messages,
      currentMessage: createMessage
    };

    try {
      const message = await this.executor.exec(context, async (ctx) => {
        // 防止修改 messageOrContent 引用
        return await this.sendMessage(ctx.parameters.currentMessage);
      });

      return message;
    } catch (error) {
      // If is unknown async error, set the id to MESSAGE_SENDER_ERROR
      if (
        error instanceof ExecutorError &&
        error.id === 'UNKNOWN_ASYNC_ERROR'
      ) {
        error.id = this.messageSenderErrorId;
      }

      if (this.throwIfError) {
        throw error;
      }

      const endTime = context.currentMessage.endTime || Date.now();
      return Object.assign(context.currentMessage, {
        loading: false,
        error: error,
        status: MessageStatus.FAILED,
        endTime: endTime
      } as Partial<MessageType>);
    }
  }
}
