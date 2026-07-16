'use client';

import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import { themeConfig } from '@config/theme';
import type { ReactNode } from 'react';
import '@/styles/antd-themes/index.css';

/**
 * Scopes Ant Design theme + css-in-js registry to demo-ui (and other
 * deliberate antd showcases). Do not wrap the app shell with this.
 *
 * Antd CSS variable overrides load here (not in global styles) so homepage
 * and other antd-free routes avoid ~57KB of render-blocking CSS.
 */
export function AntdDemoProvider({ children }: { children: ReactNode }) {
  return (
    <AntdThemeProvider
      data-testid="AntdDemoProvider"
      theme={themeConfig.antdTheme}
    >
      <AntdRegistry layer>{children}</AntdRegistry>
    </AntdThemeProvider>
  );
}
