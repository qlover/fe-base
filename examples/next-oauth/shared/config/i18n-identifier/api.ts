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
 * @description Cannot change own system role
 * @localZh 不能修改自己的系统角色
 * @localEn Cannot change your own system role
 */
export const API_ADMIN_USERS_CANNOT_CHANGE_SELF =
  'api:admin_users_cannot_change_self';

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

/**
 * @description Supabase / Auth invalid email or password
 * @localZh 邮箱或密码错误
 * @localEn Invalid login credentials
 */
export const API_INVALID_CREDENTIALS = 'api:invalid_credentials';

/**
 * @description Supabase auth: email not confirmed
 * @localZh 请先验证邮箱后再登录
 * @localEn Please confirm your email before signing in
 */
export const API_EMAIL_NOT_CONFIRMED = 'api:email_not_confirmed';

/**
 * @description Generic Supabase auth failure
 * @localZh 登录失败，请稍后重试
 * @localEn Authentication failed, please try again
 */
export const API_SUPABASE_AUTH_ERROR = 'api:supabase_auth_error';

/**
 * @description Password rejected by auth server policy
 * @localZh 密码强度不足，请换一个更复杂的密码
 * @localEn Password is too weak, please choose a stronger one
 */
export const API_PASSWORD_WEAK = 'api:password_weak';

/**
 * @description New password equals the current one (auth server)
 * @localZh 新密码不能与当前密码相同
 * @localEn New password must differ from the current one
 */
export const API_PASSWORD_SAME = 'api:password_same';

/**
 * @description Password reset link invalid or expired
 * @localZh 重置链接无效或已过期，请重新申请
 * @localEn Reset link is invalid or expired. Please request a new one
 */
export const API_PASSWORD_RESET_LINK_INVALID =
  'api:password_reset_link_invalid';

/**
 * @description Auth email send rate limited
 * @localZh 邮件发送过于频繁，请稍后再试
 * @localEn Too many emails sent, please try again later
 */
export const API_EMAIL_SEND_RATE_LIMITED = 'api:email_send_rate_limited';

/**
 * @description 请求体为空
 * @localZh 请求参数为空空
 * @localEn Request Params is required
 */
export const API_REQUEST_BODY_EMPTY = 'api:request_body_empty';

/**
 * @description OTP code invalid or expired
 * @localZh 验证码错误或已过期
 * @localEn Invalid or expired verification code
 */
export const API_OTP_CODE_INVALID = 'api:otp_code_invalid';

/**
 * @description 没有pam 项目
 * @localZh 项目未找到
 * @localEn Project Not Found
 */
export const API_PAM_PROJECT_NOT_FOUND = 'api:pam_project_not_found';

/**
 * @description 没有pam 环境
 * @localZh 环境无效
 * @localEn PAM Environment Invalid
 */
export const API_PAM_ENV_NOT_FOUND = 'api:pam_env_not_found';

/**
 * @description 项目 slug 不能重复
 * @localZh 项目 slug 已存在
 * @localEn PAM slug already exists
 */
export const API_PAM_SLUG_EXISTS = 'api:pam_slug_exists';

/**
 * @description 环境名不能重复
 * @localZh 环境名已存在
 * @localEn Env name already exists
 */
export const API_PAM_ENV_NAME_EXISTS = 'api:pam_env_name_exists';

/**
 * @description Change password requires a real email (password login is email based)
 * @localZh 当前账号没有邮箱，无法修改密码
 * @localEn This account has no email, so the password cannot be changed
 */
export const API_CHANGE_PASSWORD_EMAIL_REQUIRED =
  'api:change_password_email_required';

/**
 * @description Current password is wrong (or the account never set a password)
 * @localZh 当前密码不正确
 * @localEn Current password is incorrect
 */
export const API_CHANGE_PASSWORD_CURRENT_INCORRECT =
  'api:change_password_current_incorrect';

/**
 * @description New password does not meet the rules
 * @localZh 新密码需为 6–50 位且不能包含空格
 * @localEn New password must be 6–50 characters with no spaces
 */
export const API_CHANGE_PASSWORD_INVALID = 'api:change_password_invalid';

/**
 * @description New password equals the current one
 * @localZh 新密码不能与当前密码相同
 * @localEn New password must differ from the current password
 */
export const API_CHANGE_PASSWORD_SAME = 'api:change_password_same';

/**
 * @description Password change is unavailable for the configured upstream provider
 * @localZh 当前登录方式不支持在此修改密码
 * @localEn Changing the password is not supported for this sign-in provider
 */
export const API_CHANGE_PASSWORD_UNSUPPORTED =
  'api:change_password_unsupported';

/**
 * @description Mail provider is disabled or missing required settings
 * @localZh 邮件通道未启用或配置不完整
 * @localEn Mail provider is disabled or not fully configured
 */
export const API_MAIL_PROVIDER_NOT_READY = 'api:mail_provider_not_ready';

/**
 * @description Mail provider rejected or failed to send the message
 * @localZh 邮件发送失败，请稍后重试
 * @localEn Failed to send email. Please try again later
 */
export const API_MAIL_SEND_FAILED = 'api:mail_send_failed';

/**
 * @description Recipient email is invalid
 * @localZh 收件邮箱格式不正确
 * @localEn Recipient email is invalid
 */
export const API_MAIL_RECIPIENT_INVALID = 'api:mail_recipient_invalid';

/**
 * @description Forgot password by email is turned off or unsupported
 * @localZh 找回密码功能暂未开启
 * @localEn Password reset is not available
 */
export const API_PASSWORD_RESET_DISABLED = 'api:password_reset_disabled';

/**
 * @description Reset link is invalid, expired or already used
 * @localZh 重置链接无效或已过期，请重新申请
 * @localEn The reset link is invalid or has expired. Please request a new one
 */
export const API_PASSWORD_RESET_TOKEN_INVALID =
  'api:password_reset_token_invalid';

/**
 * @description Too many reset requests
 * @localZh 请求过于频繁，请稍后再试
 * @localEn Too many requests. Please try again later
 */
export const API_PASSWORD_RESET_RATE_LIMITED =
  'api:password_reset_rate_limited';

/**
 * @description Display name format is invalid
 * @localZh 显示名需为 1–32 位字母、数字或下划线
 * @localEn Display name must be 1–32 letters, numbers, or underscores
 */
export const API_DISPLAY_NAME_INVALID = 'api:display_name_invalid';
