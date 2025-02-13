import '@/uikit/styles/css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createFeReactRoutes } from './pages';
import { useMemo } from 'react';
import { IOC } from './core';
import { RouterController } from './uikit/controllers/RouterController';

function App() {
  const routerBase = useMemo(() => {
    const routerController = IOC(RouterController);
    const routes = createFeReactRoutes(routerController.getRoutes());
    const router = createBrowserRouter(routes);
    return router;
  }, []);

  return <RouterProvider router={routerBase} />;
}

export default App;
