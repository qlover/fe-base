import { pageOAuthCallbackI18n } from '@config/i18n-mapping/page.oauth-callback';
import { i18nConfig } from '@config/i18n';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LocaleLink } from '@/components/LocaleLink';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';
import { completeOAuthCallback, parseOAuthCallbackSearchParams } from '@/oauth';
import type { UserSchema } from '@/interfaces/schema/UserSchema';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';

export default function OAuthCallbackPage(_props: RouterRenderProps) {
  const text = useI18nMapping(pageOAuthCallbackI18n);
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? i18nConfig.defaultLocale;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userService = useIOC(UserService as never) as UserService;
  const routeService = useIOC(RouteService);
  const [error, setError] = useState<string | null>(null);
  const callbackQuery = searchParams.toString();

  useEffect(() => {
    if (!callbackQuery) {
      return;
    }

    let cancelled = false;
    const search = new URLSearchParams(callbackQuery);

    (async () => {
      try {
        const params = parseOAuthCallbackSearchParams(search);
        const { user, credential } = await completeOAuthCallback(params, locale);
        if (cancelled) {
          return;
        }
        userService.getStore().success(user as UserSchema, credential);
        routeService.useMainRoutes();
        navigate(`/${locale}`, { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : text.errorGeneric);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    callbackQuery,
    locale,
    navigate,
    routeService,
    text.errorGeneric,
    userService
  ]);

  if (error) {
    return (
      <div
        data-testid="OAuthCallbackPage"
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4"
      >
        <p role="alert" className="text-red-500 max-w-md text-center text-sm">
          {error}
        </p>
        <LocaleLink
          href="/"
          className="text-brand text-sm font-medium hover:underline"
        >
          {text.backHome}
        </LocaleLink>
      </div>
    );
  }

  return (
    <div
      data-testid="OAuthCallbackPage"
      className="flex min-h-screen flex-col items-center justify-center gap-2 px-4"
    >
      <p className="text-secondary-text text-sm">{text.processing}</p>
    </div>
  );
}
