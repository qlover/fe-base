import { AppRouterProvider } from './components/AppRouterProvider';
import { Loading } from './components/Loading';
import { logger } from './globals';
import { useIOC } from './hooks/useIOC';
import { useStore } from './hooks/useStore';
import { RouteService } from './impls/RouteService';
import type { ComponentMap } from './impls/RouterLoader';

function App({ pages }: { pages: ComponentMap }) {
  logger.debug('App pages:', pages);

  const routeService = useIOC(RouteService);
  const loading = useStore(routeService.getUIStore(), (s) => s.loading);

  // Wait until userRoutePlugin picks main/auth routes. Rendering the router with
  // general-only routes would leave /:lng/login unmatched and fall through to * → 404.
  if (loading) {
    return <Loading fullscreen />;
  }

  return <AppRouterProvider pages={pages} />;
}

export default App;
