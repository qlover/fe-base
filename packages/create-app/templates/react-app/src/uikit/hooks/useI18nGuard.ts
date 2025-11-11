import { IOCIdentifier } from '@config/IOCIdentifier';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { LocaleType } from '@config/i18n/i18nConfig';
import { useIOC } from './useIOC';

/**
 * Language Guard
 *
 * if language not found, redirect to 404 page
 *
 * TODO: if language not found, use default language
 */
export function useI18nGuard() {
  const { lng } = useParams<{ lng: LocaleType }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routeService = useIOC(IOCIdentifier.RouteServiceInterface);
  useEffect(() => {
    routeService.i18nGuard(pathname, lng as LocaleType, navigate);
  }, [lng, navigate, pathname]);
}
