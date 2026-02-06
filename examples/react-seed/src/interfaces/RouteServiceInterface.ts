import type { RouteConfigValue } from './RouteLoaderInterface';
import type { routePathLocaleParamKey } from '@config/react-seed';
import type {
  AsyncStoreStateInterface,
  AsyncStoreInterface
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
   * from app.router.json
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
   * 目前和 app.router.ts 中的 :lng 对应
   *
   * @example /en/home => lng='en'
   */
  [routePathLocaleParamKey]?: string;
};

export type RouteServiceState = AsyncStoreStateInterface<RouteConfigValue[]>;

export interface RouteServiceInterface {
  getStore(): AsyncStoreInterface<RouteServiceState>;
  getRoutes(): RouteConfigValue[];
}
