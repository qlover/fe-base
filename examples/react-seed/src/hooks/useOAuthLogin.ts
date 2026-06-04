import { useCallback, useEffect, useState } from 'react';
import { SeedOAuthClient } from '@/impls/SeedOAuthClient';
import { useIOC } from './useIOC';
import { useLocale } from './useLocale';

export function useOAuthLogin() {
  const { locale } = useLocale();
  const oauthClient = useIOC(SeedOAuthClient);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    oauthClient.patchConfig({ locale });
  }, [locale, oauthClient]);

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
