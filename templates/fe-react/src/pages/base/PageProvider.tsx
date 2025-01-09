import { createContext, PropsWithChildren, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultBaseRoutemeta } from '@config/app.common';
import merge from 'lodash/merge';
import { BasePageProvider, RouteMeta } from '@/types/Page';

const BaseRoutePageContext = createContext<RouteMeta>({});

// eslint-disable-next-line react-refresh/only-export-components
export function useBaseRoutePage(): BasePageProvider {
  const meta = useContext(BaseRoutePageContext);

  if (!meta) {
    throw new Error('useBaseRoutePage must be used within a PageProvider');
  }

  const _meta = merge({}, defaultBaseRoutemeta, meta);

  const i18n = useTranslation(_meta.localNamespace);

  return {
    meta: _meta,
    i18n,
    t: i18n.t
  };
}

export default function PageProvider(props: PropsWithChildren<RouteMeta>) {
  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
