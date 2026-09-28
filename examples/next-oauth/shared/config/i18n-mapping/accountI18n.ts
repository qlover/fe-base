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
  passwordSame: accountKeys.PAGE_ACCOUNT_PASSWORD_SAME
});

export type AccountI18nInterface = typeof accountI18n;
