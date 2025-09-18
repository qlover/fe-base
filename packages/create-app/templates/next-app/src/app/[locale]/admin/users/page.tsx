'use client';

import { Spin } from 'antd';
import { useEffect, useRef } from 'react';
import { AdminUserService } from '@/base/services/AdminUserService';
import { useIOC } from '@/uikit/hook/useIOC';
import { useStore } from '@/uikit/hook/useStore';

export default function UsersPage() {
  const adminUserService = useIOC(AdminUserService);

  const initState = useStore(adminUserService, (state) => state.initState);
  const mouted = useRef(false);

  useEffect(() => {
    if (!mouted.current) {
      mouted.current = true;
      adminUserService.initialize();
    }
  }, []);

  console.log(initState);

  return (
    <div data-testid="UsersPage">
      <h1>admin Users page</h1>
      <Spin spinning={initState.loading} />
    </div>
  );
}
