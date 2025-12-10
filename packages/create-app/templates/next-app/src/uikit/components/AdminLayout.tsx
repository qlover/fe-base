'use client';

import {
  DashboardOutlined,
  GlobalOutlined,
  UserOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined
} from '@ant-design/icons';
import { useStore } from '@brain-toolkit/react-kit';
import { Layout, Menu } from 'antd';
import { clsx } from 'clsx';
import { usePathname } from 'next/navigation';
import React, { useMemo, type HTMLAttributes } from 'react';
import { AdminPageManager } from '@/base/cases/AdminPageManager';
import { COMMON_ADMIN_TITLE } from '@config/Identifier';
import { LocaleLink } from './LocaleLink';
import { LanguageSwitcher } from '../components-app/LanguageSwitcher';
import { LogoutButton } from '../components-app/LogoutButton';
import { ThemeSwitcher } from '../components-app/ThemeSwitcher';
import { useIOC } from '../hook/useIOC';
import { useWarnTranslations } from '../hook/useWarnTranslations';
import type { ItemType } from 'antd/es/menu/interface';

const { Sider } = Layout;

const IconMap = {
  dashboard: <DashboardOutlined />,
  users: <UserOutlined />,
  locales: <GlobalOutlined />
};

export interface AdminLayoutProps extends HTMLAttributes<HTMLDivElement> {
  mainClassName?: string;
  children: React.ReactNode;
}

export function AdminLayout(props: AdminLayoutProps) {
  const { children, className, mainClassName, ...rest } = props;

  const pathname = usePathname();
  const page = useIOC(AdminPageManager);
  const collapsedSidebar = useStore(page, page.selectors.collapsedSidebar);
  const navItems = useStore(page, page.selectors.navItems);
  const t = useWarnTranslations();

  const title = useMemo(() => t(COMMON_ADMIN_TITLE), [t]);

  const selectedKey = useMemo(() => {
    // 移除语言前缀，例如 /en/admin/users -> /admin/users
    const normalizedPath = pathname?.replace(/^\/[^/]+/, '') ?? '';
    return navItems.find((item) => item.pathname === normalizedPath)?.key || '';
  }, [pathname, navItems]);

  const sidebarItems = useMemo(() => {
    return navItems.map((item) => {
      // TODO: use i18n
      const title = item.i18nKey;
      const icon = IconMap[item.key as keyof typeof IconMap];

      return {
        key: item.key,
        label: (
          <LocaleLink
            href={item.pathname!}
            title={title}
            className="flex items-center gap-2"
          >
            {icon}
            <span>{title}</span>
          </LocaleLink>
        ),
        link: item.pathname
      } as ItemType;
    });
  }, [navItems]);

  const rightActions = useMemo(() => {
    return [
      <LanguageSwitcher key="language-switcher" />,
      <ThemeSwitcher key="theme-switcher" />,
      <LogoutButton key="logout-button" />
    ];
  }, []);

  return (
    <Layout data-testid="AdminLayout" className={className} {...rest}>
      <div className="overflow-y-auto overflow-x-hidden h-screen sticky top-0 bottom-0 scrollbar-thin scrollbar-gutter-stable">
        <Sider
          className="h-full relative"
          onCollapse={() => page.toggleSidebar()}
          collapsed={collapsedSidebar}
          collapsedWidth={46}
        >
          <Menu
            mode="inline"
            items={sidebarItems}
            selectedKeys={selectedKey ? [selectedKey] : []}
          />

          <div
            data-testid="ToggleSidebarButton"
            className="absolute w-2 right-0 top-0 bottom-0 bg-secondary cursor-pointer hover:bg-elevated flex items-center justify-center"
            onClick={() => page.toggleSidebar()}
          >
            <span className="text-text scale-75 rotate-x-90">
              {collapsedSidebar ? (
                <VerticalAlignTopOutlined />
              ) : (
                <VerticalAlignBottomOutlined />
              )}
            </span>
          </div>
        </Sider>
      </div>

      <Layout>
        <header
          data-testid="AdminLayoutHeader"
          className="h-14 bg-secondary border-b border-c-border sticky top-0 z-50"
        >
          <div
            className={clsx(
              'flex items-center justify-between h-full px-4 mx-auto max-w-7xl',
              className
            )}
          >
            <div className="flex items-center">
              <LocaleLink
                href="/admin"
                title={title}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <span className="text-lg font-semibold text-text">{title}</span>
              </LocaleLink>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {rightActions}
            </div>
          </div>
        </header>
        <main
          className={clsx('p-2 bg-primary text-text flex-1', mainClassName)}
        >
          {children}
        </main>
      </Layout>
    </Layout>
  );
}
