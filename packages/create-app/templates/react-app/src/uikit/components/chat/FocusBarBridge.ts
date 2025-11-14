import type { MessageStoreMsg } from '@/base/focusBar/impl/MessagesStore';
import type { FocusBarBridgeInterface } from '@/base/focusBar/interface/FocusBarBridgeInterface';
import type {
  FocusBarStateInterface,
  FocusBarStoreInterface
} from '@/base/focusBar/interface/FocusBarStoreInterface';
import type { MessageSenderInterface } from '@/base/focusBar/interface/MessageSenderInterface';

export class FocusBarBridge<MessageType extends MessageStoreMsg<string>>
  implements FocusBarBridgeInterface<MessageType>
{
  constructor(
    readonly store: FocusBarStoreInterface<FocusBarStateInterface>,
    readonly messageSender: MessageSenderInterface<MessageType>
  ) {}

  onChangeText(text: string): void {
    this.store.changeInputText(text);
  }

  protected async sendInput(text: string): Promise<MessageType> {
    const result = await this.messageSender.send({
      content: text
    } as MessageType);

    console.log('sendInput', result);

    if (!result.error) {
      this.store.clearInputText();
    }

    return result;
  }

  send(): Promise<MessageType>;
  send(text: string): Promise<MessageType>;
  send(message: MessageType): Promise<MessageType>;
  send(message?: unknown): Promise<MessageType> {
    if (message === undefined) {
      return this.sendInput(this.store.getInputText());
    }

    if (typeof message === 'string') {
      return this.sendInput(message);
    }

    throw new Error('Invalid message type');
  }
}
