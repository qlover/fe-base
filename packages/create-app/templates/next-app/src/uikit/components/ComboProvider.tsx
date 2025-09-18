'use client';
import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import { ThemeProvider } from 'next-themes';
import { clientIOC } from '@/core/clientIoc/ClientIOC';
import { IOCIdentifier } from '@config/IOCIdentifier';
import type { CommonThemeConfig } from '@config/theme';
import { BootstrapsProvider } from './BootstrapsProvider';
import { useMountedClient } from '../hook/useMountedClient';

/**
 * CommonProvider is a provider for the common components
 *
 * - IOCProvider
 * - BootstrapsProvider
 * - ThemeProvider
 * - AntdProvider
 *
 * @param param0
 * @returns
 */
export function ComboProvider(props: {
  themeConfig: CommonThemeConfig;
  children: React.ReactNode;
}) {
  /**
   * useMountedClient 会等待客户端完全初始化
   * 只有在客户端准备就绪后才渲染组件内容
   * 这样可以确保所有的客户端代码（包括 API 配置、插件等）都已经正确初始化
   */
  const mounted = useMountedClient();

  const { themeConfig, children } = props;

  const IOC = clientIOC.create();

  return (
    <AntdThemeProvider
      data-testid="ComboProvider"
      theme={themeConfig.antdTheme}
      staticApi={IOC(IOCIdentifier.DialogHandler)}
    >
      <ThemeProvider
        themes={themeConfig.supportedThemes as unknown as string[]}
        attribute={themeConfig.domAttribute}
        defaultTheme={themeConfig.defaultTheme}
        enableSystem
        enableColorScheme={false}
        storageKey={themeConfig.storageKey}
      >
        <BootstrapsProvider>
          <AntdRegistry>{mounted ? children : null}</AntdRegistry>
        </BootstrapsProvider>
      </ThemeProvider>
    </AntdThemeProvider>
  );
}
