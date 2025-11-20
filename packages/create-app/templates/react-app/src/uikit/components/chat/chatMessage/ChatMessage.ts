import type {
  MessageStatusType,
  MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';

export const ChatMessageRole = {
  USER: 'user',
  SYSTEM: 'system',
  ASSISTANT: 'assistant'
} as const;

export type ChatMessageRoleType =
  (typeof ChatMessageRole)[keyof typeof ChatMessageRole];

export class ChatMessage<T = unknown, R = unknown>
  implements MessageStoreMsg<T, R>
{
  readonly id?: string;
  readonly content?: T;

  readonly loading: boolean = false;
  readonly result: R | null = null;
  readonly error: unknown = null;
  readonly startTime: number = Date.now();
  readonly endTime: number = 0;
  readonly placeholder?: string;
  readonly files?: File[];
  readonly status?: MessageStatusType;

  readonly role: ChatMessageRoleType = ChatMessageRole.USER;

  constructor(options?: Partial<MessageStoreMsg<T>>) {
    if (options) {
      Object.assign(this, options);
    }
  }
}
