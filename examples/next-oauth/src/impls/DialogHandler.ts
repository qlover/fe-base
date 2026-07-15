import { toast, type ExternalToast } from 'sonner';
import type {
  AntdStaticApiInterface,
  MessageApi,
  ModalApi,
  NotificationApi
} from '@brain-toolkit/antd-theme-override/react';
import type {
  UIDialogInterface,
  NotificationOptions
} from '@qlover/corekit-bridge';
import type { ReactNode } from 'react';

export interface DialogHandlerOptions extends NotificationOptions {
  title?: ReactNode;
  content: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  /** Maps to confirm button style. */
  okType?: 'danger' | 'primary' | 'default';
}

export type DialogConfirmHost = {
  open: (options: DialogHandlerOptions) => void;
};

/**
 * Dialog / toast facade.
 * Toasts: sonner. Confirm: registered React host (PAM-style modal).
 */
export class DialogHandler
  implements UIDialogInterface<DialogHandlerOptions>, AntdStaticApiInterface
{
  protected confirmHost: DialogConfirmHost | null = null;

  /**
   * Kept for AntdThemeProvider compatibility; no longer used for toasts.

   * @override
      */
  public setMessage(_message: MessageApi): void {}

  /**
   * Kept for AntdThemeProvider compatibility; confirm uses {@link bindConfirmHost}.

   * @override
      */
  public setModal(_modal: ModalApi): void {}

  /**
   * @override
   */
  public setNotification(_notification: NotificationApi): void {}

  public bindConfirmHost(host: DialogConfirmHost): () => void {
    this.confirmHost = host;
    return () => {
      if (this.confirmHost === host) {
        this.confirmHost = null;
      }
    };
  }

  protected formatErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
  }

  protected toastOptions(options?: NotificationOptions): ExternalToast {
    return {
      duration: options?.duration,
      onDismiss: options?.onClose,
      onAutoClose: options?.onClose
    };
  }

  /**
   * @override
   */
  public success(msg: string, options?: NotificationOptions): void {
    toast.success(msg, this.toastOptions(options));
  }

  /**
   * @override
   */
  public error(msg: string, options?: NotificationOptions): void {
    toast.error(
      options?.error ? this.formatErrorMessage(options.error) : msg,
      this.toastOptions(options)
    );
  }

  /**
   * @override
   */
  public info(msg: string, options?: NotificationOptions): void {
    toast.message(msg, this.toastOptions(options));
  }

  /**
   * @override
   */
  public warn(msg: string, options?: NotificationOptions): void {
    toast.warning(msg, this.toastOptions(options));
  }

  /** Alias for antd `message.warning` call sites. */
  public warning(msg: string, options?: NotificationOptions): void {
    this.warn(msg, options);
  }

  /**
   * @override
   */
  public confirm(options: DialogHandlerOptions): void {
    if (!this.confirmHost) {
      console.warn(
        '[DialogHandler] confirm host is not registered; call ignored.'
      );
      return;
    }
    this.confirmHost.open(options);
  }
}
