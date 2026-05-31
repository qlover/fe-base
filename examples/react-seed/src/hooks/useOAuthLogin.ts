import { useCallback, useState } from 'react';
import { SeedOAuthClient } from '@/impls/SeedOAuthClient';
import { useIOC } from './useIOC';

export function useOAuthLogin() {
  // TODO: 使用可变的locale
  // const { lng } = useParams<{ lng?: string }>();
  // const locale = lng ?? i18nConfig.defaultLocale;
  const oauthClient = useIOC(SeedOAuthClient);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const startLogin = useCallback(async () => {
    setStartError(null);
    if (!oauthClient.isConfigured()) {
      setStartError('OAuth is not configured');
      return;
    }

    setIsStarting(true);
    try {
      await oauthClient.startOAuthLogin();
    } catch (err) {
      setIsStarting(false);
      setStartError(err instanceof Error ? err.message : 'OAuth login failed');
    }
  }, [oauthClient]);

  return {
    startLogin,
    isStarting,
    startError,
    isConfigured: oauthClient.isConfigured()
  };
}
