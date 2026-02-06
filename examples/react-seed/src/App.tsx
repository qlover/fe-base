import { AppRouterProvider } from './components/AppRouterProvider';
import { logger } from './globals';
import type { ComponentMap } from './impls/RouterLoader';

function App({ pages }: { pages: ComponentMap }) {
  logger.debug('App pages:', pages);

  return <AppRouterProvider pages={pages} />;
}

export default App;
