import { useEffect, useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useIOC } from '@/hooks/useIOC';
import { useStore } from '@/hooks/useStore';
import { RouterLoader } from '@/impls/RouterLoader';
import type { ComponentMap } from '@/impls/RouterLoader';
import { RouteService } from '@/impls/RouteService';
import { routerPrefix } from '@config/seed.config';
import { RouterRenderComponent } from './RouterRenderComponent';

export function AppRouterProvider(props: { pages: ComponentMap }) {
  const { pages } = props;

  const routeService = useIOC(RouteService);
  const logger = useIOC('Logger');
  const routes = useStore(routeService.getUIStore(), (s) => s.result ?? []);
  const loading = useStore(routeService.getUIStore(), (s) => s.loading);

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

  useEffect(() => {
    if (loading) {
      return;
    }

    const to = routeService.consumePostSwitchNavigateTo();
    if (to) {
      void routerBase.navigate(to, { replace: true });
    }
  }, [loading, routes, routerBase, routeService]);

  return <RouterProvider router={routerBase} />;
}
