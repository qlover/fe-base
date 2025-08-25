'use server';
import { PageI18nInterface } from '@config/i18n/PageI18nInterface';
import { getTranslations } from 'next-intl/server';

export async function useServerI18n<T extends PageI18nInterface>(params: {
  locale: string;
  namespace?: string;
  i18nInterface: T;
}): Promise<T> {
  // Load translation messages from the HomePage namespace
  const t = await getTranslations({
    locale: params.locale,
    namespace: params.namespace
  });

  const result = Object.fromEntries(
    Object.entries(params.i18nInterface).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, t(value)];
      }
      return [key, value];
    })
  ) as T;

  return result;
}
