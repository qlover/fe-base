import { useEffect, useRef } from 'react';
import type {
  AdminPageInterface,
  AdminPageState
} from '@/base/port/AdminPageInterface';

export function useAdminTableInit(
  adminPageInterface: AdminPageInterface<AdminPageState>
) {
  const mouted = useRef(false);

  useEffect(() => {
    if (!mouted.current) {
      mouted.current = true;

      requestAnimationFrame(() => {
        adminPageInterface.initialize();
      });
    }
  }, [adminPageInterface]);
}
