import type { MessageInterface } from './MessagesStoreInterface';

export interface FocusBarEventInterface<
  MessageType extends MessageInterface<any>
> {
  onSendBefore(message: MessageType): void | Promise<void>;
  onSendAfter(message: MessageType): void | Promise<void>;
  onSendError(message: MessageType, error: unknown): void | Promise<void>;
}
