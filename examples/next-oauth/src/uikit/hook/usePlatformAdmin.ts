'use client';

import { useStore } from '@brain-toolkit/react-kit';
import { I } from '@config/ioc-identifiter';
import type { SessionCapabilitiesStateInterface } from '@interfaces/SessionCapabilitiesInterface';
import { useIOC } from './useIOC';
import { useUserAuth } from './useUserAuth';

const platformAdminSelector = (
  state: SessionCapabilitiesStateInterface
): boolean => state.platformAdmin;

/**
 * 平台管理员标志（仅 UI）；页面/API 闸门仍由 middleware + 权限插件负责。
 */
export function usePlatformAdmin(): {
  platformAdmin: boolean;
  loading: boolean;
} {
  const userService = useIOC(I.UserServiceInterface);
  const { success, loading } = useUserAuth();
  const platformAdmin = useStore(
    userService.getCapabilitiesStore(),
    platformAdminSelector
  );

  return {
    platformAdmin: success && platformAdmin,
    loading
  };
}
