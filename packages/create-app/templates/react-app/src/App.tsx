import '@/uikit/styles/css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, useMemo } from 'react';
import { RouterLoader, ComponentValue } from '@qlover/fe-prod/react';
import { RouterRenderComponent } from './components/RouterRenderComponent';
import { IOC } from './core/IOC';
import { RouterController } from './uikit/controllers/RouterController';

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
    const routes = IOC(RouterController)
      .getRoutes()
      .map((route) => routerLoader.toRoute(route));
    const router = createBrowserRouter(routes);
    return router;
  }, []);

  return <RouterProvider router={routerBase} />;
}

export default App;
