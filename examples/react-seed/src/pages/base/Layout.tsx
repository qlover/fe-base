import { useStore } from '@brain-toolkit/react-kit';
import { usePathLocaleRoute } from '@config/react-seed';
import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Loading } from '@/components/Loading';
import { useIOC } from '@/hooks/useIOC';
import { I18nService } from '@/impls/I18nService';
import { RouteService } from '@/impls/RouteService';

export default function BaseLayout() {
  const routeService = useIOC(RouteService);
  const loading = useStore(routeService.getStore(), (s) => s.loading);
  const { lng } = useParams<{ lng?: string }>();
  const i18nService = useIOC(I18nService);

  // Sync route locale param to i18n when user navigates (e.g. via LocaleLink)
  useEffect(() => {
    if (!usePathLocaleRoute || !lng) return;
    if (!i18nService.isLocale(lng)) return;
    if (i18nService.getLocale() === lng) return;
    i18nService.changeLocale(lng);
  }, [lng, i18nService]);

  // 拦截一下路由渲染
  if (loading) {
    return <Loading data-testid="BaseLayoutLoading" fullscreen />;
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
