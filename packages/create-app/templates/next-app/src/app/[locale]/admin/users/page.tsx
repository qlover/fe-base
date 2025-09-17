'use client';

import { useEffect } from 'react';
import { AdminUserService } from '@/base/services/AdminUserService';
import { useIOC } from '@/uikit/hook/useIOC';

export default function UsersPage() {
  const adminUserService = useIOC(AdminUserService);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      adminUserService.initialize();
    }
  }, []);

  return <div data-testid="UsersPage"></div>;
}
