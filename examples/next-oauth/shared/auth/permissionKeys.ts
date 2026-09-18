/**
 * Immutable permission_key — sole permission identity (session / UI / i18n / API).
 *
 * Rules: /^[A-Za-z_][A-Za-z0-9_]*$/
 * i18n: permission:{permission_key}
 * UI test: data-permission="{permission_key}"
 *
 * Template subset aligned with PAM naming for easy copy to production.
 */

export const PERMISSION_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const PermissionKey = {
  admin_users_read: 'admin_users_read',
  admin_users_system_role: 'admin_users_system_role',
  admin_roles_read: 'admin_roles_read',
  admin_roles_write: 'admin_roles_write',
  admin_locales_read: 'admin_locales_read',
  admin_locales_write: 'admin_locales_write',
  admin_request_logs_read: 'admin_request_logs_read',
  admin_request_logs_write: 'admin_request_logs_write',
  admin_site_settings_read: 'admin_site_settings_read',
  admin_site_settings_write: 'admin_site_settings_write'
} as const;

export type AppPermissionKey =
  (typeof PermissionKey)[keyof typeof PermissionKey];

export const ALL_PERMISSION_KEYS = Object.values(
  PermissionKey
) as AppPermissionKey[];

export function isPermissionKey(value: unknown): value is AppPermissionKey {
  return (
    typeof value === 'string' &&
    PERMISSION_KEY_PATTERN.test(value) &&
    (ALL_PERMISSION_KEYS as string[]).includes(value)
  );
}

export function permissionI18nKey(permissionKey: string): string {
  return `permission:${permissionKey}`;
}

/** Platform catalog keys (shown for platform roles). */
export function isPlatformPermissionKey(permissionKey: string): boolean {
  return permissionKey.startsWith('admin_');
}
