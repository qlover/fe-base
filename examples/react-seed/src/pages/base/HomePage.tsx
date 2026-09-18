import { useCallback, useState } from 'react';
import { authHeroMeshStyle } from '@/components/authStyles';
import { BrandLogo } from '@/components/BrandLogo';
import { LocaleLink } from '@/components/LocaleLink';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { useLocale } from '@/hooks/useLocale';
import { useTranslation } from '@/hooks/useTranslation';
import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';
import {
  AUTH_LOGOUT_DIALOG_CONTENT,
  AUTH_LOGOUT_DIALOG_TITLE,
  COMMON_CANCEL
} from '@config/i18n-identifier/common';
import { pageHomeI18n } from '@config/i18n-mapping/page.home';
import { usePathLocaleRoute } from '@config/seed.config';

export default function HomePage() {
  const { t } = useTranslation();
  const text = useI18nMapping(pageHomeI18n);
  const userService = useIOC(UserService as never) as UserService;
  const routeService = useIOC(RouteService);
  const { locale } = useLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const closeLogoutDialog = useCallback(() => {
    if (!isLoggingOut) {
      setLogoutDialogOpen(false);
    }
  }, [isLoggingOut]);

  const confirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await userService.logout();
      routeService.useAuthRoutes(
        usePathLocaleRoute ? `/${locale}/login` : '/login'
      );
      setLogoutDialogOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  }, [userService, routeService, locale]);

  return (
    <div
      data-testid="HomePage"
      className="relative min-h-screen overflow-hidden"
      style={authHeroMeshStyle}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(var(--fe-color-primary-text)) 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <BrandLogo sizeClassName="text-[2.5rem]" withWordmark />
          <button
            type="button"
            data-testid="logout-button"
            disabled={isLoggingOut}
            onClick={() => setLogoutDialogOpen(true)}
            className="rounded-lg border border-red-500/40 bg-secondary px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t(AUTH_LOGOUT_DIALOG_TITLE)}
          </button>
        </header>

        <section className="max-w-xl space-y-4">
          <p className="text-brand text-xs font-semibold tracking-[0.14em] uppercase">
            {text.linkHome}
          </p>
          <h1 className="text-primary-text text-3xl font-semibold tracking-tight sm:text-4xl">
            {text.welcomeTitle}
          </h1>
          <p className="text-secondary-text text-base leading-relaxed">
            {text.introDescription}
          </p>
        </section>

        <nav className="mt-10 flex flex-wrap gap-3">
          <LocaleLink
            href="/"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover"
          >
            {text.linkHome}
          </LocaleLink>
          <LocaleLink
            href="/404"
            className="rounded-lg border border-primary-border bg-secondary px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-elevated"
          >
            {text.link404}
          </LocaleLink>
          <LocaleLink
            href="/500"
            className="rounded-lg border border-primary-border bg-secondary px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-elevated"
          >
            {text.link500}
          </LocaleLink>
          <LocaleLink
            href="/"
            locale="en"
            className="rounded-lg border border-primary-border bg-secondary px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-elevated"
          >
            {text.linkEn}
          </LocaleLink>
          <LocaleLink
            href="/"
            locale="zh"
            className="rounded-lg border border-primary-border bg-secondary px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-elevated"
          >
            {text.linkZh}
          </LocaleLink>
        </nav>
      </div>

      {logoutDialogOpen && (
        <div
          data-testid="logout-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-content"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label={t(COMMON_CANCEL)}
            tabIndex={-1}
            disabled={isLoggingOut}
            onClick={closeLogoutDialog}
          />
          <div className="relative w-full max-w-sm rounded-xl border border-primary-border bg-primary shadow-xl">
            <div className="border-b border-primary-border px-5 py-4">
              <h2
                id="logout-dialog-title"
                className="text-lg font-semibold text-primary-text"
              >
                {t(AUTH_LOGOUT_DIALOG_TITLE)}
              </h2>
            </div>
            <p
              id="logout-dialog-content"
              className="px-5 py-4 text-sm leading-relaxed text-secondary-text"
            >
              {t(AUTH_LOGOUT_DIALOG_CONTENT)}
            </p>
            <div className="flex justify-end gap-3 border-t border-primary-border px-5 py-4">
              <button
                type="button"
                data-testid="logout-dialog-cancel"
                disabled={isLoggingOut}
                onClick={closeLogoutDialog}
                className="rounded-md border border-primary-border bg-elevated px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(COMMON_CANCEL)}
              </button>
              <button
                type="button"
                data-testid="logout-dialog-confirm"
                disabled={isLoggingOut}
                onClick={() => void confirmLogout()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(AUTH_LOGOUT_DIALOG_TITLE)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
