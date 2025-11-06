import { useContext, useMemo } from 'react';
import { BasePageProvider } from '@/base/types/Page';
import { RouteMeta } from '@/base/types/Page';
import { createContext } from 'react';
import merge from 'lodash/merge';
import { i18nConfig } from '@config/i18n/i18nConfig';
import { WITHIN_PAGE_PROVIDER } from '@config/Identifier/common/common.error';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useI18nInterface } from '../hooks/useI18nInterface';

const { defaultNS } = i18nConfig;

const defaultBaseRoutemeta = {
  localNamespace: defaultNS,
  title: '',
  icon: '',
  i18nInterface: {}
};

export const BaseRoutePageContext = createContext<RouteMeta>({});

export function useBaseRoutePage<
  T extends Record<string, string>
>(): BasePageProvider<T> {
  const meta = useContext(BaseRoutePageContext);

  if (!meta) {
    throw new Error(WITHIN_PAGE_PROVIDER);
  }

  const _meta = useMemo(() => merge({}, defaultBaseRoutemeta, meta), [meta]);

  const i18n = useAppTranslation(_meta.localNamespace);

  const i18nInterface = useI18nInterface(_meta.i18nInterface as T);

  return {
    meta: _meta as Omit<RouteMeta, 'i18nInterface'> & { i18nInterface?: T },
    i18nInterface: i18nInterface as T,
    tt: i18nInterface as T,
    i18n,
    t: i18n.t
  };
}
