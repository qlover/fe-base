import { View } from '@tarojs/components';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import { I } from '@/config/ioc-identifier';
import { themeConfig } from '@/config/theme';
import { useIOC } from '@/hooks/useIOC';
import { useStore } from '@/hooks/useStore';
import type { ThemeStoreStateInterface } from '@/impls/ThemeService';
import type { ViewProps } from '@tarojs/components';

const resovleThemeSelector = (s: ThemeStoreStateInterface) => s.resovleTheme;

export function Page({ children, className, ...rest }: ViewProps) {
  const themeService = useIOC(I.ThemeService);
  const resovleTheme = useStore(themeService, resovleThemeSelector);

  const themeClass = useMemo(
    () => themeConfig.themeValueTemplate.replace('{{theme}}', resovleTheme),
    [resovleTheme]
  );

  return (
    <View
      data-testid="Page"
      // 兼容h5 web 端
      data-theme={resovleTheme}
      // 小程序端使用 class 表示主题
      className={clsx(className, themeClass)}
      {...rest}
    >
      {children}
    </View>
  );
}
