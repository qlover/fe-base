import type { MessageStoreMsg } from '@/base/focusBar/impl/MessagesStore';
import type { FocusBarBridgeInterface } from '@/base/focusBar/interface/FocusBarBridgeInterface';
import type {
  FocusBarStateInterface,
  FocusBarStoreInterface
} from '@/base/focusBar/interface/FocusBarStoreInterface';
import type { MessageSenderInterface } from '@/base/focusBar/interface/MessageSenderInterface';
import type { TextAreaRef } from 'antd/es/input/TextArea';

export class FocusBarBridge<MessageType extends MessageStoreMsg<string>>
  implements FocusBarBridgeInterface<MessageType>
{
  protected ref: TextAreaRef | null = null;

  constructor(
    readonly store: FocusBarStoreInterface<FocusBarStateInterface>,
    readonly messageSender: MessageSenderInterface<MessageType>
  ) {}

  get messageStore(): (typeof this.messageSender)['messages'] {
    return this.messageSender.messages;
  }

  get lastMessage(): MessageType | undefined {
    const messages = this.messageStore.getMessages();
    return messages.at(-1);
  }

  setRef(ref: TextAreaRef): void {
    this.ref = ref;
  }

  onChangeText(text: string): void {
    this.store.changeInputText(text);
  }

  clearInputText(): void {
    if (this.store.getInputText()) {
      this.store.clearInputText();
    }

    if (this.ref?.resizableTextArea?.textArea.value) {
      this.ref.resizableTextArea.textArea.setAttribute('value', '');
    }
  }

  getInputText(): string {
    return (
      this.store.getInputText() ||
      this.ref?.resizableTextArea?.textArea.value ||
      ''
    );
  }

  protected disableSend(): void {
    const disabled = this.lastMessage?.loading;

    if (disabled && disabled !== this.store.getDisabledSend()) {
      this.store.changeDisabledSend(true);
    }
  }

  protected enableSend(): void {
    this.store.changeDisabledSend(false);
  }

  protected async sendText(text: string): Promise<MessageType> {
    return this.sendMessage({
      content: text
    } as MessageType);
  }

  protected async sendMessage(message: MessageType): Promise<MessageType> {
    this.disableSend();

    const result = await this.messageSender.send(message);

    if (!result.error) {
      this.clearInputText();
      this.focus();
    }

    this.enableSend();

    console.log('result', result);

    return result;
  }

  focus(): void {
    requestAnimationFrame(() => {
      this.ref?.focus();
    });
  }

  send(): Promise<MessageType>;
  send(text: string): Promise<MessageType>;
  send(message: MessageType): Promise<MessageType>;
  send(message?: unknown): Promise<MessageType> {
    if (message === undefined) {
      return this.sendText(this.getInputText());
    }

    if (typeof message === 'string') {
      return this.sendText(message);
    }

    if (this.messageStore.isMessage(message)) {
      return this.sendMessage(message as MessageType);
    }

    throw new Error('Invalid message type');
  }
}
