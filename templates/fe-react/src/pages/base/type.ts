import { TFunction } from 'i18next';
import { UseTranslationResponse } from 'react-i18next';

export interface BasePageProvider {
  pageProps: RoutePageProps;
  i18n: UseTranslationResponse<string, string>;
  t: TFunction<string, string>;
}
export interface RoutePageProps {
  /**
   * from app.router.json
   */
  title?: string;
  icon?: string;
  /**
   * from app.router.json
   */
  localNamespace?: string;
}
