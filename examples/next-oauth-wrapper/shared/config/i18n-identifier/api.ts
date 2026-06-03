/**
 * @description 服务器错误
 * @localZh 服务器错误
 * @localEn Server error
 */
export const API_SERVER_ERROR = 'api:server__error';

/**
 * @description 用户未找到
 * @localZh 用户未找到
 * @localEn User not found
 */
export const API_USER_NOT_FOUND = 'api:user__not_found';

/**
 * @description 用户未验证
 * @localZh 用户未验证
 * @localEn User not verified
 */
export const API_USER_NOT_VERIFIED = 'api:user__not_verfified';

/**
 * @description 用户已存在
 * @localZh 用户已存在
 * @localEn User already exists
 */
export const API_USER_ALREADY_EXISTS = 'api:user__already_exists';

/**
 * @description 响应不正确
 * @localZh 响应不正确
 * @localEn Response not correct
 */
export const API_RESPONSE_NOT_OK = 'api:RESPONSE_NOT_OK';

/**
 * @description 未授权
 * @localZh 未授权
 * @localEn Not authorized
 */
export const API_NOT_AUTHORIZED = 'api:not_authorized';

/**
 * @description 页码不正确
 * @localZh 页码不正确
 * @localEn Page number is incorrect
 */
export const API_PAGE_INVALID = 'api:page__invalid';

/**
 * @description 刷新用户信息失败
 * @localZh 刷新用户信息失败
 * @localEn Refresh user information failed
 */
export const API_REFRESH_USER_INFO_FAILED = 'api:refresh_user_info_failed';

// --- OAuth (RFC 6749 / OIDC) — use as App API `id` and map to RFC `error` on token/userinfo endpoints ---

/**
 * @description OAuth invalid request
 * @localZh 请求无效或参数不完整
 * @localEn Invalid OAuth request
 */
export const API_OAUTH_INVALID_REQUEST = 'api:oauth_invalid_request';

/**
 * @description OAuth invalid client credentials
 * @localZh 客户端认证失败
 * @localEn Invalid OAuth client
 */
export const API_OAUTH_INVALID_CLIENT = 'api:oauth_invalid_client';

/**
 * @description OAuth invalid or expired grant
 * @localZh 授权无效或已过期
 * @localEn Invalid OAuth grant
 */
export const API_OAUTH_INVALID_GRANT = 'api:oauth_invalid_grant';

/**
 * @description OAuth invalid or missing access token
 * @localZh 访问令牌无效
 * @localEn Invalid OAuth access token
 */
export const API_OAUTH_INVALID_TOKEN = 'api:oauth_invalid_token';

/**
 * @description OAuth client not authorized for this request
 * @localZh 客户端无权执行此操作
 * @localEn Unauthorized OAuth client
 */
export const API_OAUTH_UNAUTHORIZED_CLIENT = 'api:oauth_unauthorized_client';

/**
 * @description OAuth client not authorized for this request
 * @localZh 重定向错误
 * @localEn Redirect error
 */
export const API_REDIRECT_URL = 'api:redirect_url';

/**
 * @description OAuth scope not allowed
 * @localZh 请求的权限范围无效
 * @localEn Invalid OAuth scope
 */
export const API_OAUTH_INVALID_SCOPE = 'api:oauth_invalid_scope';

/**
 * @description OAuth resource owner denied consent
 * @localZh 用户拒绝授权
 * @localEn OAuth access denied
 */
export const API_OAUTH_ACCESS_DENIED = 'api:oauth_access_denied';

/**
 * @description OAuth unsupported response type
 * @localZh 不支持的 response_type
 * @localEn Unsupported OAuth response type
 */
export const API_OAUTH_UNSUPPORTED_RESPONSE_TYPE =
  'api:oauth_unsupported_response_type';

/**
 * @description OAuth unsupported grant type
 * @localZh 不支持的 grant_type
 * @localEn Unsupported OAuth grant type
 */
export const API_OAUTH_UNSUPPORTED_GRANT_TYPE =
  'api:oauth_unsupported_grant_type';

/**
 * @description OAuth authorization server error
 * @localZh 授权服务暂时不可用
 * @localEn OAuth server error
 */
export const API_OAUTH_SERVER_ERROR = 'api:oauth_server_error';

/**
 * @description OAuth wrapper upstream login failed during middleware sign-in
 * @localZh 登录失败，请检查账号或密码
 * @localEn OAuth wrapper sign-in failed
 */
export const API_OAUTH_WRAPPER_AUTH_FAILED = 'api:oauth_wrapper_auth_failed';
