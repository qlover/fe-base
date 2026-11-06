import * as forgotKeys from '../i18n-identifier/pages/page.forgot-password';
import * as resetKeys from '../i18n-identifier/pages/page.reset-password';

/** 忘记密码页（`/auth/forgot-password`）文案映射。 */
export const forgotPassword18n = Object.freeze({
  title: forgotKeys.PAGE_FORGOT_PASSWORD_TITLE,
  description: forgotKeys.PAGE_FORGOT_PASSWORD_DESCRIPTION,
  content: forgotKeys.PAGE_FORGOT_PASSWORD_CONTENT,
  keywords: forgotKeys.PAGE_FORGOT_PASSWORD_KEYWORDS,
  email: forgotKeys.PAGE_FORGOT_PASSWORD_EMAIL,
  emailInvalid: forgotKeys.PAGE_FORGOT_PASSWORD_EMAIL_INVALID,
  submit: forgotKeys.PAGE_FORGOT_PASSWORD_SUBMIT,
  sentTitle: forgotKeys.PAGE_FORGOT_PASSWORD_SENT_TITLE,
  sentMessage: forgotKeys.PAGE_FORGOT_PASSWORD_SENT_MESSAGE,
  unavailable: forgotKeys.PAGE_FORGOT_PASSWORD_UNAVAILABLE,
  backToLogin: forgotKeys.PAGE_FORGOT_PASSWORD_BACK_TO_LOGIN,
  error: forgotKeys.PAGE_FORGOT_PASSWORD_ERROR
});

export type ForgotPasswordI18nInterface = typeof forgotPassword18n;

/** 重置密码页（`/auth/reset-password`）文案映射。 */
export const resetPassword18n = Object.freeze({
  title: resetKeys.PAGE_RESET_PASSWORD_TITLE,
  description: resetKeys.PAGE_RESET_PASSWORD_DESCRIPTION,
  content: resetKeys.PAGE_RESET_PASSWORD_CONTENT,
  keywords: resetKeys.PAGE_RESET_PASSWORD_KEYWORDS,
  newPassword: resetKeys.PAGE_RESET_PASSWORD_NEW_PASSWORD,
  confirmPassword: resetKeys.PAGE_RESET_PASSWORD_CONFIRM_PASSWORD,
  invalid: resetKeys.PAGE_RESET_PASSWORD_INVALID,
  mismatch: resetKeys.PAGE_RESET_PASSWORD_MISMATCH,
  submit: resetKeys.PAGE_RESET_PASSWORD_SUBMIT,
  successTitle: resetKeys.PAGE_RESET_PASSWORD_SUCCESS_TITLE,
  successMessage: resetKeys.PAGE_RESET_PASSWORD_SUCCESS_MESSAGE,
  goLogin: resetKeys.PAGE_RESET_PASSWORD_GO_LOGIN,
  tokenInvalidTitle: resetKeys.PAGE_RESET_PASSWORD_TOKEN_INVALID_TITLE,
  tokenInvalidMessage: resetKeys.PAGE_RESET_PASSWORD_TOKEN_INVALID_MESSAGE,
  requestNew: resetKeys.PAGE_RESET_PASSWORD_REQUEST_NEW,
  verifying: resetKeys.PAGE_RESET_PASSWORD_VERIFYING,
  error: resetKeys.PAGE_RESET_PASSWORD_ERROR
});

export type ResetPasswordI18nInterface = typeof resetPassword18n;
