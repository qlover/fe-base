'use client';

/**
 * ─── Email OTP Callback �?客户端交互逻辑 ───
 *
 * 此组件由 page.tsx（服务端组件）渲染，接收已解析的 i18n 翻译作为 props�? * 实际处理 Supabase magic link 回调�?hash fragment 逻辑在此执行�? */

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@shared/supabase/client';
import type { EmailOtpCallbackI18nInterface } from '@config/i18n-mapping/emailOtpCallbackI18n';
import {
  API_CALLBACK_EMAIL_LOGIN,
  ROUTE_HOME,
  ROUTE_LOGIN
} from '@config/route';

type CallbackStatus = 'authenticating' | 'establishing' | 'error';

interface EmailOtpCallbackClientProps {
  tt: EmailOtpCallbackI18nInterface;
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

    async function handleCallback() {
      // ── Step 0: �?URL hash fragment 中提取参�?──
      const hash = window.location.hash.substring(1);
      if (!hash) {
        router.replace(ROUTE_LOGIN);
        return;
      }

      const params = new URLSearchParams(hash);
      const error = params.get('error');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      // ── Supabase 返回错误（token 过期、无效等�?──
      if (error) {
        const desc = params.get('error_description');
        console.error('Supabase magic link error:', error, desc);
        router.replace(ROUTE_LOGIN);
        return;
      }

      // ── 必须同时�?access_token �?refresh_token ──
      if (!accessToken || !refreshToken) {
        router.replace(ROUTE_LOGIN);
        return;
      }

      try {
        // ── Step 1: 建立 Supabase session（写�?Supabase auth cookie�?──
        const supabase = createClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('Failed to set Supabase session:', sessionError);
          if (!cancelled) setStatus('error');
          router.replace(ROUTE_LOGIN);
          return;
        }

        if (cancelled) return;
        setStatus('establishing');

        // ── Step 2: 通知后端建立应用�?session（OAuth wrapper cookie�?──
        const establishRes = await fetch(API_CALLBACK_EMAIL_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: params.get('expires_in') ?? '3600',
            token_type: params.get('type') ?? 'bearer'
          })
        });

        if (!establishRes.ok) {
          console.error('Failed to establish app session');
          if (!cancelled) setStatus('error');
          router.replace(ROUTE_LOGIN);
          return;
        }

        if (cancelled) return;

        // ── Step 3: 登录成功，跳转到应用首页 ──
        router.replace(ROUTE_HOME);
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
      className="bg-primary flex min-h-screen items-center justify-center font-sans p-4"
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
