import { I18nServiceLocale } from '@/base/services/I18nService';
import { RouteService } from '@/base/services/RouteService';
import { IOC } from '@/core/IOC';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

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

  useEffect(() => {
    IOC(RouteService).i18nGuard(lng as I18nServiceLocale, navigate);
  }, [lng, navigate]);
}
