import { toast, type ExternalToast } from 'sonner';
import type {
  UIDialogInterface,
  NotificationOptions
} from '@qlover/corekit-bridge';

export interface DialogHandlerOptions extends NotificationOptions {
  /** App UI may pass ReactNode; kit stays free of `@types/react`. */
  title?: unknown;
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
 * Dialog / toast facade (sonner + optional React confirm host).
 * Antd static APIs are left to apps if needed.
 */
export class DialogHandler
  implements UIDialogInterface<DialogHandlerOptions>
{
  protected confirmHost: DialogConfirmHost | null = null;

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
