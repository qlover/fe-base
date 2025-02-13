import { PropsWithChildren } from 'react';
import { RouteMeta } from '@/base/types/Page';
import { BaseRoutePageContext } from '../contexts/BaseRouteContext';

export default function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
