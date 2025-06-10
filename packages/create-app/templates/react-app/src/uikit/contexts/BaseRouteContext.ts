import { useTranslation } from 'react-i18next';
import { useContext, useMemo } from 'react';
import { BasePageProvider } from '@/base/types/Page';
import { RouteMeta } from '@/base/types/Page';
import { createContext } from 'react';
import merge from 'lodash/merge';
import i18nConfig from '@config/i18n';
import { WITHIN_PAGE_PROVIDER } from '@config/Identifier/Error';

const { defaultNS } = i18nConfig;

const defaultBaseRoutemeta = {
  localNamespace: defaultNS,
  title: '',
  icon: ''
};

export const BaseRoutePageContext = createContext<RouteMeta>({});

export function useBaseRoutePage(): BasePageProvider {
  const meta = useContext(BaseRoutePageContext);

  if (!meta) {
    throw new Error(WITHIN_PAGE_PROVIDER);
  }

  const _meta = useMemo(() => merge({}, defaultBaseRoutemeta, meta), [meta]);

  const i18n = useTranslation(_meta.localNamespace);

  return {
    meta: _meta,
    i18n,
    t: i18n.t
  };
}
