import { usePathLocaleRoute } from '@config/react-seed';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function RedirectWithLocalePath() {
  const navigate = useNavigate();
  const {
    i18n: { language }
  } = useTranslation();

  useEffect(() => {
    if (usePathLocaleRoute) {
      console.log('RedirectWithLocalePath to locale', language);
      navigate('/' + language, { replace: true });
    }
  }, [navigate, language]);

  return null;
}
