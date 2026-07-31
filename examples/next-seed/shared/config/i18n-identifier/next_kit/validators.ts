/**
 * Locale copy for `@qlover/next-kit` validator / API message ids.
 * Consumed by ts2locales (`@localZh` / `@localEn`).
 */

/**
 * @description Login form params are missing or invalid
 * @localZh 不是一个有效的登录参数
 * @localEn Not a valid login parameter
 */
export const V_LOGIN_PARAMS_REQUIRED = 'next_kit:v_login_params_required';

/**
 * @description Username is required
 * @localZh 用户名为必填
 * @localEn Username is required
 */
export const V_USERNAME_REQUIRED = 'next_kit:v_username_required';

/**
 * @description Invalid email format
 * @localZh 邮箱格式无效
 * @localEn Invalid email format
 */
export const V_EMAIL_INVALID = 'next_kit:v_email_invalid';

/**
 * @description Password minimum length
 * @localZh 密码长度不能少于 6 位
 * @localEn Password must be at least 6 characters
 */
export const V_PASSWORD_MIN_LENGTH = 'next_kit:v_password_min_length';

/**
 * @description Password maximum length
 * @localZh 密码长度不能超过 50 位
 * @localEn Password must be at most 50 characters
 */
export const V_PASSWORD_MAX_LENGTH = 'next_kit:v_password_max_length';

/**
 * @description Password must not contain whitespace
 * @localZh 密码不能包含空格
 * @localEn Password cannot contain whitespace
 */
export const V_PASSWORD_SPECIAL_CHARS = 'next_kit:v_password_special_chars';

/**
 * @description Generic Zod validation failure
 * @localZh 数据验证错误
 * @localEn Data validation error
 */
export const V_ZOD_FAILED = 'next_kit:v_zod_failed';

/**
 * @description Search / list query must be URLSearchParams
 * @localZh 查询参数格式无效
 * @localEn Invalid search parameters
 */
export const V_SEARCH_PARAMS_INVALID = 'next_kit:v_search_params_invalid';

/**
 * @description Invalid id
 * @localZh 无效 id
 * @localEn Invalid id
 */
export const V_INVALID_ID = 'next_kit:v_invalid_id';

/**
 * @description Invalid i18n key format
 * @localZh 无效的 i18n key
 * @localEn Invalid i18n key
 */
export const COMMON_I18N_KEY_INVALID = 'next_kit:i18n_key_invalid';

/**
 * @description Unhandled server / API error
 * @localZh 服务器错误
 * @localEn Server error
 */
export const API_SERVER_ERROR = 'next_kit:api_server_error';
