import * as i18nKeys from '../Identifier/components/component.chatMessage';

/**
 * ChatMessage component i18n interface
 */
export type ChatMessageI18nInterface = typeof chatMessageI18n;

export const chatMessageI18n = Object.freeze({
  send: i18nKeys.COMPONENT_CHAT_SEND,
  stop: i18nKeys.COMPONENT_CHAT_STOP,
  loading: i18nKeys.COMPONENT_CHAT_LOADING,
  inputPlaceholder: i18nKeys.COMPONENT_CHAT_INPUT_PLACEHOLDER,
  empty: i18nKeys.COMPONENT_CHAT_EMPTY,
  start: i18nKeys.COMPONENT_CHAT_START,
  retry: i18nKeys.COMPONENT_CHAT_RETRY,
  duration: i18nKeys.COMPONENT_CHAT_DURATION
});
