import { PropsWithChildren } from 'react';
import { RouteMeta } from '@/types/Page';
import { BaseRoutePageContext } from './BaseRouteContext';

export default function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
