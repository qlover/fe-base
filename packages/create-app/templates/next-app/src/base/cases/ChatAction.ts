import { injectable } from 'inversify';
import {
  ChatActionInterface,
  type MessageInterface,
  type ChatStateInterface
} from '@/uikit/components/chat/ChatActionInterface';

class ChatState implements ChatStateInterface {
  messages: MessageInterface[] = [];
}

@injectable()
export class ChatAction extends ChatActionInterface<ChatStateInterface> {
  constructor() {
    super(() => new ChatState());
  }

  focus(): void {
    console.log('focus');
  }
}
