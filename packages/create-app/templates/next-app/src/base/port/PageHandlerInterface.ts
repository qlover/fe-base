import type { PageI18nInterface } from '@config/i18n';

export interface PageHandlerInterface {
  getLocale(defaultLocale?: string): string;
  getI18nWithNotFound(): string;
  getI18nMessages(): Promise<Record<string, string>>;
  getI18nInterface<T extends PageI18nInterface>(
    i18nInterface: T,
    namespace?: string
  ): Promise<T>;
}
