import {
  HOME_DESCRIPTION,
  HOME_LINK_404,
  HOME_LINK_500,
  HOME_LINK_EN,
  HOME_LINK_HOME,
  HOME_LINK_ZH,
  HOME_WELCOME_TITLE
} from '@config/i18n-identifier/common';
import { LocaleLink } from '@/components/LocaleLink';
import { useTranslation } from '@/hooks/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div
      data-testid="HomePage"
      className="min-h-[50vh] bg-primary py-8 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-primary-text text-3xl font-bold tracking-tight">
          {t(HOME_WELCOME_TITLE)}
        </h1>
        <p className="text-secondary-text text-base leading-relaxed">
          {t(HOME_DESCRIPTION)}
        </p>
        <nav className="mt-6 flex flex-wrap gap-3">
          <LocaleLink
            href="/"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            {t(HOME_LINK_HOME)}
          </LocaleLink>
          <LocaleLink
            href="/404"
            className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary"
          >
            {t(HOME_LINK_404)}
          </LocaleLink>
          <LocaleLink
            href="/500"
            className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary"
          >
            {t(HOME_LINK_500)}
          </LocaleLink>
          <LocaleLink
            href="/"
            locale="en"
            className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary"
          >
            {t(HOME_LINK_EN)}
          </LocaleLink>
          <LocaleLink
            href="/"
            locale="zh"
            className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary"
          >
            {t(HOME_LINK_ZH)}
          </LocaleLink>
        </nav>
      </div>
    </div>
  );
}
