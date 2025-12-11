'use client';
import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import { ThemeProvider } from 'next-themes';
import { I } from '@config/IOCIdentifier';
import type { CommonThemeConfig } from '@config/theme';
import { useIOC } from '../hook/useIOC';

/**
 * ClientRootProvider is a provider for the client components
 *
 * - ThemeProvider
 * - AntdProvider
 *
 * TODO: 存在问题：
 *
 * 1. antd 样式存在闪烁问题, 目前没有解决, 可能是因为 cssinjs 的技术性问题
 *
 * 目前能将完美解决的就是完全使用客户端渲染,也就是引入 useMountedClient 当客户端渲染时才渲染, 这样就不会出现闪烁问题
 * 但是他会导致国际化切换闪烁问题
 *
 * 可能需要等待 antd 官方解决这个问题
 *
 * @example
 *
 * ```tsx
 * const mounted = useMountedClient();
 *
 * return mounted && children;
 * ```
 *
 *
 * @param themeConfig - The theme config
 * @param children - The children components
 * @returns
 */
export function ClientRootProvider(props: {
  themeConfig: CommonThemeConfig;
  children: React.ReactNode;
}) {
  const { themeConfig, children } = props;

  const IOC = useIOC();

  return (
    <AntdThemeProvider
      data-testid="ComboProvider"
      theme={themeConfig.antdTheme}
      staticApi={IOC(I.DialogHandler)}
    >
      <ThemeProvider
        themes={themeConfig.supportedThemes as unknown as string[]}
        attribute={themeConfig.domAttribute}
        defaultTheme={themeConfig.defaultTheme}
        enableSystem={themeConfig.enableSystem}
        enableColorScheme={false}
        storageKey={themeConfig.storageKey}
      >
        <AntdRegistry>{children}</AntdRegistry>
      </ThemeProvider>
    </AntdThemeProvider>
  );
}
