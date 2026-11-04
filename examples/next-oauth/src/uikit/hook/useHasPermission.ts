'use client';

import { useStore } from '@brain-toolkit/react-kit';
import {
  PermissionKey,
  type AppPermissionKey
} from '@shared/auth/permissionKeys';
import { I } from '@config/ioc-identifiter';
import type { SessionCapabilitiesStateInterface } from '@interfaces/SessionCapabilitiesInterface';
import { useIOC } from './useIOC';
import { useUserAuth } from './useUserAuth';

const permissionsSelector = (
  state: SessionCapabilitiesStateInterface
): string[] => state.permissions;

/**
 * 当前会话权限键列表（来自独立 capabilities AsyncStore）。
 */
export function useSessionPermissionKeys(): {
  permissions: string[];
  success: boolean;
  loading: boolean;
} {
  const userService = useIOC(I.UserServiceInterface);
  const { success, loading } = useUserAuth();
  const permissions = useStore(
    userService.getCapabilitiesStore(),
    permissionsSelector
  );
  return { permissions, success, loading };
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
