import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import type { PageI18nInterface } from '@config/i18n-mapping/PageI18nInterface';
import { themeConfig } from '@config/theme';
import { getI18nInterface, getI18nMessages } from './pageRouteParams';
import type { RouteParamsnHandlerInterface } from './interfaces/RouteParamsnHandlerInterface';

export interface PageWithParams {
  params?: Promise<PageParamsType>;
}

export interface PageParamsType {
  locale?: string;
}

/**
 * 用于 src/app/page 路由的参数管理工具
 */
export class AppPageRouteParams<
  T extends PageParamsType
> implements RouteParamsnHandlerInterface {
  private locale: string | null;

  constructor(protected readonly params: T) {
    this.locale = this.params.locale || i18nConfig.fallbackLng;
  }

  /**
   * @override
   */
  public getLocale(defaultLocale?: string): string {
    if (this.locale) {
      return this.locale;
    }

    this.locale = this.params.locale || defaultLocale || i18nConfig.fallbackLng;

    return this.locale;
  }

  /**
   * @override
   */
  public getI18nWithNotFound(): string {
    const locale = this.getLocale();

    if (!i18nConfig.supportedLngs.includes(locale as LocaleType)) {
      notFound();
    }

    return locale;
  }

  /**
   * 获取 i18n 消息
   * 使用 next-intl 的 getMessages 加载消息
   *
   * @override
   * @param namespace - 可选的命名空间（单个字符串或字符串数组），会与默认命名空间 ['common', 'api'] 合并
   * @returns Promise<Record<string, string>> 返回翻译消息对象
   */
  public async getI18nMessages(
    namespace?: string | string[]
  ): Promise<Record<string, string>> {
    const locale = this.getLocale();
    return await getI18nMessages(locale, namespace);
  }

  /**
   * @override
   */
  public async getI18nInterface<T extends PageI18nInterface>(
    i18nInterface: T,
    _namespace?: string
  ): Promise<T> {
    const locale = this.getLocale();
    return await getI18nInterface(locale, i18nInterface, _namespace);
  }

  /**
   * @override
   */
  public async getTheme(): Promise<string> {
    const cookieStore = await cookies();
    return (
      cookieStore.get(themeConfig.storageKey)?.value ||
      themeConfig.supportedThemes[0]
    );
  }
}
