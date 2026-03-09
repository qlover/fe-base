import { useMemo } from 'react';
import { I } from '@/config/ioc-identifier';
import { useIOC } from '@/hooks/useIOC';
import { useStore } from '@/hooks/useStore';
import { I18nContext } from './i18nContext';
import type { I18nContextValue } from './i18nContext';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const i18nService = useIOC(I.I18nService);
  const locale = useStore(i18nService, (s) => s.locale);

  const value = useMemo<I18nContextValue>(
    () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        i18nService.t(key, options),
      i18n: { language: locale }
    }),
    [i18nService, locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
