/**
 * Default role → permission_key maps (seed / fallback).
 */

import { PermissionKey } from './permissionKeys';

/** /admin chrome gate: operator+ (has site-settings read). */
export const SYSTEM_ADMIN_GATE_KEY = PermissionKey.admin_site_settings_read;

const ADMIN_READ = [
  PermissionKey.admin_users_read,
  PermissionKey.admin_roles_read,
  PermissionKey.admin_locales_read,
  PermissionKey.admin_request_logs_read,
  PermissionKey.admin_site_settings_read
] as const;

const ADMIN_WRITE = [
  PermissionKey.admin_users_system_role,
  PermissionKey.admin_roles_write,
  PermissionKey.admin_locales_write,
  PermissionKey.admin_request_logs_write
] as const;

export const DEFAULT_SYSTEM_ROLE_PERMISSIONS: Record<
  string,
  readonly string[]
> = {
  user: [],
  operator: [...ADMIN_READ],
  admin: [...ADMIN_READ, ...ADMIN_WRITE]
};

export const PERMISSION_CATALOG_SEED: ReadonlyArray<{
  permissionKey: string;
  type: 'api' | 'page' | 'feature';
  method: string | null;
  path: string | null;
  description: string | null;
}> = [
  {
    permissionKey: PermissionKey.admin_users_read,
    type: 'page',
    method: null,
    path: '/admin/users',
    description: 'View admin users'
  },
  {
    permissionKey: PermissionKey.admin_users_system_role,
    type: 'api',
    method: 'PATCH',
    path: '/api/admin/users',
    description: 'Change user system role'
  },
  {
    permissionKey: PermissionKey.admin_roles_read,
    type: 'page',
    method: null,
    path: '/admin/roles',
    description: 'View role assignments'
  },
  {
    permissionKey: PermissionKey.admin_roles_write,
    type: 'api',
    method: 'PATCH',
    path: '/api/admin/roles',
    description: 'Edit role assignments'
  },
  {
    permissionKey: PermissionKey.admin_locales_read,
    type: 'api',
    method: 'GET',
    path: '/api/admin/locales',
    description: 'List locale dictionary rows'
  },
  {
    permissionKey: PermissionKey.admin_locales_write,
    type: 'api',
    method: 'POST',
    path: '/api/admin/locales',
    description: 'Create / update / import locales'
  },
  {
    permissionKey: PermissionKey.admin_request_logs_read,
    type: 'page',
    method: null,
    path: '/admin/request-logs',
    description: 'View request logs'
  },
  {
    permissionKey: PermissionKey.admin_request_logs_write,
    type: 'api',
    method: 'DELETE',
    path: '/api/user/request-logs',
    description: 'Clear request logs'
  },
  {
    permissionKey: PermissionKey.admin_site_settings_read,
    type: 'page',
    method: null,
    path: '/admin',
    description: 'Access admin console'
  }
];
