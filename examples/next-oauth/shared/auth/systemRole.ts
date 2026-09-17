/**
 * Platform system roles (template).
 * Bound via UserSchema.role → platform key (user|operator|admin).
 */

import { UserRole, type UserRoleType } from '@qlover/next-kit/common';
import { SYSTEM_ADMIN_GATE_KEY } from './permissionDefaults';
import { resolveSystemPermissions } from './permissionRegistry';
import {
  PlatformRoleKey,
  isPlatformRoleKey,
  type PlatformRoleKeyType
} from './roleKeys';

export const SystemRole = PlatformRoleKey;

export type SystemRoleType = PlatformRoleKeyType;

export const SYSTEM_ROLES = [
  SystemRole.User,
  SystemRole.Operator,
  SystemRole.Admin
] as const;

export function isSystemRole(value: unknown): value is SystemRoleType {
  return isPlatformRoleKey(value);
}

/** Map next-kit UserRole numeric enum → platform role key. */
export function platformRoleFromUserRole(role: UserRoleType): SystemRoleType {
  return role === UserRole.ADMIN ? SystemRole.Admin : SystemRole.User;
}

/** Expand system role to permission_key list. */
export function expandSystemPermissions(
  role: SystemRoleType
): readonly string[] {
  return resolveSystemPermissions(role);
}

export function hasSystemPermission(
  role: SystemRoleType,
  permissionKey: string
): boolean {
  return expandSystemPermissions(role).includes(permissionKey);
}

/**
 * Resolve a platform permission from a rich session payload when present.
 * `null` means the session is too thin — caller should resolve from
 * `fe_users.role_id` (do not treat numeric UserSchema.role as authoritative).
 */
export function sessionHasSystemPermission(
  user: unknown,
  permissionKey: string
): boolean | null {
  if (!user || typeof user !== 'object') {
    return null;
  }
  const rec = user as Record<string, unknown>;
  const permissions = rec.permissions;
  if (Array.isArray(permissions) && permissions.length > 0) {
    return permissions.includes(permissionKey);
  }
  if (typeof rec.system_role === 'string' && rec.system_role.length > 0) {
    return hasSystemPermission(
      normalizeSystemRole(rec.system_role),
      permissionKey
    );
  }
  return null;
}

/** /admin gate: operator or admin (has admin_site_settings_read). */
export function isPlatformAdminRole(role: SystemRoleType): boolean {
  return hasSystemPermission(role, SYSTEM_ADMIN_GATE_KEY);
}

export function normalizeSystemRole(value: unknown): SystemRoleType {
  return isSystemRole(value) ? value : SystemRole.User;
}
