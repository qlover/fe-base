import { createContext, useContext } from 'react';
import { BasePageProvider, RoutePageProps } from './type';
import { useTranslation } from 'react-i18next';
import { defaultBaseRoutePageProps } from '@config/app.common';

const BaseRoutePageContext = createContext<RoutePageProps>({
  ...defaultBaseRoutePageProps
});

// eslint-disable-next-line react-refresh/only-export-components
export function useBaseRoutePage(): BasePageProvider {
  const pageProps = useContext(BaseRoutePageContext);

  if (!pageProps) {
    throw new Error('useBaseRoutePage must be used within a PageProvider');
  }

  const i18n = useTranslation(pageProps.localNamespace);

  return {
    pageProps,
    i18n,
    t: i18n.t
  };
}

export default function PageProvider(
  props: RoutePageProps & { children: React.ReactNode }
) {
  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
