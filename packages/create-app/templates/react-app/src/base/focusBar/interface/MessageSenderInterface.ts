import type {
  MessageGetwayInterface,
  MessageStreamEvent
} from './MessageGetwayInterface';
import type {
  MessageInterface,
  MessagesStateInterface,
  MessagesStoreInterface
} from './MessagesStoreInterface';
import type { MessageSenderContext } from '../impl/MessageSenderExecutor';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

export interface MessageSenderInterface<Message extends MessageInterface> {
  getMessageStore(): MessagesStoreInterface<
    Message,
    MessagesStateInterface<Message>
  >;

  getGateway(): MessageGetwayInterface | undefined;

  use<T extends Message>(plugin: ExecutorPlugin<MessageSenderContext<T>>): this;

  /**
   * 发送消息
   *
   * - 如果传入流式事件，则发送流式消息
   * - 否则发送普通消息
   *
   * @param message 消息
   * @param streamEvent 流式事件
   * @returns 发送的消息
   */
  send(
    message: Partial<Message>,
    streamEvent?: MessageStreamEvent
  ): Promise<Message>;
}
