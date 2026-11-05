'use client';

import { useRouter } from 'next/router';
import { useEffect, useState, type ReactNode } from 'react';
import { AppBridgePages } from '@/uikit/components-app/AppBridgePages';
import { useAdminNavItems } from '@/uikit/hook/useAdminNavItems';
import { AdminLayout } from './AdminLayout';
import { AdminPanelLoading } from './AdminPanelLoading';

function isAdminAsPath(url: string): boolean {
  const path = url.split('?')[0] ?? url;
  return /(?:^|\/)admin(?:\/|$)/.test(path);
}

export interface AdminPagesAppShellProps {
  readonly children: ReactNode;
}

/**
 * Pages Router 后台常驻壳：`/admin/*` 切页时侧栏不重建，仅内容区遮罩等待。
 * 各页 SEO 由 {@link AdminPageShell} 负责。
 */
export function AdminPagesAppShell({ children }: AdminPagesAppShellProps) {
  const router = useRouter();
  const navItems = useAdminNavItems();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const onStart = (url: string) => {
      if (isAdminAsPath(url)) {
        setNavigating(true);
      }
    };
    const onDone = () => setNavigating(false);

    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onDone);

    return () => {
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onDone);
    };
  }, [router.events]);

  return (
    <AdminLayout navItems={navItems}>
      <AppBridgePages />
      <div
        data-testid="AdminPagesAppShellContent"
        className="relative min-h-48"
        aria-busy={navigating}
      >
        {navigating ? (
          <div className="absolute inset-0 z-10 bg-primary/55 backdrop-blur-[1px]">
            <AdminPanelLoading
              testId="AdminPagesRouteLoading"
              className="min-h-full py-16"
            />
          </div>
        ) : null}
        <div
          className={
            navigating
              ? 'pointer-events-none select-none opacity-50'
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </AdminLayout>
  );
}
