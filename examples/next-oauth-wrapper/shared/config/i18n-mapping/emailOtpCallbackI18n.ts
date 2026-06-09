import * as i18nKeys from '../i18n-identifier/pages/page.email-otp-callback';

/**
 * Email OTP Callback page i18n interface
 */
export type EmailOtpCallbackI18nInterface = typeof emailOtpCallbackI18n;

/**
 * Email OTP Callback page i18n namespace
 *
 * - /auth/email-otp-callback/page.tsx
 */
export const NS_PAGE_EMAIL_OTP_CALLBACK = 'page_email_otp_callback';

export const emailOtpCallbackI18n = Object.freeze({
  // basic meta properties (required by PageI18nInterface)
  title: i18nKeys.PAGE_EMAIL_OTP_CB_TITLE,
  description: i18nKeys.PAGE_EMAIL_OTP_CB_DESCRIPTION,
  content: i18nKeys.PAGE_EMAIL_OTP_CB_CONTENT,
  keywords: i18nKeys.PAGE_EMAIL_OTP_CB_KEYWORDS,

  // callback page UI text
  authenticating: i18nKeys.PAGE_EMAIL_OTP_CB_AUTHENTICATING,
  establishing: i18nKeys.PAGE_EMAIL_OTP_CB_ESTABLISHING,
  error: i18nKeys.PAGE_EMAIL_OTP_CB_ERROR,
  subtitle: i18nKeys.PAGE_EMAIL_OTP_CB_SUBTITLE
});
