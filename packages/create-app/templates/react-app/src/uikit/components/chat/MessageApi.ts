import { ThreadUtil } from '@qlover/corekit-bridge';
import { random } from 'lodash';
import type { MessageStoreMsg } from '@/base/focusBar/impl/MessagesStore';
import type { MessageGetwayInterface } from '@/base/focusBar/interface/MessageGetwayInterface';

export class MessageApi implements MessageGetwayInterface {
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

    return {
      ...message,
      result: {
        content: 'Hello! You sent: ' + message.content
      }
    };
  }
}
