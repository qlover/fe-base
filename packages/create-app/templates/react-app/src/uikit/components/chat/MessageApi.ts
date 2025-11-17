import { ThreadUtil } from '@qlover/corekit-bridge';
import { random } from 'lodash';
import {
  MessageStatus,
  type MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';
import type { MessageGetwayInterface } from '@/base/focusBar/interface/MessageGetwayInterface';
import { ChatMessageRoleType } from './chatMessage/ChatMessage';
import type { ChatMessageStore } from './chatMessage/ChatMessageStore';

export class MessageApi implements MessageGetwayInterface {
  constructor(protected messagesStore: ChatMessageStore<unknown>) {
    this.messagesStore = messagesStore;
  }

  async sendMessage<M extends MessageStoreMsg<string>>(message: M): Promise<M> {
    const times = random(200, 1000);

    await ThreadUtil.sleep(times);

    const messageContent = message.content ?? '';
    if (messageContent.includes('Failed') || messageContent.includes('error')) {
      throw new Error('Failed to send message');
    }

    if (times % 5 === 0) {
      throw new Error(`Network error(${times})`);
    }

    const endTime = Date.now();
    return this.messagesStore.createMessage({
      ...message,
      id: ChatMessageRoleType.ASSISTANT + message.id + endTime,
      role: ChatMessageRoleType.ASSISTANT,
      content: '(' + endTime + ')Hello! You sent7: ' + message.content,
      error: null,
      loading: false,
      status: MessageStatus.SENT,
      endTime: endTime,
      result: null
    }) as unknown as M;
  }
}
