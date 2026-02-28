import type { redirect } from '@/i18n/routing';
export type RouterPathname = Parameters<typeof redirect>[0]['href'];

export interface RouterInterface {
  gotoHome(): void;
  goto(href: RouterPathname): void;

  getLocale(): string;

  setLocale(locale: string): void;
}
