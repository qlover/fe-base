'use client';

import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  FileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Layout, Menu, type MenuProps } from 'antd';
import { clsx } from 'clsx';
import React, { useCallback, type HTMLAttributes } from 'react';
import { AdminPageManager } from '@/base/cases/AdminPageManager';
import { BaseHeader } from './BaseHeader';
import { useIOC } from '../hook/useIOC';
import { useStore } from '../hook/useStore';
import type { RenderLeftFunction } from './BaseHeader';

const { Sider } = Layout;

export interface AdminLayoutProps extends HTMLAttributes<HTMLDivElement> {
  mainClassName?: string;
  children: React.ReactNode;
}

const items: MenuProps['items'] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    path: '/admin'
  },
  {
    key: 'users',
    icon: <UserOutlined />,
    label: 'User Management',
    path: '/admin/users'
  },
  {
    key: 'teams',
    icon: <TeamOutlined />,
    label: 'Team Management',
    path: '/admin/teams'
  },
  {
    key: 'files',
    icon: <FileOutlined />,
    label: 'File Management',
    path: '/admin/files'
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'System Settings',
    path: '/admin/settings'
  }
].map((item) => ({
  key: item.key,
  icon: item.icon,
  label: item.label,
  onClick: () => {
    // 这里可以通过路由服务进行导航
    window.location.href = item.path;
  }
}));

export function AdminLayout(props: AdminLayoutProps) {
  const { children, className, mainClassName, ...rest } = props;

  const page = useIOC(AdminPageManager);

  const collapsedSidebar = useStore(page, page.selectors.collapsedSidebar);

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
            items={items}
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
