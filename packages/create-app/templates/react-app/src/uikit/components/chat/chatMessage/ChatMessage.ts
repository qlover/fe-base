import type { MessageStoreMsg } from '@/base/focusBar/impl/MessagesStore';

export const ChatMessageRoleType = {
  USER: 'user',
  SYSTEM: 'system',
  ASSISTANT: 'assistant'
} as const;

export type ChatMessageRoleType =
  (typeof ChatMessageRoleType)[keyof typeof ChatMessageRoleType];

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

  readonly role: ChatMessageRoleType = ChatMessageRoleType.USER;

  constructor(options?: Partial<MessageStoreMsg<T>>) {
    if (options) {
      Object.assign(this, options);
    }
  }
}
