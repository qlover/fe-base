import {
  AsyncExecutor,
  type ExecutorContext,
  type ExecutorPlugin
} from '@qlover/fe-corekit';
import type { MessageSenderConfig } from './MessageSender';
import type { MessagesStore, MessageStoreMsg } from './MessagesStore';

export interface MessageSenderContext<
  MessageType extends MessageStoreMsg<any> = MessageStoreMsg<any>
> extends MessageSenderConfig {
  store: MessagesStore<MessageType>;
  /**
   * 整个流程中的当前消息
   */
  currentMessage: MessageType;
  /**
   * 消息是否已添加到 store
   */
  addedToStore?: boolean;
}

export type MessageSenderPluginContext<T extends MessageStoreMsg<any>> =
  ExecutorContext<MessageSenderContext<T>>;

export interface MessageSenderPlugin<T extends MessageStoreMsg<any>>
  extends ExecutorPlugin<MessageSenderContext<T>> {
  /**
   * 当以stream调用 send 时，会调用此钩子
   *
   * - 可以返回一个消息对象, 最为最后返回的消息对象
   * - 也可以什么不返回
   *
   * @param context - 上下文
   * @returns 返回值
   */
  onStream?(
    context: MessageSenderPluginContext<any>,
    chunk: unknown
  ): Promise<unknown> | unknown | void;
}

export class MessageSenderExecutor extends AsyncExecutor {
  async runStream(
    chunk: any,
    context: ExecutorContext<MessageSenderContext>
  ): Promise<any> {
    return await this.runHooks(this.plugins, 'onStream', context, chunk);
  }
}
