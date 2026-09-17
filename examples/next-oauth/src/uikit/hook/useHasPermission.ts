'use client';

import {
  PermissionKey,
  type AppPermissionKey
} from '@shared/auth/permissionKeys';
import {
  expandSystemPermissions,
  normalizeSystemRole,
  platformRoleFromUserRole
} from '@shared/auth/systemRole';
import type { SessionUserPermissions } from '@schemas/RoleSchema';
import { useUserAuth } from './useUserAuth';
import type { UserSchema } from '@qlover/next-kit/common';

type SessionUser = UserSchema & Partial<SessionUserPermissions>;

function permissionsFromUser(user: SessionUser | undefined): string[] {
  if (!user) {
    return [];
  }
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }
  if (typeof user.system_role === 'string' && user.system_role.length > 0) {
    return [...expandSystemPermissions(normalizeSystemRole(user.system_role))];
  }
  return [...expandSystemPermissions(platformRoleFromUserRole(user.role))];
}

export function useSessionPermissionKeys(): {
  permissions: string[];
  success: boolean;
  loading: boolean;
} {
  const { user, success, loading } = useUserAuth();
  return {
    permissions: permissionsFromUser(user as SessionUser | undefined),
    success,
    loading
  };
}

/**
 * UI gate by permission_key.
 *
 * @example
 * const { allowed } = useCan(PermissionKey.admin_roles_write);
 */
export function useCan(
  permissionKey: AppPermissionKey | readonly AppPermissionKey[]
): {
  allowed: boolean;
  loading: boolean;
} {
  const { permissions, success, loading } = useSessionPermissionKeys();
  const keys =
    typeof permissionKey === 'string' ? [permissionKey] : [...permissionKey];
  const allowed = success && keys.some((key) => permissions.includes(key));
  return { allowed, loading };
}

export { PermissionKey };
