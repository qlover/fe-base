import { i18nConfig, I18nLocale } from '@config/app.common';
import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

function useLanguageGuard() {
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

export default function BasicLayout() {
  useLanguageGuard();

  return (
    <div data-testid="basic-layout" className="text-base">
      <Outlet />
    </div>
  );
}
