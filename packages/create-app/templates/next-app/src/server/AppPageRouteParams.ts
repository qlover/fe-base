import { notFound } from 'next/navigation';
import { getMessages, getTranslations } from 'next-intl/server';
import { TranslateI18nInterface } from '@/base/cases/TranslateI18nInterface';
import { filterMessagesByNamespace } from '@/i18n/loadMessages';
import { i18nConfig } from '@config/i18n';
import type { LocaleType, PageI18nInterface } from '@config/i18n';
import type { RouteParamsnHandlerInterface } from './port/RouteParamsnHandlerInterface';

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

  public getLocale(defaultLocale?: string): string {
    if (this.locale) {
      return this.locale;
    }

    this.locale = this.params.locale || defaultLocale || i18nConfig.fallbackLng;

    return this.locale;
  }

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
   * @param namespace - 可选的命名空间（单个字符串或字符串数组），会与默认命名空间 ['common', 'api'] 合并
   * @returns Promise<Record<string, string>> 返回翻译消息对象
   */
  public async getI18nMessages(
    namespace?: string | string[]
  ): Promise<Record<string, string>> {
    const locale = this.getLocale();
    const messages = await getMessages({ locale });
    // 将默认命名空间和用户提供的命名空间合并
    const defaultNamespaces = [...i18nConfig.defaultNamespaces];
    const userNamespaces = namespace
      ? Array.isArray(namespace)
        ? namespace
        : [namespace]
      : [];
    // 合并并去重
    const namespaces = [...new Set([...defaultNamespaces, ...userNamespaces])];
    return filterMessagesByNamespace(messages, namespaces);
  }

  public async getI18nInterface<T extends PageI18nInterface>(
    i18nInterface: T,
    namespace?: string
  ): Promise<T> {
    // Load translation messages from the HomePage namespace
    const t = await getTranslations({
      locale: this.getLocale(),
      namespace: namespace
    });

    return TranslateI18nInterface.translate<T>(i18nInterface, t);
  }
}
