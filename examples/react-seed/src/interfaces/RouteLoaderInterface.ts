import type { ComponentType, ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';

export interface RouteConfigMeta {
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

/**
 * The path of the route
 *
 * 映射到 src/pages
 */
export type PgaePath = string;

export type RouteConfigElementType<T> = ReactNode | ComponentType<T>;

export type RouteConfigValue = Omit<RouteObject, 'element' | 'children'> & {
  /**
   * Component identifier string that maps to a component in componentMaps
   *
   * @description Used to lookup the actual component implementation
   */
  element?: PgaePath | RouteConfigElementType<unknown>;

  /**
   * Nested route configurations
   */
  children?: RouteConfigValue[];

  /**
   * Additional metadata for the route
   * @description Can store any route-specific data like permissions, titles, etc.
   */
  meta?: RouteConfigMeta;
};

export interface RouteLoaderInterface {
  toRoute(route: RouteConfigValue): RouteObject;
}
