import * as i18nKeys from '../Identifier/pages/page.register';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type Register18nInterface = typeof register18n;

export const register18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_REGISTER_TITLE,
  description: i18nKeys.PAGE_REGISTER_DESCRIPTION,
  content: i18nKeys.PAGE_REGISTER_DESCRIPTION,
  keywords: i18nKeys.PAGE_REGISTER_KEYWORDS,

  title2: i18nKeys.PAGE_REGISTER_TITLE2,
  subtitle: i18nKeys.PAGE_REGISTER_SUBTITLE,
  username: i18nKeys.PAGE_REGISTER_USERNAME,
  usernameRequired: i18nKeys.PAGE_REGISTER_USERNAME_REQUIRED,
  email: i18nKeys.PAGE_REGISTER_EMAIL,
  emailRequired: i18nKeys.PAGE_REGISTER_EMAIL_REQUIRED,
  password: i18nKeys.PAGE_REGISTER_PASSWORD,
  passwordRequired: i18nKeys.PAGE_REGISTER_PASSWORD_REQUIRED,
  confirmPassword: i18nKeys.PAGE_REGISTER_CONFIRM_PASSWORD,
  confirmPasswordRequired: i18nKeys.PAGE_REGISTER_CONFIRM_PASSWORD_REQUIRED,
  passwordMismatch: i18nKeys.PAGE_REGISTER_PASSWORD_MISMATCH,
  button: i18nKeys.PAGE_REGISTER_BUTTON,
  termsPrefix: i18nKeys.PAGE_REGISTER_TERMS_PREFIX,
  termsLink: i18nKeys.PAGE_REGISTER_TERMS_LINK,
  termsAnd: i18nKeys.PAGE_REGISTER_TERMS_AND,
  privacyLink: i18nKeys.PAGE_REGISTER_PRIVACY_LINK,
  haveAccount: i18nKeys.PAGE_REGISTER_HAVE_ACCOUNT,
  loginLink: i18nKeys.PAGE_REGISTER_LOGIN_LINK,
  featurePersonalized: i18nKeys.PAGE_REGISTER_FEATURE_PERSONALIZED,
  featureSupport: i18nKeys.PAGE_REGISTER_FEATURE_SUPPORT,
  featureCommunity: i18nKeys.PAGE_REGISTER_FEATURE_COMMUNITY,
  termsRequired: i18nKeys.PAGE_REGISTER_TERMS_REQUIRED
});
