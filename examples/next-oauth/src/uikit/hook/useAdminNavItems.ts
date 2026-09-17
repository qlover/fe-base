'use client';

import { useMemo } from 'react';
import { defaultNavItems, type NavItemInterface } from '@config/adminNavs';
import { useSessionPermissionKeys } from './useHasPermission';

/** Sidebar items filtered by session permission_key. */
export function useAdminNavItems(
  items: NavItemInterface[] = defaultNavItems
): NavItemInterface[] {
  const { permissions, success } = useSessionPermissionKeys();

  return useMemo(() => {
    // Wait for session — do not flash the full nav before permissions load.
    if (!success) return [];
    return items.filter(
      (item) => !item.permissionKey || permissions.includes(item.permissionKey)
    );
  }, [items, permissions, success]);
}
