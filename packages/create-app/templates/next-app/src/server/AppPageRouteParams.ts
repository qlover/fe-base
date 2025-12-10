import { notFound } from 'next/navigation';
import { getMessages, getTranslations } from 'next-intl/server';
import { TranslateI18nInterface } from '@/base/cases/TranslateI18nInterface';
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

  public async getI18nMessages(): Promise<Record<string, string>> {
    const locale = this.getLocale();

    const messages = await getMessages({ locale });

    return messages;
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
