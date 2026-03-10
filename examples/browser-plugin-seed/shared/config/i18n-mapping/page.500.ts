import * as i18nKeys from '../i18n-identifier/page.500';

export const page500I18n = {
  title: i18nKeys.PAGE_500_TITLE,
  description: i18nKeys.PAGE_500_DESCRIPTION,
  content: i18nKeys.PAGE_500_CONTENT,
  keywords: i18nKeys.PAGE_500_KEYWORDS,
  backHome: i18nKeys.PAGE_500_BACK_HOME
} as const;

export type Page500I18nMapping = typeof page500I18n;
