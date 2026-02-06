import { pathLocalRoutePrefix } from '@config/router';
import {
  routePathLocaleParamKey,
  usePathLocaleRoute
} from '@config/seed.config';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIOC } from '@/hooks/useIOC';
import { I18nService } from '@/impls/I18nService';
import { getLocaleRedirectTo } from '@/utils/getLocaleRedirectTo';
import { Loading } from './Loading';
import type { RouterRenderProps } from './RouterRenderComponent';
import type { RouteParams } from '@/interfaces/RouteServiceInterface';
import type { PropsWithChildren } from 'react';

export interface PageProps extends RouterRenderProps {
  loading?: boolean;
}

/**
 * 顶层页面组件
 *
 * 主要用于以下作用, 处理与业务逻辑无关的行为，比如
 *
 * 1. 路由参数同步给国际化
 * 2. 主题的初始化
 *
 *
 * @param props
 * @returns
 */
export function Page(props: PropsWithChildren<PageProps>) {
  const { children, route } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const { [routePathLocaleParamKey]: lng } = useParams<RouteParams>();
  const i18nService = useIOC(I18nService);
  const [isI18nLoading, setIsI18nLoading] = useState(false);
  const effectCancelledRef = useRef(false);

  const redirectToLocalPage = useCallback(
    (locale: string) => {
      if (usePathLocaleRoute) {
        const to = getLocaleRedirectTo(location.pathname, locale, {
          search: location.search,
          hash: location.hash
        });
        navigate(to, { replace: true });
      }
    },
    [navigate, location.pathname, location.search, location.hash]
  );

  // Sync route locale param to i18n when user navigates (e.g. via LocaleLink)
  useEffect(() => {
    effectCancelledRef.current = false;
    if (!usePathLocaleRoute || !lng) return;

    if (!i18nService.isLocale(lng)) {
      const currentLocale = i18nService.getLocale();
      i18nService.changeLocale(currentLocale);
      redirectToLocalPage(currentLocale);
      return;
    }

    const currentLocale = i18nService.getLocale();
    if (lng === currentLocale) return;

    setIsI18nLoading(true);
    i18nService.changeLocale(lng).then(() => {
      if (!effectCancelledRef.current) {
        setIsI18nLoading(false);
      }
    });

    return () => {
      effectCancelledRef.current = true;
    };
  }, [lng, i18nService, redirectToLocalPage]);

  const pagePath = useMemo(() => {
    return route.path?.replace(pathLocalRoutePrefix, lng ?? '');
  }, [route.path, lng]);

  return (
    <div
      data-testid="Page"
      data-locale={lng}
      data-page-category={route.category}
      data-page-path={pagePath}
    >
      {children}
      {isI18nLoading && <Loading fullscreen />}
    </div>
  );
}
