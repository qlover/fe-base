import { COMMON_ADMIN_TITLE } from '../i18n-identifier/common/common';
import * as i18nKeys from '../i18n-identifier/pages/page.changelog';

/**
 * Changelog 页 i18n 映射。
 */
export type ChangelogI18nInterface = typeof changelogI18n;

export const changelogI18nNamespace = 'page_changelog';

export const changelogI18n = Object.freeze({
  title: i18nKeys.PAGE_CHANGELOG_TITLE,
  description: i18nKeys.PAGE_CHANGELOG_DESCRIPTION,
  content: i18nKeys.PAGE_CHANGELOG_CONTENT,
  keywords: i18nKeys.PAGE_CHANGELOG_KEYWORDS,
  current: i18nKeys.PAGE_CHANGELOG_CURRENT,
  viewOnGithub: i18nKeys.PAGE_CHANGELOG_VIEW_ON_GITHUB,
  adminTitle: COMMON_ADMIN_TITLE
});
