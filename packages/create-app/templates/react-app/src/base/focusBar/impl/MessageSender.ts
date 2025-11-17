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
  protected readonly gateway?: MessageGetwayInterface;
  protected throwIfError: boolean;

  constructor(
    protected readonly messages: MessagesStore<MessageType>,
    config?: MessageSenderConfig
  ) {
    this.executor = new AsyncExecutor();

    this.gateway = config?.gateway;
    this.throwIfError = config?.throwIfError ?? false;
  }

  getMessageStore(): MessagesStore<MessageType> {
    return this.messages;
  }

  getGateway(): MessageGetwayInterface | undefined {
    return this.gateway;
  }

  use(plugin: ExecutorPlugin<MessageSenderContext<MessageType>>): this {
    this.executor.use(plugin);
    return this;
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

  protected generateSendingMessage(message: Partial<MessageType>): MessageType {
    // 设置为 SENDING 状态
    return this.messages.createMessage({
      ...message,
      status: MessageStatus.SENDING,
      loading: true,
      startTime: Date.now(),
      endTime: 0,
      error: null
    } as Partial<MessageType>);
  }

  /**
   * 发送消息
   *
   * - 如果 `throwIfError=true` ，则会在发送失败时抛出错误
   * - 如果 `throwIfError=false(默认)` ，则会在发送失败时返回失败消息
   *
   * @param message - 消息对象（支持部分字段）
   * @returns 发送的消息
   */
  async send(message: Partial<MessageType>): Promise<MessageType> {
    const context: MessageSenderContext<MessageType> = {
      messages: this.messages,
      currentMessage: this.generateSendingMessage(message)
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
