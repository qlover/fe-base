import * as i18nKeys from '../Identifier/pages/page.login';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type Login18nInterface = typeof login18n;

export const login18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_LOGIN_TITLE,
  description: i18nKeys.PAGE_LOGIN_DESCRIPTION,
  content: i18nKeys.PAGE_LOGIN_DESCRIPTION,
  keywords: i18nKeys.PAGE_LOGIN_KEYWORDS,

  title2: i18nKeys.PAGE_LOGIN_TITLE2,
  email: i18nKeys.PAGE_LOGIN_EMAIL,
  username: i18nKeys.PAGE_LOGIN_USERNAME,
  password: i18nKeys.PAGE_LOGIN_PASSWORD,
  button: i18nKeys.PAGE_LOGIN_BUTTON,
  welcome: i18nKeys.PAGE_LOGIN_WELCOME,
  subtitle: i18nKeys.PAGE_LOGIN_SUBTITLE,
  forgotPassword: i18nKeys.PAGE_LOGIN_FORGOT_PASSWORD,
  continueWith: i18nKeys.PAGE_LOGIN_CONTINUE_WITH,
  withGoogle: i18nKeys.PAGE_LOGIN_WITH_GOOGLE,
  noAccount: i18nKeys.PAGE_LOGIN_NO_ACCOUNT,
  createAccount: i18nKeys.PAGE_LOGIN_CREATE_ACCOUNT,
  emailRequired: i18nKeys.PAGE_LOGIN_EMAIL_REQUIRED,
  passwordRequired: i18nKeys.PAGE_LOGIN_PASSWORD_REQUIRED,
  featureAiPaths: i18nKeys.PAGE_LOGIN_FEATURE_AI_PATHS,
  featureSmartRecommendations:
    i18nKeys.PAGE_LOGIN_FEATURE_SMART_RECOMMENDATIONS,
  featureProgressTracking: i18nKeys.PAGE_LOGIN_FEATURE_PROGRESS_TRACKING,
  emailTitle: i18nKeys.PAGE_LOGIN_EMAIL_TITLE,
  passwordTitle: i18nKeys.PAGE_LOGIN_PASSWORD_TITLE,
  forgotPasswordTitle: i18nKeys.PAGE_LOGIN_FORGOT_PASSWORD_TITLE,
  buttonTitle: i18nKeys.PAGE_LOGIN_BUTTON_TITLE,
  withGoogleTitle: i18nKeys.PAGE_LOGIN_WITH_GOOGLE_TITLE,
  createAccountTitle: i18nKeys.PAGE_LOGIN_CREATE_ACCOUNT_TITLE
});
