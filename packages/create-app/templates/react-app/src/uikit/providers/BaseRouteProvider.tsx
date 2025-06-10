import { PropsWithChildren } from 'react';
import { RouteMeta } from '@/base/types/Page';
import { BaseRoutePageContext } from '@/uikit/contexts/BaseRouteContext';
import { useDocumentTitle } from '@/uikit/hooks/useDocumentTitle';
import { IOC } from '@/core/IOC';

export default function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  useDocumentTitle(props.title ?? IOC('AppConfig').appName);

  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
