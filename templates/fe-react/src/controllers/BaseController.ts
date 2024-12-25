import { SliceStore } from '@qlover/slice-store';

export class BaseController<T> extends SliceStore<T> {
  constructor(initialState: T) {
    super(() => initialState);
  }

  getState() {
    return this.state;
  }

  setState(state: Partial<T>) {
    this.emit({ ...this.state, ...state });
  }
}
