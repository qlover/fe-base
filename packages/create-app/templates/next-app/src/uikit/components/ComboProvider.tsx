import '@ant-design/v5-patch-for-react-19';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import type { CommonThemeConfig } from '@config/theme';
import { ThemeProvider } from 'next-themes';
import { BootstrapsProvider } from './BootstrapsProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';

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

  return (
    <AntdThemeProvider theme={themeConfig.antdTheme}>
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
