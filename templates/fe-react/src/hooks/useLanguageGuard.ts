import { i18nConfig, I18nLocale } from '@config/app.common';
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
  const { lng } = useParams<{ lng: I18nLocale }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lng) {
      navigate('/404', { replace: true });
    } else if (!i18nConfig.supportedLngs.includes(lng)) {
      navigate('/404', { replace: true });
    }
  }, [lng, navigate]);
}
