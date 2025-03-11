import '@/uikit/styles/css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, useMemo } from 'react';
import { RouterLoader } from '@lib/router-loader/RouterLoader';
import appConfig from '@config/app.router.json';
import { RouterRenderComponent } from './components/RouterRenderComponent';
import { PagesMaps } from './base/types/Page';

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
  }, {} as PagesMaps);
}

const routerLoader = new RouterLoader({
  componentMaps: getAllPages(),
  render: RouterRenderComponent
});

function App() {
  const routerBase = useMemo(() => {
    const routes = appConfig.base.routes.map((route) =>
      routerLoader.toRoute(route)
    );
    const router = createBrowserRouter(routes);
    return router;
  }, []);

  return <RouterProvider router={routerBase} />;
}

export default App;
