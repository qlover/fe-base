import { PropsWithChildren } from 'react';
import { RouteMeta } from '@/base/types/Page';
import { BaseRoutePageContext } from '@/uikit/contexts/BaseRouteContext';
import { useDocumentTitle } from '@/uikit/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import { useIOC } from '../hooks/useIOC';

export default function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  const { t } = useTranslation();
  const AppConfig = useIOC('AppConfig');

  useDocumentTitle(props.title ? t(props.title) : AppConfig.appName);

  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
