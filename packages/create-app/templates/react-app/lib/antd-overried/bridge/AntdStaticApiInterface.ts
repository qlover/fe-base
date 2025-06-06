import type {
  message as messageApi,
  Modal as modalApi,
  notification as notificationApi
} from 'antd';

export type MessageApi = ReturnType<typeof messageApi.useMessage>[0];
export type ModalApi = ReturnType<typeof modalApi.useModal>[0];
export type NotificationApi = ReturnType<
  typeof notificationApi.useNotification
>[0];

/**
 * Antd Static Api Interface
 *
 * Significance: Provides a bridge for managing Antd's static APIs globally
 * Core idea: Centralize the management of Antd's message, modal, and notification APIs
 * Main function: Set and manage Antd's static API instances
 * Main purpose: Enable global access to Antd's commonly used feedback components
 *
 * @example
 * const antdBridge: AntdStaticApiInterface = {
 *   setMessage: (msg) => { ... },
 *   setModal: (modal) => { ... },
 *   setNotification: (notification) => { ... }
 * };
 */
export interface AntdStaticApiInterface {
  /**
   * Sets the message API instance
   * @param message - Antd message API instance for displaying global messages
   */
  setMessage(message: MessageApi): void;

  /**
   * Sets the modal API instance
   * @param modal - Antd modal API instance for displaying modal dialogs
   */
  setModal(modal: ModalApi): void;

  /**
   * Sets the notification API instance
   * @param notification - Antd notification API instance for displaying notifications
   */
  setNotification(notification: NotificationApi): void;
}
