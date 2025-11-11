import * as i18nKeys from '../Identifier/pages/page.login';

/**
 * Login page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type LoginI18nInterface = typeof loginI18n;

export const loginI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_LOGIN_TITLE,
  description: i18nKeys.PAGE_LOGIN_DESCRIPTION,
  content: i18nKeys.PAGE_LOGIN_CONTENT,
  keywords: i18nKeys.PAGE_LOGIN_KEYWORDS,

  // login page
  welcome: i18nKeys.PAGE_LOGIN_WELCOME,
  subtitle: i18nKeys.PAGE_LOGIN_SUBTITLE,
  feature_ai_paths: i18nKeys.PAGE_LOGIN_FEATURE_AI_PATHS,
  feature_smart_recommendations: i18nKeys.PAGE_LOGIN_FEATURE_SMART,
  feature_progress_tracking: i18nKeys.PAGE_LOGIN_TRACKING,

  // login form
  emailRequired: i18nKeys.PAGE_LOGIN_EMAIL_REQUIRED,
  email: i18nKeys.PAGE_LOGIN_EMAIL,
  emailTitle: i18nKeys.PAGE_LOGIN_EMAIL2,
  passwordRequired: i18nKeys.PAGE_LOGIN_PASSWORD_REQUIRED,
  password: i18nKeys.PAGE_LOGIN_PASSWORD,
  passwordTitle: i18nKeys.PAGE_LOGIN_PASSWORD2,
  forgotPasswordTitle: i18nKeys.PAGE_LOGIN_FORGOT_PASSWORD2,
  forgotPassword: i18nKeys.PAGE_LOGIN_FORGOT_PASSWORD,
  buttonTitle: i18nKeys.PAGE_LOGIN_BUTTON,
  button: i18nKeys.PAGE_LOGIN_BUTTON,
  continueWith: i18nKeys.PAGE_LOGIN_CONTINUE_WITH,
  withGoogleTitle: i18nKeys.PAGE_LOGIN_WITH_GOOGLE2,
  withGoogle: i18nKeys.PAGE_LOGIN_WITH_GOOGLE,
  noAccount: i18nKeys.PAGE_LOGIN_NO_ACCOUNT,
  createAccountTitle: i18nKeys.PAGE_LOGIN_CREATE_ACCOUNT2,
  createAccount: i18nKeys.PAGE_LOGIN_CREATE_ACCOUNT
});
