import './styles/css/index.css';
import { RouterProvider } from 'react-router-dom';
import { routerBase } from './pages';
import initI18n from './services/i18n';

initI18n();

function App() {

  return <RouterProvider router={routerBase} />;
}

export default App;
