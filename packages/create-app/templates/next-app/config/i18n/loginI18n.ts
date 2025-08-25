import * as i18nKeys from '../Identifier/page.login';

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
  welcome: i18nKeys.LOGIN_WELCOME,
  subtitle: i18nKeys.LOGIN_SUBTITLE,
  feature_ai_paths: i18nKeys.LOGIN_FEATURE_AI_PATHS,
  feature_smart_recommendations: i18nKeys.LOGIN_FEATURE_SMART_RECOMMENDATIONS,
  feature_progress_tracking: i18nKeys.LOGIN_FEATURE_PROGRESS_TRACKING,

  // login form
  emailRequired: i18nKeys.LOGIN_EMAIL_REQUIRED,
  email: i18nKeys.LOGIN_EMAIL,
  emailTitle: i18nKeys.LOGIN_EMAIL_TITLE,
  passwordRequired: i18nKeys.LOGIN_PASSWORD_REQUIRED,
  password: i18nKeys.LOGIN_PASSWORD,
  passwordTitle: i18nKeys.LOGIN_PASSWORD_TITLE,
  forgotPasswordTitle: i18nKeys.LOGIN_FORGOT_PASSWORD_TITLE,
  forgotPassword: i18nKeys.LOGIN_FORGOT_PASSWORD,
  buttonTitle: i18nKeys.LOGIN_BUTTON_TITLE,
  button: i18nKeys.LOGIN_BUTTON,
  continueWith: i18nKeys.LOGIN_CONTINUE_WITH,
  withGoogleTitle: i18nKeys.LOGIN_WITH_GOOGLE_TITLE,
  withGoogle: i18nKeys.LOGIN_WITH_GOOGLE,
  noAccount: i18nKeys.LOGIN_NO_ACCOUNT,
  createAccountTitle: i18nKeys.LOGIN_CREATE_ACCOUNT_TITLE,
  createAccount: i18nKeys.LOGIN_CREATE_ACCOUNT
});
