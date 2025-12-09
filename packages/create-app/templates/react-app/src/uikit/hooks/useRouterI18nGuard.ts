import { IOCIdentifier } from '@config/IOCIdentifier';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { LocaleType } from '@config/i18n/i18nConfig';
import { useIOC } from './useIOC';

/**
 * 国际化路由国际化守卫
 *
 * 比如: 开启了 `@config/common 中useLocaleRoutes` 为 `true` 时，
 *
 * 访问 `/login` 则会自动重定向到 `/en/login`, 其中 en 为默认语言可配置
 *
 * 或者访问一个不支持的语言，则会自动重定向到 `/en/404`
 *
 */
export function useRouterI18nGuard() {
  const { lng } = useParams<{ lng: LocaleType }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routeService = useIOC(IOCIdentifier.RouteServiceInterface);
  useEffect(() => {
    routeService.i18nGuard(pathname, lng as LocaleType, navigate);
  }, [lng, navigate, pathname]);
}
