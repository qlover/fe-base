import { usePathLocaleRoute } from '@config/seed.config';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/globals';

export default function RedirectWithLocalePath() {
  const navigate = useNavigate();
  const {
    i18n: { language }
  } = useTranslation();

  useEffect(() => {
    if (usePathLocaleRoute) {
      logger.log('RedirectWithLocalePath to locale', language);
      navigate('/' + language, { replace: true });
    }
  }, [navigate, language]);

  return null;
}
