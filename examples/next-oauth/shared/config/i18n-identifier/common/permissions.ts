/**
 * Permission catalog labels. Key = `permission:{permission_key}`.
 */

/**
 * @description List platform users
 * @localZh 列出平台用户
 * @localEn List platform users
 */
export const PERMISSION_ADMIN_USERS_READ = 'permission:admin_users_read';

/**
 * @description Set system role user|operator|admin
 * @localZh 设置系统角色
 * @localEn Set system role
 */
export const PERMISSION_ADMIN_USERS_SYSTEM_ROLE =
  'permission:admin_users_system_role';

/**
 * @description List role permission catalog and assignments
 * @localZh 查看角色权限
 * @localEn List role assignments
 */
export const PERMISSION_ADMIN_ROLES_READ = 'permission:admin_roles_read';

/**
 * @description Replace role → permission assignments
 * @localZh 编辑角色权限
 * @localEn Edit role assignments
 */
export const PERMISSION_ADMIN_ROLES_WRITE = 'permission:admin_roles_write';

/**
 * @description List permission catalog
 * @localZh 查看权限目录
 * @localEn List permission catalog
 */
export const PERMISSION_ADMIN_PERMISSIONS_READ =
  'permission:admin_permissions_read';

/**
 * @description Create or update permission catalog
 * @localZh 创建或修改权限目录
 * @localEn Create or update permission catalog
 */
export const PERMISSION_ADMIN_PERMISSIONS_WRITE =
  'permission:admin_permissions_write';

/**
 * @description List locale dictionary rows
 * @localZh 查看国际化文案
 * @localEn List locale dictionary rows
 */
export const PERMISSION_ADMIN_LOCALES_READ = 'permission:admin_locales_read';

/**
 * @description Create / update / import locales
 * @localZh 编辑国际化文案
 * @localEn Create / update / import locales
 */
export const PERMISSION_ADMIN_LOCALES_WRITE = 'permission:admin_locales_write';

/**
 * @description Read request audit logs
 * @localZh 查看请求日志
 * @localEn Read request logs
 */
export const PERMISSION_ADMIN_REQUEST_LOGS_READ =
  'permission:admin_request_logs_read';

/**
 * @description Clear request logs
 * @localZh 清空请求日志
 * @localEn Clear request logs
 */
export const PERMISSION_ADMIN_REQUEST_LOGS_WRITE =
  'permission:admin_request_logs_write';

/**
 * @description View OTP send rate-limit monitor
 * @localZh 查看验证码限流状态
 * @localEn View OTP send rate-limit state
 */
export const PERMISSION_ADMIN_OTP_MONITOR_READ =
  'permission:admin_otp_monitor_read';

/**
 * @description Clear OTP send rate-limit entries
 * @localZh 清除验证码限流条目
 * @localEn Clear OTP send rate-limit entries
 */
export const PERMISSION_ADMIN_OTP_MONITOR_WRITE =
  'permission:admin_otp_monitor_write';

/**
 * @description List process Memory KV cache entries
 * @localZh 查看进程内 Memory KV 缓存
 * @localEn List process Memory KV cache entries
 */
export const PERMISSION_ADMIN_MEMORY_KV_READ =
  'permission:admin_memory_kv_read';

/**
 * @description Delete process Memory KV cache entries
 * @localZh 删除进程内 Memory KV 缓存
 * @localEn Delete process Memory KV cache entries
 */
export const PERMISSION_ADMIN_MEMORY_KV_WRITE =
  'permission:admin_memory_kv_write';

/**
 * @description Access admin console
 * @localZh 进入管理后台
 * @localEn Access admin console
 */
export const PERMISSION_ADMIN_SITE_SETTINGS_READ =
  'permission:admin_site_settings_read';

/**
 * @description Update site settings
 * @localZh 编辑站点设置
 * @localEn Update site settings
 */
export const PERMISSION_ADMIN_SITE_SETTINGS_WRITE =
  'permission:admin_site_settings_write';
