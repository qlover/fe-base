import '@/styles/css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, useMemo } from 'react';
import { RouterRenderComponent } from './uikit/components/RouterRenderComponent';
import { IOC } from './core/IOC';
import { RouteService } from './base/services/RouteService';
import { RouterLoader, type ComponentValue } from '@/base/cases/RouterLoader';
import { AntdThemeProvider } from '@brain-toolkit/antd-theme-override/react';
import { routerPrefix } from '@config/common';

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
  render: RouterRenderComponent
});

function App() {
  const routerBase = useMemo(() => {
    const routes = IOC(RouteService)
      .getRoutes()
      .map((route) => routerLoader.toRoute(route));
    const router = createBrowserRouter(routes, {
      basename: routerPrefix
    });
    return router;
  }, []);

  return (
    <AntdThemeProvider
      staticApi={IOC('DialogHandler')}
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
