export { useStrictEffect } from './useStrictEffect';
export { useMountedClient } from './useMountedClient';
export { useReturnTo } from './useReturnTo';
export { useWarnTranslations } from './useWarnTranslations';
export { useI18nMapping } from './useI18nMapping';
export { usePageI18nMapping } from './usePageI18nMapping';
export {
  useNavigationGuard,
  NAVIGATION_GUARD_DECISION,
  type NavigationGuardCopyType,
  type NavigationGuardDecisionType,
  type NavigationGuardOptionsType,
  type UseNavigationGuardParamsType
} from './useNavigationGuard';
export {
  NAVIGATION_GUARD_STATE_KEY,
  isModifiedAnchorClick,
  resolveGuardedAnchor,
  isGuardHistoryState,
  withGuardHistoryState
} from './NavigationGuardUtil';
