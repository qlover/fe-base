import { IOCIdentifier } from '@config/IOCIdentifier';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { I18nServiceLocale } from '@/base/services/I18nService';
import { useIOC } from './useIOC';

/**
 * Language Guard
 *
 * if language not found, redirect to 404 page
 *
 * TODO: if language not found, use default language
 */
export function useI18nGuard() {
  const { lng } = useParams<{ lng: I18nServiceLocale }>();
  const navigate = useNavigate();
  const routeService = useIOC(IOCIdentifier.RouteServiceInterface);
  useEffect(() => {
    routeService.i18nGuard(lng as I18nServiceLocale, navigate);
  }, [lng, navigate]);
}
