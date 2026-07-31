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
