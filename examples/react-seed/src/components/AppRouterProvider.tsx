import { routerPrefix } from '@config/seed.config';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useIOC } from '@/hooks/useIOC';
import { useStore } from '@/hooks/useStore';
import { RouterLoader } from '@/impls/RouterLoader';
import { RouteService } from '@/impls/RouteService';
import { RouterRenderComponent } from './RouterRenderComponent';
import type { ComponentMap } from '@/impls/RouterLoader';

export function AppRouterProvider(props: { pages: ComponentMap }) {
  const { pages } = props;

  const routeService = useIOC(RouteService);
  const logger = useIOC('Logger');
  const routes = useStore(routeService.getStore(), (s) => s.result ?? []);

  const routerLoader = useMemo(
    () =>
      new RouterLoader({
        componentMaps: pages,
        render: RouterRenderComponent,
        logger: logger
      }),
    [pages, logger]
  );

  const routerBase = useMemo(() => {
    const routeList = routes.map((route) => routerLoader.toRoute(route));

    logger.debug(routeList);

    return createBrowserRouter(routeList, {
      basename: routerPrefix
    });
  }, [routes, routerLoader, logger]);

  return <RouterProvider router={routerBase} />;
}
