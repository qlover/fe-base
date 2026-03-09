import { createContext, useContext } from 'react';

export type TFunction = (
  key: string,
  options?: Record<string, unknown>
) => string;

export interface I18nContextValue {
  t: TFunction;
  i18n: { language: string };
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return ctx;
}
