import { useTranslation } from 'react-i18next';
import { useContext, useMemo } from 'react';
import { BasePageProvider } from '@/base/types/Page';
import { RouteMeta } from '@/base/types/Page';
import { createContext } from 'react';
import { defaultBaseRoutemeta } from '@config/app.common';
import merge from 'lodash/merge';

export const BaseRoutePageContext = createContext<RouteMeta>({});

export function useBaseRoutePage(): BasePageProvider {
  const meta = useContext(BaseRoutePageContext);

  if (!meta) {
    throw new Error('useBaseRoutePage must be used within a PageProvider');
  }

  const _meta = useMemo(() => merge({}, defaultBaseRoutemeta, meta), [meta]);

  const i18n = useTranslation(_meta.localNamespace);

  return {
    meta: _meta,
    i18n,
    t: i18n.t
  };
}
