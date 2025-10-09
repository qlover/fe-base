import {
  StoreInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';

export const MessageType = Object.freeze({
  USER: 'user',
  ASSISTANT: 'assistant'
});

export type MessageTypeValue = (typeof MessageType)[keyof typeof MessageType];

export interface MessageInterface {
  id: string;
  content: unknown;
  role: MessageTypeValue;
  createdAt: string;

  loading?: boolean;
}

export interface ChatStateInterface extends StoreStateInterface {
  messages: MessageInterface[];
}

export abstract class ChatActionInterface<
  S extends ChatStateInterface
> extends StoreInterface<S> {
  abstract focus(): void;
}
