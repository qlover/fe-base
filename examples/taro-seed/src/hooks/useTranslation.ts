import { useI18nContext } from '@/contexts/i18nContext';

/**
 * 轻量 i18n：从 I18nContext 获取 t 与当前语言
 */
export function useTranslation() {
  return useI18nContext();
}
