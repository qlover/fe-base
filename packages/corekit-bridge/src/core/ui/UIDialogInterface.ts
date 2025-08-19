import { NotificationOptions } from './UINotificationInterface';

export interface UIDialogInterface {
  /**
   * Display success notification
   * @param message Notification message
   * @param options Configuration options
   */
  success(message: string, options?: NotificationOptions): void;

  /**
   * Display error notification
   * @param message Error message
   * @param options Configuration options
   */
  error(message: string, options?: NotificationOptions): void;

  /**
   * Display information notification
   * @param message Information message
   * @param options Configuration options
   */
  info(message: string, options?: NotificationOptions): void;

  /**
   * Display warning notification
   * @param message Warning message
   * @param options Configuration options
   */
  warn(message: string, options?: NotificationOptions): void;

  /**
   * Display confirmation dialog
   * @param options Confirmation dialog configuration options
   */
  confirm(options: unknown): void;
}
