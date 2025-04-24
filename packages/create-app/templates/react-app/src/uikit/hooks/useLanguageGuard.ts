import { I18nService, I18nServiceLocale } from '@/base/services/I18nService';
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
export function useLanguageGuard() {
  const { lng } = useParams<{ lng: I18nServiceLocale }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lng) {
      navigate('/404', { replace: true });
    } else if (!I18nService.isValidLanguage(lng)) {
      navigate('/404', { replace: true });
    }
  }, [lng, navigate]);
}
