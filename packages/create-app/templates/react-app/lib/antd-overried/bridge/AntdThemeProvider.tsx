import { AntdStaticApiInterface } from '@lib/antd-overried/bridge/AntdStaticApiInterface';
import { ConfigProvider, ConfigProviderProps } from 'antd';
import { ReactNode } from 'react';
import { AntdStaticProvider } from './AntdStaticProvider';

export function AntdThemeProvider(
  props: ConfigProviderProps & {
    children?: ReactNode;
    staticApi?: AntdStaticApiInterface;
  } = {}
) {
  const { children, staticApi, ...rest } = props;

  return (
    <ConfigProvider {...rest}>
      {staticApi && <AntdStaticProvider staticApi={staticApi} />}
      {children}
    </ConfigProvider>
  );
}
