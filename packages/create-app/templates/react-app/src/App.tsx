import '@/styles/css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, useMemo } from 'react';
import { RouterRenderComponent } from './uikit/components/RouterRenderComponent';
import { IOC } from './core/IOC';
import { RouterLoader, type ComponentValue } from '@/base/cases/RouterLoader';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import { routerPrefix } from '@config/common';
import { useStore } from './uikit/hooks/useStore';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { logger } from './core/globals';

function getAllPages() {
  const modules = import.meta.glob('./pages/**/*.tsx');
  return Object.keys(modules).reduce((acc, path) => {
    const componentName = path.replace(/^\.\/pages\/(.*)\.tsx$/, '$1');
    acc[componentName] = () =>
      lazy(
        modules[path] as () => Promise<{
          default: React.ComponentType<unknown>;
        }>
      );
    return acc;
  }, {} as ComponentValue);
}

const routerLoader = new RouterLoader({
  componentMaps: getAllPages(),
  render: RouterRenderComponent,
  logger: logger
});

function App() {
  const routes = useStore(
    IOC(IOCIdentifier.RouteServiceInterface),
    (state) => state.routes
  );

  const routerBase = useMemo(() => {
    const routeList = routes.map((route) => routerLoader.toRoute(route));
    const router = createBrowserRouter(routeList, {
      basename: routerPrefix
    });
    return router;
  }, [routes]);

  return (
    <AntdThemeProvider
      staticApi={IOC('AntdStaticApiInterface')}
      theme={{
        cssVar: {
          key: 'fe-theme',
          prefix: 'fe'
        }
      }}
    >
      <RouterProvider router={routerBase} />
    </AntdThemeProvider>
  );
}

export default App;
