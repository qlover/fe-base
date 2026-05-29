import { i18nConfig } from '@config/i18n';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isOAuthConfigured, startOAuthLogin } from '@/oauth';

export function useOAuthLogin() {
  const { lng } = useParams<{ lng?: string }>();
  const locale = lng ?? i18nConfig.defaultLocale;
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const startLogin = useCallback(async () => {
    setStartError(null);
    if (!isOAuthConfigured()) {
      setStartError('OAuth is not configured');
      return;
    }

    setIsStarting(true);
    try {
      await startOAuthLogin(locale);
    } catch (err) {
      setIsStarting(false);
      setStartError(err instanceof Error ? err.message : 'OAuth login failed');
    }
  }, [locale]);

  return {
    startLogin,
    isStarting,
    startError,
    isConfigured: isOAuthConfigured()
  };
}
