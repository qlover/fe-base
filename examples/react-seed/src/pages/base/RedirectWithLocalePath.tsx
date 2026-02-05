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
      navigate('/' + language, { replace: true });
    }
  }, [navigate, language]);

  // const routeService = useIOC(RouteService);
  // const loading = useStore(routeService.getStore(), (s) => s.loading);

  // useEffect(() => {
  //   if (!loading && usePathLocaleRoute) {
  //     navigate('/' + language, { replace: true });
  //   }
  // }, [navigate, language, loading]);

  // if (loading) {
  //   return <Loading data-testid="RedirectWithLocalePathLoading" fullscreen />;
  // }

  return null;
}
