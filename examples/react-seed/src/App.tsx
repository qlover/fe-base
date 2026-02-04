import { AppRouterProvider } from './components/AppRouterProvider';
import type { ComponentMap } from './impls/RouterLoader';

function App({ pages }: { pages: ComponentMap }) {
  return <AppRouterProvider pages={pages} />;
}

export default App;
