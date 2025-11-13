import type { MessageGetwayInterface } from './MessageGetwayInterface';
import type {
  MessageInterface,
  MessagesStateInterface,
  MessagesStoreInterface
} from './MessagesStoreInterface';

export interface MessageSenderInterface<Message extends MessageInterface> {
  readonly messages: MessagesStoreInterface<
    Message,
    MessagesStateInterface<Message>
  >;

  readonly gateway?: MessageGetwayInterface;

  send(message: Message): Promise<Message>;
}
