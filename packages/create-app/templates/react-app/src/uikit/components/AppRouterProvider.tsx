import { useStore } from '@brain-toolkit/react-kit';
import { I } from '@config/IOCIdentifier';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import type { ComponentValue } from '@/base/cases/RouterLoader';
import { RouterLoader } from '@/base/cases/RouterLoader';
import { RouterRenderComponent } from './RouterRenderComponent';
import { useIOC } from '../hooks/useIOC';

export function AppRouterProvider(props: { pages: ComponentValue }) {
  const { pages } = props;

  const routerService = useIOC(I.RouteServiceInterface);
  const logger = useIOC(I.Logger);
  const appConfig = useIOC(I.AppConfig);
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
      basename: appConfig.baseUrl
    });
    return router;
  }, [routes, appConfig.baseUrl]);

  return <RouterProvider data-testid="AppRouterProvider" router={routerBase} />;
}
