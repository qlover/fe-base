'use client';
import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import { ThemeProvider } from 'next-themes';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { clientIOC } from '@/core/clientIoc/ClientIOC';
import { BootstrapsProvider } from './BootstrapsProvider';
import type { CommonThemeConfig } from '@config/theme';

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
          <AntdRegistry>{children}</AntdRegistry>
        </BootstrapsProvider>
      </ThemeProvider>
    </AntdThemeProvider>
  );
}
