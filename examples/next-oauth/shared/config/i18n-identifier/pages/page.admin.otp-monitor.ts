/**
 * @description Admin OTP monitor page title
 * @localZh 验证码监控
 * @localEn OTP monitor
 */
export const ADMIN_OTP_MONITOR_TITLE = 'admin_otp_monitor:title';

/**
 * @description Admin OTP monitor page description
 * @localZh 监控发码 IP 限流状态（非短信验证码明文）
 * @localEn Monitor OTP send IP rate limits (not plaintext codes)
 */
export const ADMIN_OTP_MONITOR_DESCRIPTION = 'admin_otp_monitor:description';

/**
 * @description Admin OTP monitor keywords
 * @localZh 验证码,限流,OTP,监控
 * @localEn otp,rate-limit,monitor
 */
export const ADMIN_OTP_MONITOR_KEYWORDS = 'admin_otp_monitor:keywords';

/**
 * @description Process-local hint
 * @localZh 数据来自进程内 Memory KV，前缀 next-oauth:otp:send:ip:
 * @localEn Data comes from process Memory KV under next-oauth:otp:send:ip:
 */
export const ADMIN_OTP_MONITOR_HINT = 'admin_otp_monitor:hint';

/**
 * @description Search IP placeholder
 * @localZh 按 IP 筛选
 * @localEn Filter by IP
 */
export const ADMIN_OTP_MONITOR_SEARCH_PLACEHOLDER =
  'admin_otp_monitor:search_placeholder';

/**
 * @description Refresh button
 * @localZh 刷新
 * @localEn Refresh
 */
export const ADMIN_OTP_MONITOR_REFRESH = 'admin_otp_monitor:refresh';

/**
 * @description Auto refresh hint
 * @localZh 每 5 秒自动刷新
 * @localEn Auto-refresh every 5s
 */
export const ADMIN_OTP_MONITOR_AUTO_REFRESH = 'admin_otp_monitor:auto_refresh';

/**
 * @description Clear all rate-limit entries
 * @localZh 清除全部限流
 * @localEn Clear all limits
 */
export const ADMIN_OTP_MONITOR_CLEAR_ALL = 'admin_otp_monitor:clear_all';

/**
 * @description Entry count
 * @localZh 共 __COUNT__ 条
 * @localEn __COUNT__ entries
 */
export const ADMIN_OTP_MONITOR_COUNT = 'admin_otp_monitor:count';

/**
 * @description Column IP
 * @localZh IP
 * @localEn IP
 */
export const ADMIN_OTP_MONITOR_COL_IP = 'admin_otp_monitor:col_ip';

/**
 * @description Column blocked until
 * @localZh 限流至
 * @localEn Blocked until
 */
export const ADMIN_OTP_MONITOR_COL_BLOCKED_UNTIL =
  'admin_otp_monitor:col_blocked_until';

/**
 * @description Column TTL
 * @localZh 剩余 TTL
 * @localEn TTL left
 */
export const ADMIN_OTP_MONITOR_COL_TTL = 'admin_otp_monitor:col_ttl';

/**
 * @description Column key
 * @localZh Key
 * @localEn Key
 */
export const ADMIN_OTP_MONITOR_COL_KEY = 'admin_otp_monitor:col_key';

/**
 * @description Column actions
 * @localZh 操作
 * @localEn Actions
 */
export const ADMIN_OTP_MONITOR_COL_ACTIONS = 'admin_otp_monitor:col_actions';

/**
 * @description Delete one key
 * @localZh 清除
 * @localEn Clear
 */
export const ADMIN_OTP_MONITOR_DELETE = 'admin_otp_monitor:delete';

/**
 * @description Empty state
 * @localZh 当前没有发码限流条目
 * @localEn No OTP send rate-limit entries
 */
export const ADMIN_OTP_MONITOR_EMPTY = 'admin_otp_monitor:empty';

/**
 * @description Not allowed
 * @localZh 无权限查看验证码监控
 * @localEn You cannot view OTP monitor
 */
export const ADMIN_OTP_MONITOR_FORBIDDEN = 'admin_otp_monitor:forbidden';

/**
 * @description Load failed
 * @localZh 加载失败
 * @localEn Failed to load
 */
export const ADMIN_OTP_MONITOR_LOAD_FAILED = 'admin_otp_monitor:load_failed';

/**
 * @description Delete failed
 * @localZh 清除失败
 * @localEn Failed to clear
 */
export const ADMIN_OTP_MONITOR_DELETE_FAILED =
  'admin_otp_monitor:delete_failed';

/**
 * @description Confirm delete one key
 * @localZh 确定清除 IP「__IP__」的限流？
 * @localEn Clear rate limit for IP “__IP__”?
 */
export const ADMIN_OTP_MONITOR_CONFIRM_DELETE =
  'admin_otp_monitor:confirm_delete';

/**
 * @description Confirm clear all
 * @localZh 确定清除全部发码限流？
 * @localEn Clear all OTP send rate limits?
 */
export const ADMIN_OTP_MONITOR_CONFIRM_CLEAR =
  'admin_otp_monitor:confirm_clear';

/**
 * @description Loading label
 * @localZh 加载中…
 * @localEn Loading…
 */
export const ADMIN_OTP_MONITOR_LOADING = 'admin_otp_monitor:loading';

/**
 * @description Never / no block label
 * @localZh —
 * @localEn —
 */
export const ADMIN_OTP_MONITOR_TTL_NONE = 'admin_otp_monitor:ttl_none';
