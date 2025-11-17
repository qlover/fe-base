import type { MessageGetwayInterface } from './MessageGetwayInterface';
import type {
  MessageInterface,
  MessagesStateInterface,
  MessagesStoreInterface
} from './MessagesStoreInterface';

export interface MessageSenderInterface<Message extends MessageInterface> {
  getMessageStore(): MessagesStoreInterface<
    Message,
    MessagesStateInterface<Message>
  >;

  getGateway(): MessageGetwayInterface | undefined;

  send(message: Partial<Message>): Promise<Message>;
}
