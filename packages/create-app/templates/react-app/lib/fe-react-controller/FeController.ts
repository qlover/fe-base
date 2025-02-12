import { SliceStore } from '@qlover/slice-store-react';

export class FeController<T> extends SliceStore<T> {
  constructor(initialState: T) {
    super(() => initialState);
  }

  getState(): T {
    return this.state;
  }

  setState(state: Partial<T>): void {
    this.emit({ ...this.state, ...state });
  }
}
