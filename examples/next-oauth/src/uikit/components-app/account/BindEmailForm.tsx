'use client';

import { ExecutorError } from '@qlover/fe-corekit/executor';
import { isI18nKey, type TranslateFn } from '@qlover/next-kit/common';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { AppUserGateway } from '@/impls/AppUserGateway';
import { UserService } from '@/impls/UserService';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import { I } from '@config/ioc-identifiter';

const RESEND_COOLDOWN_SEC = 60;

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-bg-container px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

function resolveError(err: unknown, fallback: string, t: TranslateFn): string {
  if (err instanceof ExecutorError && isI18nKey(err.id)) {
    return t(err.id);
  }
  if (err instanceof Error) {
    if (isI18nKey(err.message)) {
      return t(err.message);
    }
    return err.message || fallback;
  }
  return fallback;
}

export type BindEmailFormLabelsType = {
  description: string;
  mergeHint: string;
  emailPlaceholder: string;
  otpPlaceholder: string;
  sendCode: string;
  resendCode: string;
  verify: string;
  successBound: string;
  successMerged: string;
  errorFallback: string;
};

/**
 * 手机号账户绑定邮箱：发码 → 校验；合并时刷新会话用户。
 */
export function BindEmailForm(props: {
  labels: BindEmailFormLabelsType;
  onSuccess?: () => void;
}) {
  const { labels, onSuccess } = props;
  const t = useWarnTranslations();
  const gateway = useIOC(AppUserGateway);
  const userService = useIOC(UserService);
  const dialog = useIOC(I.DialogHandler);

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCountingDown = countdown > 0;

  useEffect(() => {
    if (!isCountingDown) {
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCountingDown]);

  const onSend = async (event?: FormEvent): Promise<void> => {
    event?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await gateway.sendBindEmail({ email: email.trim() });
      setSent(true);
      setCountdown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(resolveError(err, labels.errorFallback, t));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await gateway.verifyBindEmail({
        email: email.trim(),
        token: token.trim()
      });
      userService.applySessionUser(result.user);
      dialog.success(
        result.merged ? labels.successMerged : labels.successBound
      );
      onSuccess?.();
    } catch (err) {
      setError(resolveError(err, labels.errorFallback, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      data-testid="BindEmailForm"
      className="flex flex-col gap-4"
      onSubmit={sent ? onVerify : onSend}
    >
      <p className="text-sm text-secondary-text">{labels.description}</p>
      <p className="text-xs text-secondary-text">{labels.mergeHint}</p>

      <input
        type="email"
        required
        value={email}
        disabled={loading || sent}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={labels.emailPlaceholder}
        className={inputClass}
        autoFocus
      />

      {sent ? (
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={token}
          disabled={loading}
          onChange={(e) => setToken(e.target.value)}
          placeholder={labels.otpPlaceholder}
          className={inputClass}
        />
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {sent ? (
          <button
            type="button"
            disabled={loading || countdown > 0}
            onClick={() => void onSend()}
            className="cursor-pointer rounded-xl border border-primary-border px-4 py-2.5 text-sm font-medium text-primary-text hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            {countdown > 0
              ? `${labels.resendCode} (${countdown})`
              : labels.resendCode}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sent ? labels.verify : labels.sendCode}
        </button>
      </div>
    </form>
  );
}
