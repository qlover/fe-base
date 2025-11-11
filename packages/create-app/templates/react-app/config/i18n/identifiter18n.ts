import * as i18nKeys from '../Identifier/pages/page.identifiter';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type Identifiter18nInterface = typeof identifiter18n;

export const identifiter18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_IDENTIFITER_TITLE,
  description: i18nKeys.PAGE_IDENTIFITER_DESCRIPTION,
  content: i18nKeys.PAGE_IDENTIFITER_DESCRIPTION,
  keywords: i18nKeys.PAGE_IDENTIFITER_KEYWORDS,

  sourceDescription: i18nKeys.PAGE_IDENTIFITER_SOURCE_DESCRIPTION,
  helpTitle: i18nKeys.PAGE_IDENTIFITER_HELP_TITLE,
  helpDescription: i18nKeys.PAGE_IDENTIFITER_HELP_DESCRIPTION,
  contactSupport: i18nKeys.PAGE_IDENTIFITER_CONTACT_SUPPORT
});
