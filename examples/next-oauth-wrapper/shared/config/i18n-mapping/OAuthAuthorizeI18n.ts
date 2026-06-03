import {
  API_OAUTH_INVALID_REQUEST,
  API_OAUTH_INVALID_SCOPE,
  API_REDIRECT_URL,
  API_OAUTH_UNSUPPORTED_RESPONSE_TYPE
} from '../i18n-identifier/api';
import { COMMON_ADMIN_TITLE } from '../i18n-identifier/common/common';
import * as i18nKeys from '../i18n-identifier/pages/page.oauth-authorize';

/**
 * OAuth authorize page i18n interface
 */
export type OAuthAuthorizeI18nInterface = typeof oauthAuthorizeI18n;

export const oauthAuthorizeI18nNamespace = 'page_oauth_authorize';

export const oauthAuthorizeI18n = Object.freeze({
  title: i18nKeys.PAGE_OAUTH_AUTHORIZE_TITLE,
  description: i18nKeys.PAGE_OAUTH_AUTHORIZE_DESCRIPTION,
  content: i18nKeys.PAGE_OAUTH_AUTHORIZE_CONTENT,
  keywords: i18nKeys.PAGE_OAUTH_AUTHORIZE_KEYWORDS,

  heading: i18nKeys.PAGE_OAUTH_AUTHORIZE_HEADING,
  subtitle: i18nKeys.PAGE_OAUTH_AUTHORIZE_SUBTITLE,
  appLabel: i18nKeys.PAGE_OAUTH_AUTHORIZE_APP_LABEL,
  permissionsLabel: i18nKeys.PAGE_OAUTH_AUTHORIZE_PERMISSIONS_LABEL,
  permOpenid: i18nKeys.PAGE_OAUTH_AUTHORIZE_PERM_OPENID,
  permEmail: i18nKeys.PAGE_OAUTH_AUTHORIZE_PERM_EMAIL,
  permProfile: i18nKeys.PAGE_OAUTH_AUTHORIZE_PERM_PROFILE,
  extraPermNote: i18nKeys.PAGE_OAUTH_AUTHORIZE_EXTRA_PERM_NOTE,
  trustOption: i18nKeys.PAGE_OAUTH_AUTHORIZE_TRUST_OPTION,
  trustTooltip: i18nKeys.PAGE_OAUTH_AUTHORIZE_TRUST_TOOLTIP,
  safetyNote: i18nKeys.PAGE_OAUTH_AUTHORIZE_SAFETY_NOTE,
  deny: i18nKeys.PAGE_OAUTH_AUTHORIZE_DENY,
  allow: i18nKeys.PAGE_OAUTH_AUTHORIZE_ALLOW,
  oauthBadge: i18nKeys.PAGE_OAUTH_AUTHORIZE_OAUTH_BADGE,
  denyConfirm: i18nKeys.PAGE_OAUTH_AUTHORIZE_DENY_CONFIRM,
  footerTagline: i18nKeys.PAGE_OAUTH_AUTHORIZE_FOOTER_TAGLINE,
  errorInvalid: i18nKeys.PAGE_OAUTH_AUTHORIZE_ERROR_INVALID,
  errorClient: i18nKeys.PAGE_OAUTH_AUTHORIZE_ERROR_CLIENT,
  errorRedirect: i18nKeys.PAGE_OAUTH_AUTHORIZE_ERROR_REDIRECT,
  errorScope: i18nKeys.PAGE_OAUTH_AUTHORIZE_ERROR_SCOPE,
  errorConsent: i18nKeys.PAGE_OAUTH_AUTHORIZE_ERROR_CONSENT,

  adminTitle: COMMON_ADMIN_TITLE
});

export function resolveAuthorizeErrorMessage(
  tt: OAuthAuthorizeI18nInterface,
  errorKey: string,
  fallback: string
): string {
  switch (errorKey) {
    case API_REDIRECT_URL:
      return fallback.includes('redirect_uri')
        ? tt.errorRedirect
        : tt.errorClient;
    case API_OAUTH_INVALID_SCOPE:
      return tt.errorScope;
    case API_OAUTH_INVALID_REQUEST:
    case API_OAUTH_UNSUPPORTED_RESPONSE_TYPE:
      return tt.errorInvalid;
    default:
      return fallback || tt.errorInvalid;
  }
}

export function resolveScopeLabel(
  tt: OAuthAuthorizeI18nInterface,
  scope: string
): string {
  switch (scope) {
    case 'openid':
      return tt.permOpenid;
    case 'email':
      return tt.permEmail;
    case 'profile':
      return tt.permProfile;
    default:
      return scope;
  }
}
