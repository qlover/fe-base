import * as i18nKeys from '../i18n-identifier/page.404';

export const page404I18n = {
  title: i18nKeys.PAGE_404_TITLE,
  description: i18nKeys.PAGE_404_DESCRIPTION,
  content: i18nKeys.PAGE_404_CONTENT,
  keywords: i18nKeys.PAGE_404_KEYWORDS,
  backHome: i18nKeys.PAGE_404_BACK_HOME
} as const;

export type Page404I18nMapping = typeof page404I18n;
