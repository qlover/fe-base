import { LazyExoticComponent, PropsWithChildren } from 'react';
import { RouteObject } from 'react-router-dom';

import { TFunction } from 'i18next';
import { UseTranslationResponse } from 'react-i18next';

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

export type RouteType = RouteObject & {
  meta?: RouteMeta;
};

export type RouteConfig = {
  routes: RouteType[];
};

export type PagesMaps = Record<
  string,
  () => LazyExoticComponent<React.ComponentType<unknown>>
>;

export type LoadProps = {
  pagesMaps: PagesMaps;
  componentPath: string;
  route: RouteType;
  Provider?: React.ComponentType<PropsWithChildren<RouteMeta>>;
};
