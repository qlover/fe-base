import { useTranslations as useNextTranslations } from 'next-intl';
import { useMemo } from 'react';
import { TranslateI18nUtil } from '@/base/cases/TranslateI18nUtil';

export function useWarnTranslations() {
  const t = useNextTranslations();

  const overrideT = useMemo(() => TranslateI18nUtil.overrideTranslateT(t), [t]);

  return Object.assign(overrideT, t);
}
