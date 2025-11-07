import type { RouteMeta } from '@/base/types/Page';
import { BaseRoutePageContext } from '@/uikit/contexts/BaseRouteContext';
import { BaseRouteSeo } from './BaseRouteSeo';
import type { PropsWithChildren } from 'react';

export function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  const { children, ..._props } = props;

  return (
    <BaseRoutePageContext.Provider
      data-testid="BaseRouteProvider"
      value={_props}
    >
      {typeof _props.i18nInterface === 'object' &&
        _props.i18nInterface != null &&
        Object.keys(_props.i18nInterface).length > 0 && <BaseRouteSeo />}

      {children}
    </BaseRoutePageContext.Provider>
  );
}
