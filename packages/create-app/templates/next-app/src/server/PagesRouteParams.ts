import { TranslateI18nInterface } from '@/base/cases/TranslateI18nInterface';
import { loadMessages } from '@/i18n/loadMessages';
import { i18nConfig } from '@config/i18n';
import type { LocaleType, PageI18nInterface } from '@config/i18n';
import { themeConfig } from '@config/theme';
import type { RouteParamsnHandlerInterface } from './port/RouteParamsnHandlerInterface';
import type { useTranslations } from 'next-intl';
import type { ParsedUrlQuery } from 'querystring';

export interface PagesRouteParamsType extends ParsedUrlQuery {
  locale?: string | string[];
}

/**
 * 用于 src/pages/** 路由的参数管理工具
 *
 * ⚠️ 注意：此类仅在服务器端使用（getStaticProps、getServerSideProps 中）
 * 此类直接从 JSON 文件加载翻译消息，不依赖 next-intl/server，因此可以在 pages 目录中安全使用
 *
 * @example
 * ```ts
 * export async function getStaticProps({ params }: GetStaticPropsContext<PagesRouteParamsType>) {
 *   const pageParams = new PagesRouteParams(params);
 *   const messages = await pageParams.getI18nMessages();
 *   return { props: { messages } };
 * }
 * ```
 */
export class PagesRouteParams implements RouteParamsnHandlerInterface {
  private locale: string | null;

  constructor(protected readonly params: PagesRouteParamsType = {}) {
    const localeParam = Array.isArray(this.params.locale)
      ? this.params.locale[0]
      : this.params.locale;
    this.locale = localeParam || i18nConfig.fallbackLng;
  }

  public getLocale(defaultLocale?: string): string {
    if (this.locale) {
      return this.locale;
    }

    const localeParam = Array.isArray(this.params.locale)
      ? this.params.locale[0]
      : this.params.locale;
    this.locale = localeParam || defaultLocale || i18nConfig.fallbackLng;

    return this.locale;
  }

  /**
   * 获取 locale，如果 locale 不支持则抛出错误
   * 注意：在 pages 目录中，应该在 getStaticProps/getServerSideProps 中返回 { notFound: true } 来处理不支持的 locale
   *
   * @returns 支持的 locale 字符串
   * @throws 如果 locale 不支持
   */
  public getI18nWithNotFound(): string {
    const locale = this.getLocale();

    if (!i18nConfig.supportedLngs.includes(locale as LocaleType)) {
      // 在 pages 目录中，应该返回 { notFound: true } 而不是调用 notFound()
      // 这里抛出错误，由调用方在 getStaticProps/getServerSideProps 中处理
      throw new Error(`Unsupported locale: ${locale}`);
    }

    return locale;
  }

  /**
   * 获取 i18n 消息
   * 使用公共方法加载消息，支持从 API 加载或动态导入 JSON 文件
   * 不依赖 next-intl/server，适用于 getStaticProps/getServerSideProps
   *
   * @param namespace - 可选的命名空间（单个字符串或字符串数组），会与默认命名空间 ['common', 'api'] 合并
   * @returns Promise<Record<string, string>> 返回翻译消息对象
   */
  public async getI18nMessages(
    namespace?: string | string[]
  ): Promise<Record<string, string>> {
    const locale = this.getLocale();
    // 将默认命名空间和用户提供的命名空间合并
    const defaultNamespaces = [...i18nConfig.defaultNamespaces];
    const userNamespaces = namespace
      ? Array.isArray(namespace)
        ? namespace
        : [namespace]
      : [];
    // 合并并去重
    const namespaces = [...new Set([...defaultNamespaces, ...userNamespaces])];
    return loadMessages(locale, namespaces);
  }

  /**
   * 获取翻译后的 i18n 接口
   * 创建一个简单的翻译函数，基于加载的 messages
   */
  public async getI18nInterface<T extends PageI18nInterface>(
    i18nInterface: T,
    namespace?: string
  ): Promise<T> {
    const messages = await this.getI18nMessages(namespace);

    // 创建一个简单的翻译函数
    const t = (
      key: string,
      params?: Record<string, string | number | Date>
    ) => {
      const fullKey = namespace ? `${namespace}:${key}` : key;

      let message = messages[fullKey] || messages[key] || key;

      // 简单的参数替换
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          message = message.replace(
            new RegExp(`\\{${paramKey}\\}`, 'g'),
            String(paramValue)
          );
        });
      }

      return message;
    };

    return TranslateI18nInterface.translate<T>(
      i18nInterface,
      t as ReturnType<typeof useTranslations>
    );
  }

  public getTheme(): string {
    return themeConfig.defaultTheme;
  }
}
