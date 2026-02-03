import type { RouteObject } from 'react-router-dom';

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

export type RouteConfigValue = Omit<RouteObject, 'element' | 'children'> & {
  /**
   * Component identifier string that maps to a component in componentMaps
   *
   * TODO: support `ReactNode`
   *
   * @description Used to lookup the actual component implementation
   */
  element?: string;

  /**
   * Nested route configurations
   */
  children?: RouteConfigValue[];

  /**
   * Additional metadata for the route
   * @description Can store any route-specific data like permissions, titles, etc.
   */
  meta?: RouteMeta;
};

export interface RouteServiceInterface {
  getRoutes(): RouteConfigValue[];
}
