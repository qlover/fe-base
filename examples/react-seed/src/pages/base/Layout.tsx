import { Outlet } from 'react-router-dom';
import { Loading } from '@/components/Loading';
import { useIOC } from '@/hooks/useIOC';
import { useStore } from '@/hooks/useStore';
import { RouteService } from '@/impls/RouteService';

export default function BaseLayout() {
  const routeService = useIOC(RouteService);
  const loading = useStore(routeService.getUIStore(), (s) => s.loading);

  // 拦截一下路由渲染
  if (loading) {
    return <Loading fullscreen />;
  }

  return (
    <div
      data-testid="basic-layout"
      className="text-base min-h-screen bg-primary"
    >
      <div className="text-text bg-primary">
        <Outlet />
      </div>
    </div>
  );
}
