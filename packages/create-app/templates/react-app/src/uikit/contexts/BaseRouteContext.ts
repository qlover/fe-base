import { useTranslation } from 'react-i18next';
import { useContext, useMemo } from 'react';
import { BasePageProvider } from '@/base/types/Page';
import { RouteMeta } from '@/base/types/Page';
import { createContext } from 'react';
import merge from 'lodash/merge';
import { i18nConfig } from '@config/i18n';

const defaultBaseRoutemeta = {
  localNamespace: i18nConfig.defaultNS,
  title: '',
  icon: ''
};

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
