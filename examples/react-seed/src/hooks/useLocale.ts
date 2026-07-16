import { useCallback, useMemo, useTransition } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { I18nService } from '@/impls/I18nService';
import type { RouteParams } from '@/interfaces/RouteServiceInterface';
import { getLocaleRedirectTo } from '@/utils/getLocaleRedirectTo';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import {
  routePathLocaleParamKey,
  usePathLocaleRoute
} from '@config/seed.config';
import { useIOC } from './useIOC';

export function useLocale() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<RouteParams>();
  const i18nService = useIOC(I18nService);
  const [isPending, startTransition] = useTransition();

  const routeLocale = params[routePathLocaleParamKey];

  const locale = useMemo(() => {
    if (usePathLocaleRoute) {
      return routeLocale ?? i18nConfig.defaultLocale;
    }
    return i18nService.getLocale();
  }, [routeLocale, i18nService]);

  const onChangeLocale = useCallback(
    async (value: string) => {
      if (isPending || !i18nService.isLocale(value) || value === locale) {
        return;
      }

      startTransition(() => {
        if (usePathLocaleRoute) {
          const to = getLocaleRedirectTo(location.pathname, value, {
            search: location.search,
            hash: location.hash
          });
          navigate(to, { replace: true });
          return;
        }

        void i18nService.changeLocale(value as LocaleType);
      });
    },
    [
      isPending,
      locale,
      i18nService,
      location.pathname,
      location.search,
      location.hash,
      navigate
    ]
  );

  return { locale, onChangeLocale };
}
