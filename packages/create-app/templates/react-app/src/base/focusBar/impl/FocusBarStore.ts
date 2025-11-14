import { FocusBarStoreInterface } from '../interface/FocusBarStoreInterface';
import type { FocusBarStateInterface } from '../interface/FocusBarStoreInterface';

export class FocusBarStore extends FocusBarStoreInterface<FocusBarStateInterface> {
  override changeInputText(text: string): void {
    this.emit(this.cloneState({ inputText: text }));
  }

  override clearInputText(): void {
    this.emit(this.cloneState({ inputText: '' }));
  }

  override enableSend(): void {
    this.emit(this.cloneState({ disabledSend: false }));
  }

  override disableSend(): void {
    this.emit(this.cloneState({ disabledSend: true }));
  }

  override getInputText(): string {
    return this.state.inputText;
  }

  override getDisabledSend(): boolean {
    return !this.getInputText() || this.state.disabledSend;
  }
}
