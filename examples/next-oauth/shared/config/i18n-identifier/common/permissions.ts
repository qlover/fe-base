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
 * @description Access admin console
 * @localZh 进入管理后台
 * @localEn Access admin console
 */
export const PERMISSION_ADMIN_SITE_SETTINGS_READ =
  'permission:admin_site_settings_read';
