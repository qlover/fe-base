import * as i18nKeys from '../Identifier/page.register';

/**
 * Register page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type RegisterI18nInterface = typeof register18n;

export const register18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_REGISTER_TITLE,
  description: i18nKeys.PAGE_REGISTER_DESCRIPTION,
  content: i18nKeys.PAGE_REGISTER_CONTENT,
  keywords: i18nKeys.PAGE_REGISTER_KEYWORDS,

  // register page
  welcome: i18nKeys.REGISTER_WELCOME,
  subtitle: i18nKeys.REGISTER_SUBTITLE,
  feature_ai_paths: i18nKeys.REGISTER_FEATURE_AI_PATHS,
  feature_smart_recommendations:
    i18nKeys.REGISTER_FEATURE_SMART_RECOMMENDATIONS,
  feature_progress_tracking: i18nKeys.REGISTER_FEATURE_PROGRESS_TRACKING,

  // register form
  username: i18nKeys.REGISTER_USERNAME,
  username_required: i18nKeys.REGISTER_USERNAME_REQUIRED,
  email: i18nKeys.REGISTER_EMAIL,
  email_required: i18nKeys.REGISTER_EMAIL_REQUIRED,
  password: i18nKeys.REGISTER_PASSWORD,
  password_required: i18nKeys.REGISTER_PASSWORD_REQUIRED,
  confirm_password_required: i18nKeys.REGISTER_CONFIRM_PASSWORD_REQUIRED,
  password_mismatch: i18nKeys.REGISTER_PASSWORD_MISMATCH,
  button: i18nKeys.REGISTER_BUTTON,
  terms_prefix: i18nKeys.REGISTER_TERMS_PREFIX,
  terms_link: i18nKeys.REGISTER_TERMS_LINK,
  terms_and: i18nKeys.REGISTER_TERMS_AND,
  privacy_link: i18nKeys.REGISTER_PRIVACY_LINK,
  have_account: i18nKeys.REGISTER_HAVE_ACCOUNT,
  confirm_password: i18nKeys.REGISTER_CONFIRM_PASSWORD,
  terms_required: i18nKeys.REGISTER_TERMS_REQUIRED,
  login_link: i18nKeys.REGISTER_LOGIN_LINK
});
