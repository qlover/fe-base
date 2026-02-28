'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { NavigateBridge } from '@/impls/NavigateBridge';
import { useIOC } from '../hook/useIOC';

export function AppBridge() {
  const router = useRouter();
  const navigateBridge = useIOC(NavigateBridge);

  useEffect(() => {
    navigateBridge.setUIBridge(router);
  }, [router, navigateBridge]);

  return null;
}
