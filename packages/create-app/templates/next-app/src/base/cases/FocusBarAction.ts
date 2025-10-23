import { RequestState } from '@qlover/corekit-bridge';
import { injectable } from 'inversify';

import type { FocusBarStateInterface } from '@/uikit/components/chat/FocusBarActionInterface';
import { FocusBarActionInterface } from '@/uikit/components/chat/FocusBarActionInterface';

class FocusBarState implements FocusBarStateInterface {
  showHistoryArea = false;
  inputValue = '';
  sendState = new RequestState();
}

@injectable()
export class FocusBarAction extends FocusBarActionInterface<FocusBarStateInterface> {
  constructor() {
    super(() => new FocusBarState());
  }

  sendMessage(_message: string): Promise<void> {
    return new Promise((resolve) => {
      this.emit(this.cloneState({ sendState: new RequestState(true) }));
      setTimeout(() => {
        this.emit(this.cloneState({ sendState: new RequestState().end() }));
        resolve();
      }, 1000);
    });
  }

  setInputValue(value: string): void {
    this.emit(this.cloneState({ inputValue: value }));
  }

  clearInput(): void {
    this.emit(this.cloneState({ inputValue: '' }));
  }
}
