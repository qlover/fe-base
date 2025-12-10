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
        enableSystem
        enableColorScheme={false}
        storageKey={themeConfig.storageKey}
      >
        <AntdRegistry>{children}</AntdRegistry>
      </ThemeProvider>
    </AntdThemeProvider>
  );
}
