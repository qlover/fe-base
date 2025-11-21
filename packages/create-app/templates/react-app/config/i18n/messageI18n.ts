import * as i18nKeys from '../Identifier/pages/page.message';

/**
 * Message page i18n interface
 */
export type MessageI18nInterface = typeof messageI18n;

export const messageI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_MESSAGE_TITLE,
  description: i18nKeys.PAGE_MESSAGE_DESCRIPTION,
  content: i18nKeys.PAGE_MESSAGE_DESCRIPTION,
  keywords: i18nKeys.PAGE_MESSAGE_KEYWORDS
});
