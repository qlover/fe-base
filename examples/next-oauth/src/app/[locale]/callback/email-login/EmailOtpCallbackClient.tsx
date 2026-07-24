'use client';

/**
 * Email OTP / Magic Link callback — client UX only (no Supabase browser client).
 *
 * Reads ?code= from the magic-link URL, POSTs it to /api/callback/email-login,
 * then refreshes user info and navigates. Bootstrap skips /api/user/session
 * restore on this page so session is established before any session fetch.
 */

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import type { UserService } from '@/impls/UserService';
import { useIOC } from '@/uikit/hook/useIOC';
import type { EmailOtpCallbackI18nInterface } from '@config/i18n-mapping/emailOtpCallbackI18n';
import { I } from '@config/ioc-identifiter';
import {
  API_CALLBACK_EMAIL_LOGIN,
  ROUTE_DEVELOPER_APPS,
  ROUTE_LOGIN
} from '@config/route';

type CallbackStatus = 'authenticating' | 'establishing' | 'error';

interface EmailOtpCallbackClientProps {
  tt: EmailOtpCallbackI18nInterface;
}

export function EmailOtpCallbackClient({ tt }: EmailOtpCallbackClientProps) {
  const router = useRouter();
  const userService = useIOC(I.UserServiceInterface) as UserService;
  const [status, setStatus] = useState<CallbackStatus>('authenticating');

  const statusMessages: Record<CallbackStatus, string> = {
    authenticating: tt.authenticating,
    establishing: tt.establishing,
    error: tt.error
  };

  useEffect(() => {
    let cancelled = false;

    async function failToLogin(message?: string) {
      if (message) {
        console.error(message);
      }
      if (!cancelled) setStatus('error');
      router.replace(ROUTE_LOGIN);
    }

    async function handleCallback() {
      const search = new URLSearchParams(window.location.search);
      const error = search.get('error');
      if (error) {
        await failToLogin(
          `Supabase magic link error: ${error} ${search.get('error_description') ?? ''}`
        );
        return;
      }

      const code = search.get('code');
      if (!code) {
        await failToLogin('Missing PKCE code in email callback URL');
        return;
      }

      try {
        if (cancelled) return;
        setStatus('establishing');

        const res = await fetch(API_CALLBACK_EMAIL_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        if (!res.ok) {
          let message = 'Failed to establish app session';
          try {
            const data = (await res.json()) as { message?: string };
            if (data.message) message = data.message;
          } catch {
            // ignore parse errors
          }
          await failToLogin(message);
          return;
        }

        // Session cookie is set — now load user into the client store.
        await userService.refreshUser({ disabledDialogError: true });

        if (cancelled) return;
        router.replace(ROUTE_DEVELOPER_APPS);
      } catch (err) {
        console.error('Email OTP callback error:', err);
        if (!cancelled) setStatus('error');
        if (!cancelled) router.replace(ROUTE_LOGIN);
      }
    }

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [router, userService]);

  return (
    <div
      data-testid="EmailOtpCallbackClient"
      className="bg-primary flex w-full min-h-screen items-center justify-center font-sans p-4"
    >
      <div className="bg-bg-container border-primary-border w-full max-w-sm rounded-xl border p-8 text-center shadow-sm">
        <span className="border-primary-border text-brand mb-6 inline-flex items-center rounded-full border bg-primary-bg px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          OAuth 2.0
        </span>

        <div className="my-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-border border-t-brand" />
        </div>

        <p className="text-primary-text text-sm font-medium">
          {statusMessages[status]}
        </p>
        <p className="text-tertiary-text mt-2 text-xs">{tt.subtitle}</p>
      </div>
    </div>
  );
}
