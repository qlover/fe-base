import * as i18nKeys from '../Identifier/components/component.messageBaseList';

/**
 * MessageBaseList component i18n interface
 */
export type MessageBaseListI18nInterface = typeof messageBaseListI18n;

export const messageBaseListI18n = Object.freeze({
  title: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_TITLE,
  description: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_DESCRIPTION,
  noMessages: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_NO_MESSAGES,
  getStarted: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_GET_STARTED,
  user: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_USER,
  gateway: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_GATEWAY,
  processing: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_PROCESSING,
  gatewayFailed: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_GATEWAY_FAILED,
  sendFailed: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_SEND_FAILED,
  gatewayResponse: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_GATEWAY_RESPONSE,
  inputPlaceholder: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_INPUT_PLACEHOLDER,
  sendButton: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_SEND_BUTTON,
  errorTip: i18nKeys.COMPONENT_MESSAGE_BASE_LIST_ERROR_TIP
});
