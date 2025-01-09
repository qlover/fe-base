import './styles/css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createFeReactRoutes } from './pages';
import { I18nService } from '@/services/i18n';
import { useMemo } from 'react';
import { routerController } from './container';

I18nService.init();

function App() {
  const routerBase = useMemo(() => {
    return createBrowserRouter(
      createFeReactRoutes(routerController.getRoutes())
    );
  }, []);

  return <RouterProvider router={routerBase} />;
}

export default App;
