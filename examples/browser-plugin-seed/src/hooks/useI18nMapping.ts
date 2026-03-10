import { translateWithMapping } from '@/utils/i18nUtil';
import type { I18nMappingInterface } from '@interfaces/I18nMappingInterface';
import { useMemo } from 'react';
import { useTranslation } from './useTranslation';

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
