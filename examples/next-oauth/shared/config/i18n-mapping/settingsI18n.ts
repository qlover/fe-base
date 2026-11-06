import { COMMON_ADMIN_TITLE } from '../i18n-identifier/common/common';
import { PAGE_HOME_TITLE } from '../i18n-identifier/pages/page.home';
import * as keys from '../i18n-identifier/pages/page.settings';

/**
 * 用户设置中心 i18n 映射（Hub 壳 + 分区文案）。
 */
export const settingsI18n = Object.freeze({
  appBrandTitle: PAGE_HOME_TITLE,
  adminTitle: COMMON_ADMIN_TITLE,
  title: keys.PAGE_SETTINGS_TITLE,
  description: keys.PAGE_SETTINGS_DESCRIPTION,
  content: keys.PAGE_SETTINGS_DESCRIPTION,
  keywords: keys.PAGE_SETTINGS_KEYWORDS,
  hint: keys.PAGE_SETTINGS_HINT,
  back: keys.PAGE_SETTINGS_BACK,

  groupAccount: keys.PAGE_SETTINGS_GROUP_ACCOUNT,
  navSecurity: keys.PAGE_SETTINGS_NAV_SECURITY,
  navSecurityHint: keys.PAGE_SETTINGS_NAV_SECURITY_HINT,
  navLanguage: keys.PAGE_SETTINGS_NAV_LANGUAGE,
  navLanguageHint: keys.PAGE_SETTINGS_NAV_LANGUAGE_HINT,
  navAppearance: keys.PAGE_SETTINGS_NAV_APPEARANCE,
  navAppearanceHint: keys.PAGE_SETTINGS_NAV_APPEARANCE_HINT,
  navFeedback: keys.PAGE_SETTINGS_NAV_FEEDBACK,
  navFeedbackHint: keys.PAGE_SETTINGS_NAV_FEEDBACK_HINT,

  languageSection: keys.PAGE_SETTINGS_LANGUAGE_SECTION,
  languageHint: keys.PAGE_SETTINGS_LANGUAGE_HINT,
  languageFollowSystem: keys.PAGE_SETTINGS_LANGUAGE_FOLLOW_SYSTEM,
  languageSystemSection: keys.PAGE_SETTINGS_LANGUAGE_SYSTEM_SECTION,

  appearanceSection: keys.PAGE_SETTINGS_APPEARANCE_SECTION,
  appearanceHint: keys.PAGE_SETTINGS_APPEARANCE_HINT,

  accountLinkPassword: keys.PAGE_SETTINGS_ACCOUNT_LINK_PASSWORD,
  accountLinkFeedback: keys.PAGE_SETTINGS_ACCOUNT_LINK_FEEDBACK
});

export type SettingsI18nInterface = typeof settingsI18n;
