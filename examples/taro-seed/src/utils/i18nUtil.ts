import { logger } from '@/globals';
import type { TFunction } from '@/contexts/i18nContext';
import type { I18nMappingInterface } from '@interfaces/I18nMappingInterface';

export function translateWithMapping<T extends I18nMappingInterface>(
  t: TFunction,
  mapping: T
): T {
  return Object.fromEntries(
    Object.entries(mapping).map(([key, value]) => {
      if (typeof value === 'string') {
        const result = t(value);
        if (result === value) {
          logger.warn(`[i18n] Missing translation: ${value}`);
        }
        return [key, result];
      }
      return [key, value];
    })
  ) as T;
}
