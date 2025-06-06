import AntdMessageStatic from 'antd/es/message';
import { TypeOpen } from 'antd/es/message/interface';
import AntdModalStatic from 'antd/es/modal';

import { ModalFunc } from 'antd/es/modal/confirm';

declare module 'antd' {
  /**
   * @deprecated Please use alternative message implementation instead
   */
  export const message: typeof AntdMessageStatic & {
    /**
     * @deprecated Please use alternative message implementation instead
     */
    info: TypeOpen;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    success: TypeOpen;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    error: TypeOpen;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    warning: TypeOpen;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    loading: TypeOpen;
  };

  export const Modal: typeof AntdModalStatic & {
    /**
     * @deprecated Please use alternative message implementation instead
     */
    confirm: ModalFunc;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    info: ModalFunc;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    success: ModalFunc;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    error: ModalFunc;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    warn: ModalFunc;
    /**
     * @deprecated Please use alternative message implementation instead
     */
    warning: ModalFunc;
  };
}
