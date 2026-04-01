import type { RouteConfigValue } from './RouteLoaderInterface';
import type { routePathLocaleParamKey } from '@config/seed.config';
import type {
  AsyncStoreStateInterface,
  AsyncStoreInterface,
  SliceStoreAdapter
} from '@qlover/corekit-bridge';

export interface RouteMeta {
  /**
   * The title of the route
   */
  title?: string;

  /**
   * The description of the route
   */
  description?: string;

  /**
   * The icon of the route
   */
  icon?: string;

  // category?: RouteCategory;
  /**
   * from router.json
   *
   * @default 'common'
   */
  localNamespace?: string;

  /**
   * The i18n interface of the route
   */
  i18nInterface?: Record<string, string>;
}

export type RouteParams = {
  /**
   * 来自路由地址的path 语言参数
   *
   * 目前和 router.ts 中的 :lng 对应
   *
   * @example /en/home => lng='en'
   */
  [routePathLocaleParamKey]?: string;
};

export type RouteServiceState = AsyncStoreStateInterface<RouteConfigValue[]>;

export interface RouteServiceInterface {
  getStore(): AsyncStoreInterface<RouteServiceState>;
  getUIStore(): SliceStoreAdapter<RouteServiceState>;
  getRoutes(): RouteConfigValue[];
}
