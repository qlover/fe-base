import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useStore } from '@brain-toolkit/react-kit';
import { I } from '@config/IOCIdentifier';
import { useIOC } from '../hooks/useIOC';
import { useMemo } from 'react';
import { ComponentValue, RouterLoader } from '@/base/cases/RouterLoader';
import { RouterRenderComponent } from './RouterRenderComponent';
import { routerPrefix } from '@config/common';

export function AppRouterProvider(props: { pages: ComponentValue }) {
  const { pages } = props;

  const routerService = useIOC(I.RouteServiceInterface);
  const logger = useIOC(I.Logger);
  const routes = useStore(routerService, (state) => state.routes);

  const routerLoader = useMemo(() => {
    return new RouterLoader({
      componentMaps: pages,
      render: RouterRenderComponent,
      logger: logger
    });
  }, []);

  const routerBase = useMemo(() => {
    const routeList = routes.map((route) => routerLoader.toRoute(route));
    const router = createBrowserRouter(routeList, {
      basename: routerPrefix
    });
    return router;
  }, [routes]);

  return <RouterProvider router={routerBase} />;
}
