import type {
  AntdStaticApiInterface,
  MessageApi,
  ModalApi,
  NotificationApi
} from '@brain-toolkit/antd-theme-override/react';
import { UIDialogInterface, NotificationOptions } from '@qlover/corekit-bridge';
import { ModalFuncProps } from 'antd';

export interface DialogHandlerOptions
  extends NotificationOptions,
    ModalFuncProps {
  content: string;
}

/**
 * Dialog Handler Implementation
 *
 * Implements the InteractionHubInterface using Ant Design components.
 * Provides concrete implementations for displaying notifications and confirmation dialogs.
 *
 * Features:
 * - Uses Ant Design's message component for notifications
 * - Uses Ant Design's Modal component for confirmations
 * - Supports customizable display durations
 * - Handles error objects appropriately
 *
 * @example
 * const dialog = new DialogHandler();
 * dialog.success('Data saved successfully');
 * dialog.confirm({
 *   title: 'Confirm Delete',
 *   content: 'Are you sure you want to delete this item?',
 *   onOk: () => handleDelete(),
 * });
 */
export class DialogHandler
  implements UIDialogInterface<DialogHandlerOptions>, AntdStaticApiInterface
{
  protected antds: {
    message?: MessageApi;
    modal?: ModalApi;
    notification?: NotificationApi;
  } = {};

  setMessage(message: MessageApi): void {
    this.antds.message = message;
  }

  setModal(modal: ModalApi): void {
    this.antds.modal = modal;
  }

  setNotification(notification: NotificationApi): void {
    this.antds.notification = notification;
  }

  /**
   * Formats error message from various error types
   */
  protected formatErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
  }

  public success(msg: string, options?: NotificationOptions): void {
    this.antds.message?.success({ content: msg, ...options });
  }

  public error(msg: string, options?: NotificationOptions): void {
    this.antds.message?.error({
      content: options?.error ? this.formatErrorMessage(options.error) : msg,
      ...options
    });
  }

  public info(msg: string, options?: NotificationOptions): void {
    this.antds.message?.info({ content: msg, ...options });
  }

  public warn(msg: string, options?: NotificationOptions): void {
    this.antds.message?.warning({ content: msg, ...options });
  }

  public confirm(options: DialogHandlerOptions): void {
    this.antds.modal?.confirm(options);
  }
}
