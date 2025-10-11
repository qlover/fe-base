'use client';

import {
  DashboardOutlined,
  GlobalOutlined,
  UserOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { clsx } from 'clsx';
import React, { useMemo, type HTMLAttributes } from 'react';
import { AdminPageManager } from '@/base/cases/AdminPageManager';
import { BaseHeader } from './BaseHeader';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LocaleLink } from './LocaleLink';
import { LogoutButton } from './LogoutButton';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useIOC } from '../hook/useIOC';
import { useStore } from '../hook/useStore';
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

  const page = useIOC(AdminPageManager);
  const collapsedSidebar = useStore(page, page.selectors.collapsedSidebar);
  const navItems = useStore(page, page.selectors.navItems);

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
          <Menu mode="inline" items={sidebarItems} />

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
        <BaseHeader
          href="/admin"
          className="max-w-full pl-0"
          rightActions={rightActions}
        />
        <main
          className={clsx('p-2 bg-primary text-text flex-1', mainClassName)}
        >
          {children}
        </main>
      </Layout>
    </Layout>
  );
}
