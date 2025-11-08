import type { TFunction } from 'i18next';
import type { UseTranslationResponse } from 'react-i18next';

export interface BasePageProvider<T extends Record<string, string>> {
  meta: Omit<RouteMeta, 'i18nInterface'> & {
    i18nInterface?: T;
  };
  i18n: UseTranslationResponse<string, string>;
  t: TFunction<string, string>;
  /**
   * 已经翻译后的 i18n interface
   */
  i18nInterface: T;
  tt: T;
}

type RouteCategory = 'main' | 'auth' | 'common';

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

  category?: RouteCategory;
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
