export interface I18nInterface<Locale> {
  t(key: string): string;

  changeLocale(locale: Locale): void;

  getLocale(): Locale;

  isLocale(locale: unknown): locale is Locale;
}
