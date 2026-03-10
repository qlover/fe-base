import * as i18nKeys from '../i18n-identifier/page.login';

export const pageLoginI18n = {
  title: i18nKeys.PAGE_LOGIN_TITLE,
  description: i18nKeys.PAGE_LOGIN_DESCRIPTION,
  content: i18nKeys.PAGE_LOGIN_DESCRIPTION,
  keywords: i18nKeys.PAGE_LOGIN_TITLE,
  usernameLabel: i18nKeys.PAGE_LOGIN_USERNAME_LABEL,
  usernamePlaceholder: i18nKeys.PAGE_LOGIN_USERNAME_PLACEHOLDER,
  passwordLabel: i18nKeys.PAGE_LOGIN_PASSWORD_LABEL,
  passwordPlaceholder: i18nKeys.PAGE_LOGIN_PASSWORD_PLACEHOLDER,
  rememberMe: i18nKeys.PAGE_LOGIN_REMEMBER_ME,
  forgotPassword: i18nKeys.PAGE_LOGIN_FORGOT_PASSWORD,
  submit: i18nKeys.PAGE_LOGIN_SUBMIT,
  submitLoading: i18nKeys.PAGE_LOGIN_SUBMIT_LOADING,
  backHome: i18nKeys.PAGE_LOGIN_BACK_HOME,
  noAccount: i18nKeys.PAGE_LOGIN_NO_ACCOUNT,
  signUp: i18nKeys.PAGE_LOGIN_SIGN_UP,
  orContinue: i18nKeys.PAGE_LOGIN_OR_CONTINUE,
  google: i18nKeys.PAGE_LOGIN_GOOGLE,
  github: i18nKeys.PAGE_LOGIN_GITHUB,
  heroTitle: i18nKeys.PAGE_LOGIN_HERO_TITLE,
  heroSubtitle: i18nKeys.PAGE_LOGIN_HERO_SUBTITLE,
  feature1: i18nKeys.PAGE_LOGIN_FEATURE_1,
  feature2: i18nKeys.PAGE_LOGIN_FEATURE_2,
  feature3: i18nKeys.PAGE_LOGIN_FEATURE_3
} as const;

export type LoginI18nMapping = typeof pageLoginI18n;
