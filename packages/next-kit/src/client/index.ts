/**
 * Client / `"use client"` layer.
 *
 * Rules:
 * - May import from `../common`
 * - Must NOT import from `../server`
 * - Keep free of Node-only modules (`fs`, `next/headers`, etc.)
 * - React components/hooks that need the browser belong here
 */

export { NEXT_KIT_COMMON } from '../common/markers';
export { NEXT_KIT_CLIENT } from './markers';

export { LocalStorage } from './LocalStorage';
export { NavigateBridge } from './NavigateBridge';
export { I18nService, type I18nServiceConfig } from './I18nService';
export {
  RouterService,
  type ClientRouterBridge,
  type RouterServiceOptions
} from './RouterService';
export {
  DialogHandler,
  type DialogHandlerOptions,
  type DialogConfirmHost
} from './DialogHandler';

export {
  Loading,
  LoadingSkeleton,
  PullDownRefresh,
  LoadMoreSentinel,
  With,
  Button,
  buttonClassName,
  Modal,
  DialogUIHost,
  LocaleLink,
  ClientRenderProvider,
  UserAuthFailed,
  Dropdown,
  Tooltip,
  PageI18nProvider,
  ClientSeo,
  headerIconButtonClass,
  headerNavLinkClass,
  headerNavLinkActiveClass,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  type ButtonClassNameOptions,
  type ModalProps,
  type DialogUIHostProps,
  type LocaleLinkProps,
  type LocaleLinkHref,
  type ClientRenderProviderProps,
  type UserAuthFailedProps,
  type DropdownProps,
  type DropdownItem,
  type DropdownPlacement,
  type TooltipProps,
  type TooltipPlacement
} from './components';

export {
  useStrictEffect,
  useMountedClient,
  useReturnTo,
  useStore,
  useSliceStoreAdapter,
  isSliceStoreAdapter,
  useWarnTranslations,
  useI18nMapping,
  usePageI18nMapping
} from './hooks';

export type {
  TranslateFn,
  TranslateI18nOptions
} from '../common/i18n';

export {
  createIOCReact,
  type CreateIOCReactResult
} from './ioc';

export { formatClientExecutorError } from './utils/formatClientExecutorError';

/** @deprecated Import from `@qlover/next-kit/common` — pure helper, not client-only. */
export {
  getPagesThemeInitScript,
  type PagesThemeInitOptions
} from '../common/utils/getPagesThemeInitScript';
