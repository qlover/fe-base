/**
 * Client-side navigation facade. `href` is a plain string so apps can use
 * typed next-intl pathnames without coupling the kit to app routing.
 */
export interface RouterInterface {
  gotoHome(): void;
  goto(href: string): void;
  getLocale(): string;
  setLocale(locale: string): void;
}
