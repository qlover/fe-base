import { baseNoLocaleRoutes } from '@config/app.router';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { logger } from '@/globals';
import { RouterLoader } from '@/impls/RouterLoader';
import { RouterRenderComponent } from './RouterRenderComponent';
import type { ComponentMap } from '@/impls/RouterLoader';

export function AppRouterProvider(props: { pages: ComponentMap }) {
  const { pages } = props;

  const routes = baseNoLocaleRoutes;

  const routerLoader = useMemo(
    () =>
      new RouterLoader({
        componentMaps: pages,
        render: RouterRenderComponent,
        logger: logger
      }),
    [pages]
  );

  const routerBase = useMemo(() => {
    const routeList = routes.map((route) => routerLoader.toRoute(route));
    return createBrowserRouter(routeList);
  }, [routes, routerLoader]);

  return <RouterProvider router={routerBase} />;
}
