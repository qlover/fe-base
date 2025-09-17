'use client';

import {
  DashboardOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { clsx } from 'clsx';
import React, { useCallback, useMemo, type HTMLAttributes } from 'react';
import { AdminPageManager } from '@/base/cases/AdminPageManager';
import { BaseHeader } from './BaseHeader';
import { LocaleLink } from './LocaleLink';
import { useIOC } from '../hook/useIOC';
import { useStore } from '../hook/useStore';
import type { RenderLeftFunction } from './BaseHeader';
import type { ItemType } from 'antd/es/menu/interface';

const { Sider } = Layout;

const IconMap = {
  dashboard: <DashboardOutlined />,
  users: <UserOutlined />
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

  const renderHeaderLeft: RenderLeftFunction = useCallback(
    ({ defaultElement }) => (
      <div data-testid="AdminLayoutHeader" className="flex items-center">
        <span
          className="text-text hover:text-text-hover cursor-pointer text-md transition-colors"
          onClick={() => page.toggleSidebar()}
        >
          {collapsedSidebar ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>

        {defaultElement}
      </div>
    ),
    [collapsedSidebar, page]
  );

  return (
    <Layout data-testid="AdminLayout" className={className} {...rest}>
      <div className="overflow-auto h-screen sticky top-0 bottom-0 scrollbar-thin scrollbar-gutter-stable">
        <Sider
          className="h-full"
          onCollapse={() => page.toggleSidebar()}
          collapsed={collapsedSidebar}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['4']}
            items={sidebarItems}
          />
        </Sider>
      </div>

      <Layout>
        <BaseHeader
          href="/admin"
          showLogoutButton
          renderLeft={renderHeaderLeft}
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
