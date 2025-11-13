import type { MessageInterface } from './MessagesStoreInterface';

export interface MessageGetwayInterface {
  sendMessage<M extends MessageInterface<unknown>>(message: M): Promise<M>;
}
