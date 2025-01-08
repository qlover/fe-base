import './styles/css/index.css';
import { RouterProvider } from 'react-router-dom';
import { routerBase } from './pages';
import { I18nService } from '@/services';
import { useController } from '@lib/fe-react-controller';
import { themeController } from './container';

I18nService.init();

function App() {
  useController(themeController);

  return <RouterProvider router={routerBase} />;
}

export default App;
