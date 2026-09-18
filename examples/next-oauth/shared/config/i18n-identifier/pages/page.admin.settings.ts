/**
 * @description Admin site settings page title
 * @localZh 站点设置
 * @localEn Site settings
 */
export const ADMIN_SETTINGS_TITLE = 'admin_settings:title';

/**
 * @description Admin site settings page description
 * @localZh 管理登录开关、CORS 与 OpenAI 演示配置（优先于 .env，保存后立即生效）。
 * @localEn Manage login toggles, CORS, and OpenAI demo config (overrides .env; effective immediately).
 */
export const ADMIN_SETTINGS_DESCRIPTION = 'admin_settings:description';

/**
 * @description Admin site settings page keywords
 * @localZh 站点设置,配置,Admin,CORS
 * @localEn site settings,config,admin,cors
 */
export const ADMIN_SETTINGS_KEYWORDS = 'admin_settings:keywords';

/**
 * @description Auth feature toggles section title
 * @localZh 登录与认证
 * @localEn Auth & login
 */
export const ADMIN_SETTINGS_SECTION_AUTH = 'admin_settings:section__auth';

/**
 * @description Auth feature toggles section description
 * @localZh 控制登录页展示的认证方式（仍受 OAuth upstream 门控）。
 * @localEn Control login methods shown on the sign-in page (still gated by OAuth upstream).
 */
export const ADMIN_SETTINGS_SECTION_AUTH_DESC =
  'admin_settings:section__auth_desc';

/**
 * @description OpenAI-compatible API section title
 * @localZh OpenAI 兼容 API
 * @localEn OpenAI-compatible API
 */
export const ADMIN_SETTINGS_SECTION_OPENAI = 'admin_settings:section__openai';

/**
 * @description OpenAI-compatible API section description
 * @localZh OpenAI 兼容对话/补全网关配置（支持官方、Cerebras 或自建代理）。
 * @localEn OpenAI-compatible chat/completions gateway (official, Cerebras, or self-hosted).
 */
export const ADMIN_SETTINGS_SECTION_OPENAI_DESC =
  'admin_settings:section__openai_desc';

/**
 * @description API / CORS section title
 * @localZh API 与 CORS
 * @localEn API & CORS
 */
export const ADMIN_SETTINGS_SECTION_API = 'admin_settings:section__api';

/**
 * @description API / CORS section description
 * @localZh 按「来源 Origin × API 路径 × HTTP 方法」配置跨域。三项均可写 *；也支持 /oauth/* 前缀。
 * @localEn CORS by Origin × API path × HTTP method. Each field accepts *; path prefixes like /oauth/* work too.
 */
export const ADMIN_SETTINGS_SECTION_API_DESC =
  'admin_settings:section__api_desc';

/**
 * @description Loading state label
 * @localZh 加载中…
 * @localEn Loading…
 */
export const ADMIN_SETTINGS_LOADING = 'admin_settings:loading';

/**
 * @description Save button label
 * @localZh 保存
 * @localEn Save
 */
export const ADMIN_SETTINGS_SAVE = 'admin_settings:save';

/**
 * @description Saving button label
 * @localZh 保存中…
 * @localEn Saving…
 */
export const ADMIN_SETTINGS_SAVING = 'admin_settings:saving';

/**
 * @description Secret configured hint
 * @localZh 已配置（留空则不修改）
 * @localEn Configured (leave blank to keep)
 */
export const ADMIN_SETTINGS_SECRET_HINT = 'admin_settings:secret__hint';

/**
 * @description Load failed message
 * @localZh 加载设置失败
 * @localEn Failed to load settings
 */
export const ADMIN_SETTINGS_LOAD_FAILED = 'admin_settings:load__failed';

/**
 * @description Save failed message
 * @localZh 保存失败
 * @localEn Failed to save
 */
export const ADMIN_SETTINGS_SAVE_FAILED = 'admin_settings:save__failed';

/**
 * @description Save succeeded message
 * @localZh 已保存
 * @localEn Saved
 */
export const ADMIN_SETTINGS_SAVE_SUCCESS = 'admin_settings:save__success';

/**
 * @description Source badge: database
 * @localZh 数据库
 * @localEn Database
 */
export const ADMIN_SETTINGS_SOURCE_DB = 'admin_settings:source__db';

/**
 * @description Source badge: default
 * @localZh 默认
 * @localEn Default
 */
export const ADMIN_SETTINGS_SOURCE_DEFAULT = 'admin_settings:source__default';

/**
 * @description CORS rule origin field label
 * @localZh 来源 Origin
 * @localEn Origin
 */
export const ADMIN_SETTINGS_CORS_ORIGIN = 'admin_settings:cors__origin';

/**
 * @description CORS rule API path field label
 * @localZh API 路径
 * @localEn API path
 */
export const ADMIN_SETTINGS_CORS_PATH = 'admin_settings:cors__path';

/**
 * @description CORS rule HTTP methods field label
 * @localZh HTTP 方法
 * @localEn HTTP methods
 */
export const ADMIN_SETTINGS_CORS_METHODS = 'admin_settings:cors__methods';

/**
 * @description Add CORS rule button
 * @localZh 添加规则
 * @localEn Add rule
 */
export const ADMIN_SETTINGS_CORS_ADD = 'admin_settings:cors__add';

/**
 * @description Remove CORS rule button
 * @localZh 删除
 * @localEn Remove
 */
export const ADMIN_SETTINGS_CORS_REMOVE = 'admin_settings:cors__remove';

/**
 * @description Empty CORS rules hint
 * @localZh 暂无规则，点击下方添加一条（origin × path × methods）。
 * @localEn No rules yet. Add one below (origin × path × methods).
 */
export const ADMIN_SETTINGS_CORS_EMPTY = 'admin_settings:cors__empty';

/**
 * @description Invalid CORS origin validation message
 * @localZh Origin 须为 * 或有效的 http(s) 地址（不含路径），如 https://spa.example.com
 * @localEn Origin must be * or a valid http(s) origin without path, e.g. https://spa.example.com
 */
export const ADMIN_SETTINGS_CORS_ORIGIN_INVALID =
  'admin_settings:cors__origin_invalid';

/**
 * @description Duplicate CORS rule validation message
 * @localZh 存在重复规则（Origin + Path + Methods 完全相同）
 * @localEn Duplicate rule (same Origin + Path + Methods)
 */
export const ADMIN_SETTINGS_CORS_DUPLICATE = 'admin_settings:cors__duplicate';
