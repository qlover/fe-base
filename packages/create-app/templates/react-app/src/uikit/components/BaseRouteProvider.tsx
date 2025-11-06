import { PropsWithChildren } from 'react';
import { RouteMeta } from '@/base/types/Page';
import { BaseRoutePageContext } from '@/uikit/contexts/BaseRouteContext';
import { useDocumentTitle } from '@/uikit/hooks/useDocumentTitle';
import { useIOC } from '../hooks/useIOC';
import { useAppTranslation } from '../hooks/useAppTranslation';

export default function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  const { t } = useAppTranslation();
  const AppConfig = useIOC('AppConfig');

  useDocumentTitle(props.title ? t(props.title) : AppConfig.appName);

  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
