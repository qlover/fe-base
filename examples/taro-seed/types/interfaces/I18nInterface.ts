export interface I18nInterface<Locale> {
  t(key: string, options?: Record<string, unknown>): string;

  changeLocale(locale: Locale): Promise<void>;

  getLocale(): Locale;

  isLocale(locale: unknown): locale is Locale;
}
