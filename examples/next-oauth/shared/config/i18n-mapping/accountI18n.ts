import { COMMON_CANCEL, COMMON_SAVE } from '../i18n-identifier/common/common';
import * as accountKeys from '../i18n-identifier/pages/page.account';
import { PAGE_HOME_TITLE } from '../i18n-identifier/pages/page.home';

export const accountI18n = Object.freeze({
  appBrandTitle: PAGE_HOME_TITLE,
  title: accountKeys.PAGE_ACCOUNT_TITLE,
  description: accountKeys.PAGE_ACCOUNT_DESCRIPTION,
  content: accountKeys.PAGE_ACCOUNT_DESCRIPTION,
  keywords: accountKeys.PAGE_ACCOUNT_KEYWORDS,

  sectionTitle: accountKeys.PAGE_ACCOUNT_SECTION_TITLE,
  displayNameLabel: accountKeys.PAGE_ACCOUNT_DISPLAY_NAME_LABEL,
  displayNamePlaceholder: accountKeys.PAGE_ACCOUNT_DISPLAY_NAME_PLACEHOLDER,
  displayNameEdit: accountKeys.PAGE_ACCOUNT_DISPLAY_NAME_EDIT,
  displayNameSuccess: accountKeys.PAGE_ACCOUNT_DISPLAY_NAME_SUCCESS,
  displayNameError: accountKeys.PAGE_ACCOUNT_DISPLAY_NAME_ERROR,
  displayNameInvalid: accountKeys.PAGE_ACCOUNT_DISPLAY_NAME_INVALID,
  save: COMMON_SAVE,
  cancel: COMMON_CANCEL,
  phoneLabel: accountKeys.PAGE_ACCOUNT_PHONE_LABEL,
  emailLabel: accountKeys.PAGE_ACCOUNT_EMAIL_LABEL,
  userIdLabel: accountKeys.PAGE_ACCOUNT_USER_ID_LABEL,
  valueEmpty: accountKeys.PAGE_ACCOUNT_VALUE_EMPTY,

  passwordSectionTitle: accountKeys.PAGE_ACCOUNT_PASSWORD_SECTION_TITLE,
  passwordDescription: accountKeys.PAGE_ACCOUNT_PASSWORD_DESCRIPTION,
  passwordNoPasswordHint: accountKeys.PAGE_ACCOUNT_PASSWORD_NO_PASSWORD_HINT,
  passwordEmailRequired: accountKeys.PAGE_ACCOUNT_PASSWORD_EMAIL_REQUIRED,
  passwordCurrentPlaceholder:
    accountKeys.PAGE_ACCOUNT_PASSWORD_CURRENT_PLACEHOLDER,
  passwordNewPlaceholder: accountKeys.PAGE_ACCOUNT_PASSWORD_NEW_PLACEHOLDER,
  passwordConfirmPlaceholder:
    accountKeys.PAGE_ACCOUNT_PASSWORD_CONFIRM_PLACEHOLDER,
  passwordSubmit: accountKeys.PAGE_ACCOUNT_PASSWORD_SUBMIT,
  passwordSuccess: accountKeys.PAGE_ACCOUNT_PASSWORD_SUCCESS,
  passwordError: accountKeys.PAGE_ACCOUNT_PASSWORD_ERROR,
  passwordInvalid: accountKeys.PAGE_ACCOUNT_PASSWORD_INVALID,
  passwordMismatch: accountKeys.PAGE_ACCOUNT_PASSWORD_MISMATCH,
  passwordSame: accountKeys.PAGE_ACCOUNT_PASSWORD_SAME,

  bindHint: accountKeys.PAGE_ACCOUNT_BIND_HINT,
  bindSectionTitle: accountKeys.PAGE_ACCOUNT_BIND_SECTION_TITLE,
  bindDescription: accountKeys.PAGE_ACCOUNT_BIND_DESCRIPTION,
  bindMergeHint: accountKeys.PAGE_ACCOUNT_BIND_MERGE_HINT,
  bindEmailPlaceholder: accountKeys.PAGE_ACCOUNT_BIND_EMAIL_PLACEHOLDER,
  bindOtpPlaceholder: accountKeys.PAGE_ACCOUNT_BIND_OTP_PLACEHOLDER,
  bindSend: accountKeys.PAGE_ACCOUNT_BIND_SEND,
  bindResend: accountKeys.PAGE_ACCOUNT_BIND_RESEND,
  bindVerify: accountKeys.PAGE_ACCOUNT_BIND_VERIFY,
  bindSuccess: accountKeys.PAGE_ACCOUNT_BIND_SUCCESS,
  bindSuccessMerged: accountKeys.PAGE_ACCOUNT_BIND_SUCCESS_MERGED,
  bindError: accountKeys.PAGE_ACCOUNT_BIND_ERROR,

  linkedSectionTitle: accountKeys.PAGE_ACCOUNT_LINKED_SECTION_TITLE,
  linkedEmpty: accountKeys.PAGE_ACCOUNT_LINKED_EMPTY,
  linked: accountKeys.PAGE_ACCOUNT_LINKED,
  linkedLastLogin: accountKeys.PAGE_ACCOUNT_LINKED_LAST_LOGIN,
  linkedError: accountKeys.PAGE_ACCOUNT_LINKED_ERROR,

  feedbackSectionTitle: accountKeys.PAGE_ACCOUNT_FEEDBACK_SECTION_TITLE,
  feedbackDescription: accountKeys.PAGE_ACCOUNT_FEEDBACK_DESCRIPTION,
  feedbackCategoryLabel: accountKeys.PAGE_ACCOUNT_FEEDBACK_CATEGORY_LABEL,
  feedbackBodyLabel: accountKeys.PAGE_ACCOUNT_FEEDBACK_BODY_LABEL,
  feedbackBodyPlaceholder: accountKeys.PAGE_ACCOUNT_FEEDBACK_BODY_PLACEHOLDER,
  feedbackSubmit: accountKeys.PAGE_ACCOUNT_FEEDBACK_SUBMIT,
  feedbackSuccess: accountKeys.PAGE_ACCOUNT_FEEDBACK_SUCCESS,
  feedbackError: accountKeys.PAGE_ACCOUNT_FEEDBACK_ERROR,
  feedbackCategoryBug: accountKeys.PAGE_ACCOUNT_FEEDBACK_CATEGORY_BUG,
  feedbackCategoryUx: accountKeys.PAGE_ACCOUNT_FEEDBACK_CATEGORY_UX,
  feedbackCategoryFeature: accountKeys.PAGE_ACCOUNT_FEEDBACK_CATEGORY_FEATURE,
  feedbackCategoryPerformance:
    accountKeys.PAGE_ACCOUNT_FEEDBACK_CATEGORY_PERFORMANCE,
  feedbackCategoryContent: accountKeys.PAGE_ACCOUNT_FEEDBACK_CATEGORY_CONTENT,
  feedbackCategoryOther: accountKeys.PAGE_ACCOUNT_FEEDBACK_CATEGORY_OTHER
});

export type AccountI18nInterface = typeof accountI18n;
