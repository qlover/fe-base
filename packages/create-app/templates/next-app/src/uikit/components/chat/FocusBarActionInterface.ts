import {
  StoreInterface,
  type StoreStateInterface,
  type AsyncStateInterface
} from '@qlover/corekit-bridge';

export interface FocusBarStateInterface extends StoreStateInterface {
  showHistoryArea: boolean;
  inputValue: string;
  sendState: AsyncStateInterface<unknown>;
}

export abstract class FocusBarActionInterface<
  S extends FocusBarStateInterface
> extends StoreInterface<S> {
  abstract setInputValue(value: string): void;
  abstract clearInput(): void;
  abstract sendMessage(message: string): void | Promise<void>;
}
