import { i18nConfig } from '@config/i18n';
import { pageOAuthCallbackI18n } from '@config/i18n-mapping/page.oauth-callback';
import { routerPrefix } from '@config/seed.config';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LocaleLink } from '@/components/LocaleLink';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { SeedOAuthClient } from '@/impls/SeedOAuthClient';
import { UserService } from '@/impls/UserService';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';
import type { OAuthLoginResult } from '@/impls/SeedOAuthClient';
import type { UserSchema } from '@/interfaces/schema/UserSchema';

/** Survives StrictMode remounts and router rebuilds for the same authorization code. */
const completedOAuthCallbacks = new Set<string>();

function buildCallbackKey(search: URLSearchParams): string {
  const code = search.get('code');
  const state = search.get('state');
  if (code && state) {
    return `${code}:${state}`;
  }
  return search.toString();
}

function buildLocaleHomePath(locale: string): string {
  const prefix = routerPrefix.replace(/\/$/, '');
  const segments = [prefix, locale].filter(Boolean);
  return `/${segments.join('/')}`.replace(/\/+/g, '/');
}

export default function OAuthCallbackPage(_props: RouterRenderProps) {
  const text = useI18nMapping(pageOAuthCallbackI18n);
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? i18nConfig.defaultLocale;
  const oauthClient = useIOC(SeedOAuthClient);
  const [searchParams] = useSearchParams();
  const userService = useIOC(UserService as never) as UserService;
  const [error, setError] = useState<string | null>(null);
  const callbackQuery = searchParams.toString();
  const homePath = buildLocaleHomePath(locale);

  useEffect(() => {
    if (!callbackQuery) {
      return;
    }

    const search = new URLSearchParams(callbackQuery);
    const callbackKey = buildCallbackKey(search);

    if (completedOAuthCallbacks.has(callbackKey)) {
      globalThis.location.replace(homePath);
      return;
    }

    (async () => {
      try {
        const params = oauthClient.parseOAuthCallbackSearchParams(search);
        const result = (await oauthClient.completeOAuthCallback(
          params
        )) as unknown as OAuthLoginResult;

        if (completedOAuthCallbacks.has(callbackKey)) {
          globalThis.location.replace(homePath);
          return;
        }
        completedOAuthCallbacks.add(callbackKey);

        userService
          .getStore()
          .success(result.user as UserSchema, result.credential);
        globalThis.location.replace(homePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : text.errorGeneric);
      }
    })();
  }, [callbackQuery, homePath, oauthClient, text.errorGeneric, userService]);

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
