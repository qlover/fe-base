import {
  AUTH_LOGOUT_DIALOG_CONTENT,
  AUTH_LOGOUT_DIALOG_TITLE,
  COMMON_CANCEL
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
      routeService.useAuthRoutes();
      setLogoutDialogOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  }, [userService, routeService]);

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
            onClick={() => setLogoutDialogOpen(true)}
            className="rounded-md border border-red-500/40 bg-elevated px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t(AUTH_LOGOUT_DIALOG_TITLE)}
          </button>
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
