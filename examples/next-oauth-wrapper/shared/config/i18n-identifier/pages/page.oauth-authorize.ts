/**
 * @description OAuth authorize page title (header brand + meta)
 * @localZh Next OAuth Wrapper
 * @localEn Next OAuth Wrapper
 */
export const PAGE_OAUTH_AUTHORIZE_TITLE = 'page_oauth_authorize:title';

/**
 * @description OAuth authorize page meta description
 * @localZh OAuth 授权确认页面
 * @localEn OAuth authorization consent page
 */
export const PAGE_OAUTH_AUTHORIZE_DESCRIPTION =
  'page_oauth_authorize:description';

/**
 * @description OAuth authorize page content
 * @localZh OAuth 授权确认
 * @localEn OAuth authorization consent
 */
export const PAGE_OAUTH_AUTHORIZE_CONTENT = 'page_oauth_authorize:content';

/**
 * @description OAuth authorize page keywords
 * @localZh OAuth, 授权, Next OAuth Wrapper
 * @localEn OAuth, authorization, Next OAuth Wrapper
 */
export const PAGE_OAUTH_AUTHORIZE_KEYWORDS = 'page_oauth_authorize:keywords';

/**
 * @description Card heading
 * @localZh 授权请求
 * @localEn Authorization Request
 */
export const PAGE_OAUTH_AUTHORIZE_HEADING = 'page_oauth_authorize:heading';

/**
 * @description Card subtitle
 * @localZh 正在请求访问您的账户
 * @localEn is requesting access to your account
 */
export const PAGE_OAUTH_AUTHORIZE_SUBTITLE = 'page_oauth_authorize:subtitle';

/**
 * @description Application name label
 * @localZh 应用名称
 * @localEn Application
 */
export const PAGE_OAUTH_AUTHORIZE_APP_LABEL = 'page_oauth_authorize:app__label';

/**
 * @description Permissions section label
 * @localZh 请求的权限
 * @localEn Requested permissions
 */
export const PAGE_OAUTH_AUTHORIZE_PERMISSIONS_LABEL =
  'page_oauth_authorize:permissions__label';

/**
 * @description openid scope description
 * @localZh 使用您的身份信息登录
 * @localEn Authenticate using your identity
 */
export const PAGE_OAUTH_AUTHORIZE_PERM_OPENID =
  'page_oauth_authorize:perm__openid';

/**
 * @description email scope description
 * @localZh 查看您的电子邮件地址
 * @localEn View your email address
 */
export const PAGE_OAUTH_AUTHORIZE_PERM_EMAIL =
  'page_oauth_authorize:perm__email';

/**
 * @description profile scope description
 * @localZh 查看您的公开个人资料（姓名、头像）
 * @localEn View your public profile (name, avatar)
 */
export const PAGE_OAUTH_AUTHORIZE_PERM_PROFILE =
  'page_oauth_authorize:perm__profile';

/**
 * @description Extra permissions note
 * @localZh 该应用不会获取您的密码，仅访问您已同意的信息。
 * @localEn This app will never see your password.
 */
export const PAGE_OAUTH_AUTHORIZE_EXTRA_PERM_NOTE =
  'page_oauth_authorize:extra__perm__note';

/**
 * @description Trust app checkbox label
 * @localZh 信任此应用，以后不再询问
 * @localEn Trust this app and do not ask again
 */
export const PAGE_OAUTH_AUTHORIZE_TRUST_OPTION =
  'page_oauth_authorize:trust__option';

/**
 * @description Trust option tooltip
 * @localZh 您将直接授权该应用，无需再次确认。可在开发者控制台撤销。
 * @localEn You will authorize this app without further prompts. Revoke anytime in settings.
 */
export const PAGE_OAUTH_AUTHORIZE_TRUST_TOOLTIP =
  'page_oauth_authorize:trust__tooltip';

/**
 * @description Safety note
 * @localZh 仅授权您信任的应用。您可以随时在账号设置中撤销授权。
 * @localEn Only authorize apps you trust. You can revoke access anytime.
 */
export const PAGE_OAUTH_AUTHORIZE_SAFETY_NOTE =
  'page_oauth_authorize:safety__note';

/**
 * @description Deny button
 * @localZh 拒绝
 * @localEn Deny
 */
export const PAGE_OAUTH_AUTHORIZE_DENY = 'page_oauth_authorize:deny';

/**
 * @description Allow button
 * @localZh 同意授权
 * @localEn Allow
 */
export const PAGE_OAUTH_AUTHORIZE_ALLOW = 'page_oauth_authorize:allow';

/**
 * @description OAuth 2.0 badge
 * @localZh OAuth 2.0
 * @localEn OAuth 2.0
 */
export const PAGE_OAUTH_AUTHORIZE_OAUTH_BADGE =
  'page_oauth_authorize:oauth__badge';

/**
 * @description Deny confirmation message
 * @localZh 拒绝授权将导致第三方应用无法访问您的信息。确定拒绝？
 * @localEn Denying will prevent the app from accessing your information. Continue?
 */
export const PAGE_OAUTH_AUTHORIZE_DENY_CONFIRM =
  'page_oauth_authorize:deny__confirm';

/**
 * @description Footer tagline
 * @localZh 安全身份验证服务
 * @localEn Secure identity service
 */
export const PAGE_OAUTH_AUTHORIZE_FOOTER_TAGLINE =
  'page_oauth_authorize:footer__tagline';

/**
 * @description Generic invalid request error
 * @localZh 授权请求无效，请检查参数后重试。
 * @localEn The authorization request is invalid. Check the parameters and try again.
 */
export const PAGE_OAUTH_AUTHORIZE_ERROR_INVALID =
  'page_oauth_authorize:error__invalid';

/**
 * @description Unknown client error
 * @localZh 未找到该应用，client_id 无效。
 * @localEn Application not found. Invalid client_id.
 */
export const PAGE_OAUTH_AUTHORIZE_ERROR_CLIENT =
  'page_oauth_authorize:error__client';

/**
 * @description Redirect URI mismatch error
 * @localZh 回调地址未在该应用中注册。
 * @localEn redirect_uri is not registered for this application.
 */
export const PAGE_OAUTH_AUTHORIZE_ERROR_REDIRECT =
  'page_oauth_authorize:error__redirect';

/**
 * @description Invalid scope error
 * @localZh 请求的权限超出该应用允许的范围。
 * @localEn Requested scope is not allowed for this application.
 */
export const PAGE_OAUTH_AUTHORIZE_ERROR_SCOPE =
  'page_oauth_authorize:error__scope';

/**
 * @description Consent submission failed
 * @localZh 授权处理失败，请稍后重试。
 * @localEn Authorization failed. Please try again later.
 */
export const PAGE_OAUTH_AUTHORIZE_ERROR_CONSENT =
  'page_oauth_authorize:error__consent';
