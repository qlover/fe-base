import { createContext, PropsWithChildren, useContext } from 'react';
import { BasePageProvider, RoutePageProps } from './type';
import { useTranslation } from 'react-i18next';
import { defaultBaseRoutePageProps } from '@config/app.common';
import { merge } from 'lodash';

const BaseRoutePageContext = createContext<RoutePageProps>({});

// eslint-disable-next-line react-refresh/only-export-components
export function useBaseRoutePage(): BasePageProvider {
  const pageProps = useContext(BaseRoutePageContext);

  if (!pageProps) {
    throw new Error('useBaseRoutePage must be used within a PageProvider');
  }

  const _pageProps = merge({}, defaultBaseRoutePageProps, pageProps);

  const i18n = useTranslation(_pageProps.localNamespace);

  return {
    pageProps: _pageProps,
    i18n,
    t: i18n.t
  };
}

export default function PageProvider(props: PropsWithChildren<RoutePageProps>) {
  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
