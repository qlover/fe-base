'use client';

import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import { themeConfig } from '@config/theme';
import type { ReactNode } from 'react';

/**
 * Scopes Ant Design theme + css-in-js registry to demo-ui (and other
 * deliberate antd showcases). Do not wrap the app shell with this.
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
