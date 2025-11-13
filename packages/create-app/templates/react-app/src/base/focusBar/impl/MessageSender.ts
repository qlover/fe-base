import {
  AsyncExecutor,
  type ExecutorPlugin,
  type ExecutorContext
} from '@qlover/fe-corekit';
import {
  MessageStatus,
  type MessageStoreMsg,
  type MessagesStore
} from './MessagesStore';
import {
  SenderStrategyPlugin,
  SendFailureStrategy
} from './SenderStrategyPlugin';
import type { SendFailureStrategyType } from './SenderStrategyPlugin';
import type { MessageGetwayInterface } from '../interface/MessageGetwayInterface';
import type { MessageSenderInterface } from '../interface/MessageSenderInterface';

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
  /**
   * 网关返回的结果
   */
  gatewayResult?: any;
}

export interface MessageSenderConfig {
  /** 发送失败时的处理策略，
   *
   * @default KEEP_FAILED
   */
  failureStrategy?: SendFailureStrategyType;
  /** 网关 */
  gateway?: MessageGetwayInterface;
}

export class MessageSender<MessageType extends MessageStoreMsg<any>>
  implements MessageSenderInterface<MessageType>
{
  protected readonly executor: AsyncExecutor;

  readonly gateway?: MessageGetwayInterface;

  constructor(
    readonly messages: MessagesStore<MessageType>,
    config?: MessageSenderConfig
  ) {
    this.executor = new AsyncExecutor();

    this.gateway = config?.gateway;

    this.executor.use(
      new SenderStrategyPlugin(
        config?.failureStrategy ??
          (SendFailureStrategy.KEEP_FAILED as SendFailureStrategyType)
      )
    );
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
      startTime: Date.now()
    });
  }

  protected async sendMessage(
    message: MessageType,
    context: ExecutorContext<MessageSenderContext<MessageType>>
  ): Promise<any> {
    // 调用网关发送消息
    const result = await this.gateway?.sendMessage(message);

    // 将结果保存到 context，供 onSuccess 使用
    context.parameters.gatewayResult = result;

    if (context.parameters.currentMessage != message) {
      console.warn(
        'MessageSender: currentMessage is not the same as the message'
      );
      return context.parameters.currentMessage;
    }

    return message;
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

    return this.executor.exec(context, async (ctx) => {
      return this.sendMessage(createMessage, ctx);
    });
  }
}
