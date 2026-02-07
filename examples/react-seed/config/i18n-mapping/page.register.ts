import * as i18nKeys from '../i18n-identifier/page.register';

export const pageRegisterI18n = {
  title: i18nKeys.PAGE_REGISTER_TITLE,
  description: i18nKeys.PAGE_REGISTER_DESCRIPTION,
  content: i18nKeys.PAGE_REGISTER_DESCRIPTION,
  keywords: i18nKeys.PAGE_REGISTER_TITLE,
  emailLabel: i18nKeys.PAGE_REGISTER_EMAIL_LABEL,
  emailPlaceholder: i18nKeys.PAGE_REGISTER_EMAIL_PLACEHOLDER,
  passwordLabel: i18nKeys.PAGE_REGISTER_PASSWORD_LABEL,
  passwordPlaceholder: i18nKeys.PAGE_REGISTER_PASSWORD_PLACEHOLDER,
  confirmPasswordLabel: i18nKeys.PAGE_REGISTER_CONFIRM_PASSWORD_LABEL,
  confirmPasswordPlaceholder:
    i18nKeys.PAGE_REGISTER_CONFIRM_PASSWORD_PLACEHOLDER,
  passwordMismatch: i18nKeys.PAGE_REGISTER_PASSWORD_MISMATCH,
  submit: i18nKeys.PAGE_REGISTER_SUBMIT,
  submitLoading: i18nKeys.PAGE_REGISTER_SUBMIT_LOADING,
  backHome: i18nKeys.PAGE_REGISTER_BACK_HOME,
  haveAccount: i18nKeys.PAGE_REGISTER_HAVE_ACCOUNT,
  signIn: i18nKeys.PAGE_REGISTER_SIGN_IN,
  heroTitle: i18nKeys.PAGE_REGISTER_HERO_TITLE,
  heroSubtitle: i18nKeys.PAGE_REGISTER_HERO_SUBTITLE,
  feature1: i18nKeys.PAGE_REGISTER_FEATURE_1,
  feature2: i18nKeys.PAGE_REGISTER_FEATURE_2,
  feature3: i18nKeys.PAGE_REGISTER_FEATURE_3
} as const;

export type RegisterI18nMapping = typeof pageRegisterI18n;
