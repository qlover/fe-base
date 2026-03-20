/**
 * Static (no cookies/headers) helpers for App Router page params.
 * Use in layout and pages that should be statically generated.
 */
import { getMessages, getTranslations } from 'next-intl/server';
import { filterMessagesByNamespace } from '@/i18n/loadMessages';
import { TranslateI18nUtil } from '@/impls/TranslateI18nUtil';
import { i18nConfig } from '@config/i18n';
import type { PageI18nInterface } from '@config/i18n-mapping/PageI18nInterface';

export interface PageParamsType {
  locale?: string;
}

export function getLocale(
  params: PageParamsType,
  defaultLocale?: string
): string {
  return (params.locale || defaultLocale || i18nConfig.fallbackLng) as string;
}

export async function getI18nMessages(
  locale: string,
  namespace?: string | string[]
): Promise<Record<string, string>> {
  const messages = await getMessages({ locale });
  const defaultNamespaces = [...i18nConfig.defaultNamespaces];
  const userNamespaces = namespace
    ? Array.isArray(namespace)
      ? namespace
      : [namespace]
    : [];
  const namespaces = [...new Set([...defaultNamespaces, ...userNamespaces])];
  return filterMessagesByNamespace(messages, namespaces);
}

export async function getI18nInterface<T extends PageI18nInterface>(
  locale: string,
  i18nInterface: T,
  _namespace?: string
): Promise<T> {
  const t = await getTranslations({ locale });
  return TranslateI18nUtil.translate<T>(
    i18nInterface,
    TranslateI18nUtil.overrideTranslateT(t)
  );
}
