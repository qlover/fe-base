import {
  AUTH_LOGOUT_DIALOG_CONTENT,
  AUTH_LOGOUT_DIALOG_TITLE
} from '@config/i18n-identifier/common';
import { pageHomeI18n } from '@config/i18n-mapping/page.home';
import { useCallback, useState } from 'react';
import { LocaleLink } from '@/components/LocaleLink';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { useTranslation } from '@/hooks/useTranslation';
import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';

export default function HomePage() {
  const { t } = useTranslation();
  const text = useI18nMapping(pageHomeI18n);
  const userService = useIOC(UserService as never) as UserService;
  const routeService = useIOC(RouteService);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (!window.confirm(t(AUTH_LOGOUT_DIALOG_CONTENT))) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await userService.logout();
      routeService.useAuthRoutes();
    } finally {
      setIsLoggingOut(false);
    }
  }, [t, userService, routeService]);

  return (
    <div
      data-testid="HomePage"
      className="min-h-[50vh] bg-primary py-8 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-primary-text text-3xl font-bold tracking-tight">
          {text.welcomeTitle}
        </h1>
        <p className="text-secondary-text text-base leading-relaxed">
          {text.introDescription}
        </p>
        <nav className="mt-6 flex flex-wrap gap-3">
          <LocaleLink
            href="/"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            {text.linkHome}
          </LocaleLink>
          <LocaleLink
            href="/404"
            className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary"
          >
            {text.link404}
          </LocaleLink>
          <LocaleLink
            href="/500"
            className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary"
          >
            {text.link500}
          </LocaleLink>
          <LocaleLink
            href="/"
            locale="en"
            className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary"
          >
            {text.linkEn}
          </LocaleLink>
          <LocaleLink
            href="/"
            locale="zh"
            className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary"
          >
            {text.linkZh}
          </LocaleLink>
          <button
            type="button"
            data-testid="logout-button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="rounded-md border border-red-500/40 bg-elevated px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t(AUTH_LOGOUT_DIALOG_TITLE)}
          </button>
        </nav>
      </div>
    </div>
  );
}
