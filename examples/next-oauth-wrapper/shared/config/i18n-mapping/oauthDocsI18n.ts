import { COMMON_ADMIN_TITLE } from '../i18n-identifier/common/common';
import * as i18nKeys from '../i18n-identifier/pages/page.docs-oauth';

export type OAuthDocsI18nInterface = typeof oauthDocsI18n;

export const oauthDocsI18nNamespace = 'page_docs_oauth';

export const oauthDocsI18n = Object.freeze({
  title: i18nKeys.PAGE_DOCS_OAUTH_TITLE,
  description: i18nKeys.PAGE_DOCS_OAUTH_DESCRIPTION,
  content: i18nKeys.PAGE_DOCS_OAUTH_CONTENT,
  keywords: i18nKeys.PAGE_DOCS_OAUTH_KEYWORDS,
  intro: i18nKeys.PAGE_DOCS_OAUTH_INTRO,
  sectionOverview: i18nKeys.PAGE_DOCS_OAUTH_SECTION_OVERVIEW,
  overviewBody: i18nKeys.PAGE_DOCS_OAUTH_OVERVIEW_BODY,
  sectionFlow: i18nKeys.PAGE_DOCS_OAUTH_SECTION_FLOW,
  flowStep1: i18nKeys.PAGE_DOCS_OAUTH_FLOW_STEP1,
  flowStep2: i18nKeys.PAGE_DOCS_OAUTH_FLOW_STEP2,
  flowStep3: i18nKeys.PAGE_DOCS_OAUTH_FLOW_STEP3,
  flowStep4: i18nKeys.PAGE_DOCS_OAUTH_FLOW_STEP4,
  flowStep5: i18nKeys.PAGE_DOCS_OAUTH_FLOW_STEP5,
  sectionEndpoints: i18nKeys.PAGE_DOCS_OAUTH_SECTION_ENDPOINTS,
  endpointAuthorize: i18nKeys.PAGE_DOCS_OAUTH_ENDPOINT_AUTHORIZE,
  endpointAuthorizeDesc: i18nKeys.PAGE_DOCS_OAUTH_ENDPOINT_AUTHORIZE_DESC,
  endpointToken: i18nKeys.PAGE_DOCS_OAUTH_ENDPOINT_TOKEN,
  endpointTokenDesc: i18nKeys.PAGE_DOCS_OAUTH_ENDPOINT_TOKEN_DESC,
  endpointUserinfo: i18nKeys.PAGE_DOCS_OAUTH_ENDPOINT_USERINFO,
  endpointUserinfoDesc: i18nKeys.PAGE_DOCS_OAUTH_ENDPOINT_USERINFO_DESC,
  sectionAuthorize: i18nKeys.PAGE_DOCS_OAUTH_SECTION_AUTHORIZE,
  authorizeParams: i18nKeys.PAGE_DOCS_OAUTH_AUTHORIZE_PARAMS,
  sectionToken: i18nKeys.PAGE_DOCS_OAUTH_SECTION_TOKEN,
  tokenAuthCode: i18nKeys.PAGE_DOCS_OAUTH_TOKEN_AUTH_CODE,
  tokenRefresh: i18nKeys.PAGE_DOCS_OAUTH_TOKEN_REFRESH,
  sectionPkce: i18nKeys.PAGE_DOCS_OAUTH_SECTION_PKCE,
  pkceBody: i18nKeys.PAGE_DOCS_OAUTH_PKCE_BODY,
  sectionUserinfo: i18nKeys.PAGE_DOCS_OAUTH_SECTION_USERINFO,
  userinfoBody: i18nKeys.PAGE_DOCS_OAUTH_USERINFO_BODY,
  sectionErrors: i18nKeys.PAGE_DOCS_OAUTH_SECTION_ERRORS,
  errorsBody: i18nKeys.PAGE_DOCS_OAUTH_ERRORS_BODY,
  linkPlayground: i18nKeys.PAGE_DOCS_OAUTH_LINK_PLAYGROUND,
  linkApi: i18nKeys.PAGE_DOCS_OAUTH_LINK_API,
  linkDeveloper: i18nKeys.PAGE_DOCS_OAUTH_LINK_DEVELOPER,
  adminTitle: COMMON_ADMIN_TITLE
});
