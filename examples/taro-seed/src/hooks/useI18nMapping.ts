import { useMemo } from 'react';
import { translateWithMapping } from '@/utils/i18nUtil';
import { useTranslation } from './useTranslation';
import type { I18nMappingInterface } from '@interfaces/I18nMappingInterface';

/**
 * 获取一个 i18n 快捷映射对象, 简化 useTranslation
 *
 * @param mapping
 * @returns
 */
export function useI18nMapping<T extends I18nMappingInterface>(mapping: T): T {
  const { t } = useTranslation();
  return useMemo(() => translateWithMapping(t, mapping), [t, mapping]);
}
