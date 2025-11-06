import * as i18nKeys from '../Identifier/pages/page.request';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type Request18nInterface = typeof request18n;

export const request18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_REQUEST_TITLE,
  description: i18nKeys.PAGE_REQUEST_DESCRIPTION,
  content: i18nKeys.PAGE_REQUEST_DESCRIPTION,
  keywords: i18nKeys.PAGE_REQUEST_KEYWORDS,

  timeout: i18nKeys.PAGE_REQUEST_TIMEOUT,
  helloResult: i18nKeys.PAGE_REQUEST_HELLO_RESULT,
  helloError: i18nKeys.PAGE_REQUEST_HELLO_ERROR,
  ipInfoResult: i18nKeys.PAGE_REQUEST_IP_INFO_RESULT,
  ipInfo: i18nKeys.PAGE_REQUEST_IP_INFO,
  randomUser: i18nKeys.PAGE_REQUEST_RANDOM_USER,
  loading: i18nKeys.PAGE_REQUEST_LOADING,
  randomUserResult: i18nKeys.PAGE_REQUEST_RANDOM_USER_RESULT,
  randomUserError: i18nKeys.PAGE_REQUEST_RANDOM_USER_ERROR,
  abortResult: i18nKeys.PAGE_REQUEST_ABORT_RESULT,
  abortError: i18nKeys.PAGE_REQUEST_ABORT_ERROR,
  helloTitle: i18nKeys.PAGE_REQUEST_HELLO_TITLE,
  helloDescription: i18nKeys.PAGE_REQUEST_HELLO_DESCRIPTION,
  helloButton: i18nKeys.PAGE_REQUEST_HELLO_BUTTON,
  ipInfoTitle: i18nKeys.PAGE_REQUEST_IP_INFO_TITLE,
  ipInfoDescription: i18nKeys.PAGE_REQUEST_IP_INFO_DESCRIPTION,
  randomUserTitle: i18nKeys.PAGE_REQUEST_RANDOM_USER_TITLE,
  randomUserDescription: i18nKeys.PAGE_REQUEST_RANDOM_USER_DESCRIPTION,
  apiCatchTitle: i18nKeys.PAGE_REQUEST_API_CATCH_TITLE,
  abortTitle: i18nKeys.PAGE_REQUEST_ABORT_TITLE,
  triggerAbort: i18nKeys.PAGE_REQUEST_TRIGGER_ABORT,
  stopAbort: i18nKeys.PAGE_REQUEST_STOP_ABORT,
  triggerApiCatch: i18nKeys.PAGE_REQUEST_TRIGGER_API_CATCH
});
