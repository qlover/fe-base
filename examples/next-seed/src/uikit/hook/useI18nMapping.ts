import {
  useI18nMapping as useKitI18nMapping,
  type TranslateI18nOptions
} from '@qlover/next-kit/client';
import { logger } from '@/impls/globals';
import { i18nWarnMissingTranslation } from '@config/common';

const defaultOptions: TranslateI18nOptions = {
  warnMissing: i18nWarnMissingTranslation,
  logger
};

export function useI18nMapping<T extends Record<string, string>>(
  i18nInterface: T,
  options?: TranslateI18nOptions
): T {
  return useKitI18nMapping(i18nInterface, {
    ...defaultOptions,
    ...options
  });
}
