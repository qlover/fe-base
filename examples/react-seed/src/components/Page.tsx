import { pathLocalRoutePrefix } from '@config/app.router';
import {
  routePathLocaleParamKey,
  usePathLocaleRoute
} from '@config/react-seed';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIOC } from '@/hooks/useIOC';
import { I18nService } from '@/impls/I18nService';
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
  const { [routePathLocaleParamKey]: lng } = useParams<RouteParams>();
  const i18nService = useIOC(I18nService);

  const redirectToLocalPage = useCallback(
    (locale: string) => {
      if (usePathLocaleRoute) {
        console.log('Page redirectToLocalPage to locale', locale);
        // TODO: hash qs 可能会丢失
        navigate('/' + locale, { replace: true });
      }
    },
    [navigate]
  );
  // Sync route locale param to i18n when user navigates (e.g. via LocaleLink)
  useEffect(() => {
    if (!usePathLocaleRoute || !lng) return;
    if (i18nService.isLocale(lng)) {
      i18nService.changeLocale(lng);

      // redirectToLocalPage(lng);

      return;
    }

    const currentLocale = i18nService.getLocale();
    i18nService.changeLocale(currentLocale);
    // redirectToLocalPage(currentLocale);
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
    </div>
  );
}
