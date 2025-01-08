import './styles/css/index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createFeReactRoutes } from './pages';
import { I18nService } from '@/services';
import { useMemo } from 'react';
import { pageProcesser, routerController } from './container';

I18nService.init();
pageProcesser.init();

function App() {
  const routerBase = useMemo(() => {
    return createBrowserRouter(
      createFeReactRoutes(routerController.getRoutes())
    );
  }, []);

  return <RouterProvider router={routerBase} />;
}

export default App;
