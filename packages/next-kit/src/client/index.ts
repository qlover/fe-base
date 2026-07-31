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
  usePageI18nMapping,
  ClientSeo,
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
  useI18nMapping
} from './hooks';

export {
  createIOCReact,
  type CreateIOCReactResult
} from './ioc';

export {
  TranslateI18nUtil,
  type TranslateFn,
  type TranslateI18nOptions
} from './i18n';

export {
  getPagesThemeInitScript,
  type PagesThemeInitOptions
} from './utils/getPagesThemeInitScript';
