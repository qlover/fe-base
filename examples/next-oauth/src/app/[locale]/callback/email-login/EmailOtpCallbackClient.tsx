'use client';

/**
 * Email OTP / Magic Link callback page (legacy + fallback).
 *
 * New magic links redirect to GET /api/callback/email-login?code=... (PKCE).
 * This page still handles:
 *   - ?code=... (PKCE, if emailRedirectTo still points here)
 *   - #access_token=... (implicit / older emails)
 */

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@shared/supabase/client';
import type { EmailOtpCallbackI18nInterface } from '@config/i18n-mapping/emailOtpCallbackI18n';
import {
  API_CALLBACK_EMAIL_LOGIN,
  ROUTE_DEVELOPER_APPS,
  ROUTE_LOGIN
} from '@config/route';
import type { Session } from '@supabase/supabase-js';

type CallbackStatus = 'authenticating' | 'establishing' | 'error';

interface EmailOtpCallbackClientProps {
  tt: EmailOtpCallbackI18nInterface;
}

async function establishAppSession(session: Session): Promise<boolean> {
  const establishRes = await fetch(API_CALLBACK_EMAIL_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: String(session.expires_in ?? 3600),
      token_type: session.token_type ?? 'bearer'
    })
  });
  return establishRes.ok;
}

export function EmailOtpCallbackClient({ tt }: EmailOtpCallbackClientProps) {
  const router = useRouter();
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
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);

      const error = search.get('error') ?? hashParams.get('error');
      if (error) {
        await failToLogin(
          `Supabase magic link error: ${error} ${search.get('error_description') ?? hashParams.get('error_description') ?? ''}`
        );
        return;
      }

      try {
        const supabase = createClient();
        let session: Session | null = null;

        // PKCE: ?code=...
        const code = search.get('code');
        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError || !data.session) {
            await failToLogin(
              `exchangeCodeForSession failed: ${exchangeError?.message ?? 'no session'}`
            );
            return;
          }
          session = data.session;
        } else {
          // Implicit (legacy): #access_token=...&refresh_token=...
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (!accessToken || !refreshToken) {
            await failToLogin(
              'Missing code or hash tokens in email callback URL'
            );
            return;
          }

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (sessionError || !data.session) {
            await failToLogin(
              `setSession failed: ${sessionError?.message ?? 'no session'}`
            );
            return;
          }
          session = data.session;
        }

        if (cancelled) return;
        setStatus('establishing');

        const ok = await establishAppSession(session);
        if (!ok) {
          await failToLogin('Failed to establish app session');
          return;
        }

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
  }, [router]);

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
