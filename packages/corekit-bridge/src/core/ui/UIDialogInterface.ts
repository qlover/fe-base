import { NotificationOptions } from './UINotificationInterface';

export interface UIDialogInterface<T extends NotificationOptions> {
  /**
   * Display success notification
   * @param message Notification message
   * @param options Configuration options
   */
  success(message: string, options?: T): void;

  /**
   * Display error notification
   * @param message Error message
   * @param options Configuration options
   */
  error(message: string, options?: T): void;

  /**
   * Display information notification
   * @param message Information message
   * @param options Configuration options
   */
  info(message: string, options?: T): void;

  /**
   * Display warning notification
   * @param message Warning message
   * @param options Configuration options
   */
  warn(message: string, options?: T): void;

  /**
   * Display confirmation dialog
   * @param options Confirmation dialog configuration options
   */
  confirm(options: T): void;
}
