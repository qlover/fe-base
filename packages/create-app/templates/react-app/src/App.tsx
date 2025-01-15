import './styles/css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createFeReactRoutes } from './pages';
import { I18nService } from '@/services/i18n';
import { useMemo } from 'react';
import { routerController } from './containers';

I18nService.init();

function App() {
  const routerBase = useMemo(() => {
    const routes = createFeReactRoutes(routerController.getRoutes());
    const router = createBrowserRouter(routes);
    return router;
  }, []);

  return <RouterProvider router={routerBase} />;
}

export default App;
