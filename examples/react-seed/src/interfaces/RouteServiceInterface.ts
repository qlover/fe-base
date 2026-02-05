import type { RouteConfigValue } from './RouteLoaderInterface';
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

export interface RouteServiceState extends AsyncStoreStateInterface<
  RouteConfigValue[]
> {}

export interface RouteServiceInterface {
  getStore(): AsyncStoreInterface<RouteServiceState>;
  getRoutes(): RouteConfigValue[];
}
