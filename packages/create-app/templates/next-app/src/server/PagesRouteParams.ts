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
 * 用于 src/pages\/** 路由的参数管理工具
 */
export class PagesRouteParams implements RouteParamsnHandlerInterface {
  private locale: string | null;

  constructor(protected readonly params: PageParamsType) {
    this.locale = this.params.locale || i18nConfig.fallbackLng;
  }
  getLocale(defaultLocale?: string): string {
    throw new Error('Method not implemented.');
  }
  getI18nWithNotFound(): string {
    throw new Error('Method not implemented.');
  }
  getI18nMessages(): Promise<Record<string, string>> {
    throw new Error('Method not implemented.');
  }
  getI18nInterface<T extends PageI18nInterface>(
    i18nInterface: T,
    namespace?: string
  ): Promise<T> {
    throw new Error('Method not implemented.');
  }
}
