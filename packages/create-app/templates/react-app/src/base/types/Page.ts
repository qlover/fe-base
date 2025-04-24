import type { TFunction } from 'i18next';
import type { UseTranslationResponse } from 'react-i18next';

export interface BasePageProvider {
  meta: RouteMeta;
  i18n: UseTranslationResponse<string, string>;
  t: TFunction<string, string>;
}

type RouteCategory = 'main' | 'auth' | 'common';

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
