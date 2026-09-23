/**
 * @description Admin OTP monitor page title
 * @localZh 验证码监控
 * @localEn OTP monitor
 */
export const ADMIN_OTP_MONITOR_TITLE = 'admin_otp_monitor:title';

/**
 * @description Admin OTP monitor page description
 * @localZh 查看手机验证码发送记录（memory 通道可直接看到验证码）
 * @localEn Inspect phone OTP send records (plaintext code in memory mode)
 */
export const ADMIN_OTP_MONITOR_DESCRIPTION = 'admin_otp_monitor:description';

/**
 * @description Admin OTP monitor keywords
 * @localZh 验证码,手机号,OTP,监控
 * @localEn otp,phone,monitor
 */
export const ADMIN_OTP_MONITOR_KEYWORDS = 'admin_otp_monitor:keywords';

/**
 * @description Hint about memory vs SMS
 * @localZh memory 通道下明文可见；短信通道通常不存明文。发码 IP 限流见 Memory KV。
 * @localEn Plaintext visible in memory mode; SMS providers usually omit it. IP rate limits live in Memory KV.
 */
export const ADMIN_OTP_MONITOR_HINT = 'admin_otp_monitor:hint';

/**
 * @description Search phone placeholder
 * @localZh 按手机号筛选
 * @localEn Filter by phone
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
 * @description Entry count
 * @localZh 共 __COUNT__ 条
 * @localEn __COUNT__ entries
 */
export const ADMIN_OTP_MONITOR_COUNT = 'admin_otp_monitor:count';

/**
 * @description Column created
 * @localZh 创建时间
 * @localEn Created
 */
export const ADMIN_OTP_MONITOR_COL_CREATED = 'admin_otp_monitor:col_created';

/**
 * @description Column phone
 * @localZh 手机号
 * @localEn Phone
 */
export const ADMIN_OTP_MONITOR_COL_PHONE = 'admin_otp_monitor:col_phone';

/**
 * @description Column code
 * @localZh 验证码
 * @localEn Code
 */
export const ADMIN_OTP_MONITOR_COL_CODE = 'admin_otp_monitor:col_code';

/**
 * @description Column provider
 * @localZh 通道
 * @localEn Provider
 */
export const ADMIN_OTP_MONITOR_COL_PROVIDER = 'admin_otp_monitor:col_provider';

/**
 * @description Column status
 * @localZh 状态
 * @localEn Status
 */
export const ADMIN_OTP_MONITOR_COL_STATUS = 'admin_otp_monitor:col_status';

/**
 * @description Column attempts
 * @localZh 尝试次数
 * @localEn Attempts
 */
export const ADMIN_OTP_MONITOR_COL_ATTEMPTS = 'admin_otp_monitor:col_attempts';

/**
 * @description Column expires
 * @localZh 过期时间
 * @localEn Expires
 */
export const ADMIN_OTP_MONITOR_COL_EXPIRES = 'admin_otp_monitor:col_expires';

/**
 * @description Column IP
 * @localZh IP
 * @localEn IP
 */
export const ADMIN_OTP_MONITOR_COL_IP = 'admin_otp_monitor:col_ip';

/**
 * @description Code hidden label
 * @localZh （已隐藏）
 * @localEn (hidden)
 */
export const ADMIN_OTP_MONITOR_CODE_HIDDEN = 'admin_otp_monitor:code_hidden';

/**
 * @description Empty state
 * @localZh 暂无验证码记录
 * @localEn No OTP records yet
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
 * @description Loading label
 * @localZh 加载中…
 * @localEn Loading…
 */
export const ADMIN_OTP_MONITOR_LOADING = 'admin_otp_monitor:loading';

/**
 * @description Empty time label
 * @localZh —
 * @localEn —
 */
export const ADMIN_OTP_MONITOR_TTL_NONE = 'admin_otp_monitor:ttl_none';
