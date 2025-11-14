import { StoreInterface } from '@qlover/corekit-bridge';
import type { StoreStateInterface } from '@qlover/corekit-bridge';

/**
 * FocusBar 状态接口
 */
export interface FocusBarStateInterface extends StoreStateInterface {
  /**
   * 输入文本
   */
  inputText: string;

  /**
   * 是否禁用发送
   */
  disabledSend: boolean;
}

export abstract class FocusBarStoreInterface<
  State extends FocusBarStateInterface
> extends StoreInterface<State> {
  abstract changeInputText(text: string): void;

  abstract clearInputText(): void;

  abstract enableSend(): void;

  abstract disableSend(): void;

  abstract getInputText(): string;

  abstract getDisabledSend(): boolean;
}
