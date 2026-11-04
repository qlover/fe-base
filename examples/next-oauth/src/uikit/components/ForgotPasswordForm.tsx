'use client';

import { ExecutorError } from '@qlover/fe-corekit/executor';
import { useStrictEffect } from '@qlover/next-kit/client';
import { isI18nKey } from '@qlover/next-kit/common';
import { clsx } from 'clsx';
import { useLocale } from 'next-intl';
import { type FormEvent, useState } from 'react';
import { PasswordResetApi } from '@/impls/appApi/PasswordResetApi';
import { fetchPublicConfig } from '@/impls/fetchPublicConfig';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import type { ForgotPasswordI18nInterface } from '@config/i18n-mapping/passwordReset18n';
import { ROUTE_LOGIN } from '@config/route';
import { forgotPasswordSchema } from '@schemas/PasswordResetSchema';

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-bg-container px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

/**
 * 忘记密码表单：只收集邮箱并申请重置邮件。
 * 无论邮箱是否注册，成功后都展示相同的「请查收邮件」提示。
 */
export function ForgotPasswordForm({
  tt
}: {
  tt: ForgotPasswordI18nInterface;
}) {
  const t = useWarnTranslations();
  const locale = useLocale();
  const passwordResetApi = useIOC(PasswordResetApi);

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useStrictEffect(() => {
    void fetchPublicConfig().then((config) => {
      setEnabled(config.auth.passwordResetEnabled);
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError(null);
    setSubmitError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(tt.emailInvalid);
      return;
    }

    setLoading(true);
    try {
      await passwordResetApi.requestReset(parsed.data.email, locale);
      setSent(true);
    } catch (error) {
      setSubmitError(
        error instanceof ExecutorError && isI18nKey(error.id)
          ? t(error.id)
          : tt.error
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div data-testid="ForgotPasswordSent" className="space-y-4">
        <h3 className="text-primary-text text-lg font-semibold">
          {tt.sentTitle}
        </h3>
        <p className="text-secondary-text text-sm leading-relaxed">
          {tt.sentMessage}
        </p>
        <LocaleLink
          href={ROUTE_LOGIN}
          title={tt.backToLogin}
          className="text-brand text-sm font-medium hover:underline"
        >
          {tt.backToLogin}
        </LocaleLink>
      </div>
    );
  }

  return (
    <form
      data-testid="ForgotPasswordForm"
      name="forgot-password"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
      className="space-y-4"
    >
      {!enabled ? (
        <div
          role="alert"
          className="rounded-xl border border-primary-border bg-elevated px-4 py-3 text-sm text-secondary-text"
        >
          {tt.unavailable}
        </div>
      ) : null}

      {submitError ? (
        <div
          role="alert"
          className="text-red-500 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950/30"
        >
          {submitError}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="forgot-password-email"
          className="text-primary-text mb-1.5 block text-sm font-medium"
        >
          {tt.email}
        </label>
        <input
          id="forgot-password-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder={tt.email}
          value={email}
          disabled={loading || !enabled}
          aria-invalid={Boolean(fieldError)}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldError(null);
          }}
          className={clsx(inputClass, fieldError && 'border-red-500')}
        />
        {fieldError ? (
          <p className="text-red-500 mt-1 text-sm" role="alert">
            {fieldError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={loading || !enabled || !email.trim()}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand shadow-sm transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-brand"
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {tt.submit}
          </span>
        ) : (
          tt.submit
        )}
      </button>

      <p className="text-center text-sm">
        <LocaleLink
          href={ROUTE_LOGIN}
          title={tt.backToLogin}
          className="text-brand font-medium hover:underline"
        >
          {tt.backToLogin}
        </LocaleLink>
      </p>
    </form>
  );
}
