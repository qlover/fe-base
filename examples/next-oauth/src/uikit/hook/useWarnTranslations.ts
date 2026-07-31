import {
  useWarnTranslations as useKitWarnTranslations,
  type TranslateI18nOptions
} from '@qlover/next-kit/client';
import { logger } from '@/impls/globals';
import { i18nWarnMissingTranslation } from '@config/common';

const defaultOptions: TranslateI18nOptions = {
  warnMissing: i18nWarnMissingTranslation,
  logger
};

export function useWarnTranslations(options?: TranslateI18nOptions) {
  return useKitWarnTranslations({ ...defaultOptions, ...options });
}
