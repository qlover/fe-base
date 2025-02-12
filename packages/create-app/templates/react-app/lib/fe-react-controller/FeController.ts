import { SliceStore } from '@qlover/slice-store-react';

export class FeController<T> extends SliceStore<T> {
  constructor(private stateFactory: () => T) {
    super(stateFactory);
  }

  getState(): T {
    return this.state;
  }

  setState(state: Partial<T>): void {
    this.emit({ ...this.state, ...state });
  }

  reset(): void {
    this.emit(this.stateFactory());
  }
}
