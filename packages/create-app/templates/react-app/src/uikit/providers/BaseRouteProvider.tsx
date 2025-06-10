import { PropsWithChildren } from 'react';
import { RouteMeta } from '@/base/types/Page';
import { BaseRoutePageContext } from '@/uikit/contexts/BaseRouteContext';
import { useDocumentTitle } from '@/uikit/hooks/useDocumentTitle';
import { IOC } from '@/core/IOC';
import { useTranslation } from 'react-i18next';

export default function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  const { t } = useTranslation();

  console.log('props.title', props.title);

  const title = props.title ? t(props.title) : IOC('AppConfig').appName;
  console.log('title', title);

  useDocumentTitle(title);

  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
