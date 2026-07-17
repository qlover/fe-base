import * as i18nKeys from '../i18n-identifier/pages/page.login';

/**
 * Login page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type LoginI18nInterface = typeof loginI18n;

/**
 * Login page i18n namespace
 *
 * - /login/page.tsx
 *
 */
export const NS_PAGE_LOGIN = 'page_login';

export const loginI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_LOGIN_TITLE,
  description: i18nKeys.PAGE_LOGIN_DESCRIPTION,
  content: i18nKeys.PAGE_LOGIN_CONTENT,
  keywords: i18nKeys.PAGE_LOGIN_KEYWORDS,

  // login page
  badge: i18nKeys.PAGE_LOGIN_BADGE,
  welcome: i18nKeys.PAGE_LOGIN_WELCOME,
  subtitle: i18nKeys.PAGE_LOGIN_SUBTITLE,
  formSubtitle: i18nKeys.PAGE_LOGIN_FORM_SUBTITLE,
  demoNote: i18nKeys.PAGE_LOGIN_DEMO_NOTE,
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
  noAccount: i18nKeys.PAGE_LOGIN_NO_ACCOUNT,
  createAccountTitle: i18nKeys.PAGE_LOGIN_CREATE_ACCOUNT2,
  createAccount: i18nKeys.PAGE_LOGIN_CREATE_ACCOUNT,

  // login tab switch
  tabEmail: i18nKeys.PAGE_LOGIN_TAB_EMAIL,
  tabPhone: i18nKeys.PAGE_LOGIN_TAB_PHONE,

  // phone OTP login
  phoneTitle: i18nKeys.PAGE_LOGIN_PHONE_TITLE,
  phoneSubtitle: i18nKeys.PAGE_LOGIN_PHONE_SUBTITLE,
  phoneLabel: i18nKeys.PAGE_LOGIN_PHONE_LABEL,
  phonePlaceholder: i18nKeys.PAGE_LOGIN_PHONE_PLACEHOLDER,
  phoneInvalid: i18nKeys.PAGE_LOGIN_PHONE_INVALID,
  phoneSend: i18nKeys.PAGE_LOGIN_PHONE_SEND,
  phoneOtpLabel: i18nKeys.PAGE_LOGIN_PHONE_OTP_LABEL,
  phoneOtpPlaceholder: i18nKeys.PAGE_LOGIN_PHONE_OTP_PLACEHOLDER,
  phoneOtpInvalid: i18nKeys.PAGE_LOGIN_PHONE_OTP_INVALID,
  phoneVerify: i18nKeys.PAGE_LOGIN_PHONE_VERIFY,
  phoneCountdownSuffix: i18nKeys.PAGE_LOGIN_PHONE_COUNTDOWN_SUFFIX,
  phoneResend: i18nKeys.PAGE_LOGIN_PHONE_RESEND,
  phoneSuccess: i18nKeys.PAGE_LOGIN_PHONE_SUCCESS,

  // email OTP login
  emailOtpSubtitle: i18nKeys.PAGE_LOGIN_EMAIL_OTP_SUBTITLE,
  emailOtpSend: i18nKeys.PAGE_LOGIN_EMAIL_OTP_SEND,
  emailOtpLabel: i18nKeys.PAGE_LOGIN_EMAIL_OTP_LABEL,
  emailOtpPlaceholder: i18nKeys.PAGE_LOGIN_EMAIL_OTP_PLACEHOLDER,
  emailOtpInvalid: i18nKeys.PAGE_LOGIN_EMAIL_OTP_INVALID,
  emailOtpVerify: i18nKeys.PAGE_LOGIN_EMAIL_OTP_VERIFY,
  emailOtpCountdownSuffix: i18nKeys.PAGE_LOGIN_EMAIL_OTP_COUNTDOWN_SUFFIX,
  emailOtpResend: i18nKeys.PAGE_LOGIN_EMAIL_OTP_RESEND,
  emailOtpSuccess: i18nKeys.PAGE_LOGIN_EMAIL_OTP_SUCCESS,

  // switch between modes
  switchToOtp: i18nKeys.PAGE_LOGIN_SWITCH_TO_OTP,
  switchToPassword: i18nKeys.PAGE_LOGIN_SWITCH_TO_PASSWORD,

  // 这里的i18nkey 名与 config/common 中的 loginProviders value一致
  providerGoogle: i18nKeys.PAGE_LOGIN_WITH_GOOGLE,
  providerGitHub: i18nKeys.PAGE_LOGIN_WITH_GITHUB
});
