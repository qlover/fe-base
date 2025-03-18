import type { LazyExoticComponent, PropsWithChildren } from 'react';
import type { TFunction } from 'i18next';
import type { UseTranslationResponse } from 'react-i18next';
import type { RouteConfigValue } from '@lib/router-loader/RouterLoader';

export interface BasePageProvider {
  meta: RouteMeta;
  i18n: UseTranslationResponse<string, string>;
  t: TFunction<string, string>;
}

export type RouteCategory = 'main' | 'auth' | 'common';

export interface RouteMeta {
  category?: RouteCategory;
  /**
   * from app.router.json
   */
  title?: string;
  icon?: string;
  /**
   * from app.router.json
   *
   * @default 'common'
   */
  localNamespace?: string;
}

export type RouteConfig = {
  routes: RouteConfigValue[];
};

export type PagesMaps = Record<
  string,
  | (() => LazyExoticComponent<React.ComponentType<unknown>>)
  | (() => React.ComponentType<unknown>)
>;
