import './styles/css/index.css';
import { RouterProvider } from 'react-router-dom';
import { routerBase } from './pages';

function App() {
  return (
    <RouterProvider router={routerBase} />
  );
}

export default App;
