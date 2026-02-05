import { AppRouterProvider } from './components/AppRouterProvider';
import type { ComponentMap } from './impls/RouterLoader';

function App({ pages }: { pages: ComponentMap }) {
  return (
    <div data-testid="App">
      <AppRouterProvider pages={pages} />
    </div>
  );
}

export default App;
