'use client';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import { useMountedClient } from '@brain-toolkit/react-kit';
import { I } from '@config/IOCIdentifier';
import { clientIOC } from '@/core/clientIoc/ClientIOC';
import type { CommonThemeConfig } from '@config/theme';

/**
 * CommonProvider is a provider for the common components
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
      staticApi={IOC(I.DialogHandler)}
    >
      {mounted ? children : null}
    </AntdThemeProvider>
  );
}
