import type { PageI18nInterface } from '@config/i18n';

/**
 * 用于处理页面渲染的路由参数处理接口
 */
export interface RouteParamsnHandlerInterface {
  getLocale(defaultLocale?: string): string;
  getI18nWithNotFound(): string;
  getI18nMessages(
    namespace?: string | string[]
  ): Promise<Record<string, string>>;
  getI18nInterface<T extends PageI18nInterface>(
    i18nInterface: T,
    namespace?: string
  ): Promise<T>;

  getTheme(): string | Promise<string>;
}
