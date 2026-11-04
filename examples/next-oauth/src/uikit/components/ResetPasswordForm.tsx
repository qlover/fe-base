'use client';

import { ExecutorError } from '@qlover/fe-corekit/executor';
import { useStrictEffect } from '@qlover/next-kit/client';
import { isI18nKey } from '@qlover/next-kit/common';
import { clsx } from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { type FormEvent, useState } from 'react';
import { PasswordResetApi } from '@/impls/appApi/PasswordResetApi';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import type { ResetPasswordI18nInterface } from '@config/i18n-mapping/passwordReset18n';
import { ROUTE_AUTH_FORGOT_PASSWORD, ROUTE_LOGIN } from '@config/route';
import { isValidPassword } from '@schemas/ChangePasswordSchema';

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-bg-container px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

type TokenStateType = 'verifying' | 'valid' | 'invalid';

/**
 * 重置密码表单：读取 URL 中的 `token`，校验可用后收集新密码并提交。
 * 成功后展示「前往登录」；令牌缺失 / 失效展示「重新申请」。
 */
export function ResetPasswordForm({ tt }: { tt: ResetPasswordI18nInterface }) {
  const t = useWarnTranslations();
  const locale = useLocale();
  const passwordResetApi = useIOC(PasswordResetApi);
  const token = useSearchParams()?.get('token')?.trim() ?? '';

  const [tokenState, setTokenState] = useState<TokenStateType>(
    token ? 'verifying' : 'invalid'
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useStrictEffect(() => {
    if (!token) {
      return;
    }
    void passwordResetApi
      .verifyToken(token)
      .then((valid) => setTokenState(valid ? 'valid' : 'invalid'))
      .catch(() => setTokenState('invalid'));
  }, [token]);

  const passwordError =
    password && !isValidPassword(password) ? tt.invalid : null;
  const confirmError =
    confirmPassword && confirmPassword !== password ? tt.mismatch : null;
  const showPasswordError = touched ? passwordError : null;
  const canSubmit =
    !loading &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !passwordError &&
    !confirmError;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setTouched(true);
      return;
    }

    setSubmitError(null);
    setLoading(true);
    try {
      await passwordResetApi.resetPassword({
        token,
        newPassword: password,
        locale
      });
      setDone(true);
    } catch (error) {
      if (error instanceof ExecutorError && isI18nKey(error.id)) {
        setSubmitError(t(error.id));
      } else {
        setSubmitError(tt.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div data-testid="ResetPasswordDone" className="space-y-4">
        <h3 className="text-primary-text text-lg font-semibold">
          {tt.successTitle}
        </h3>
        <p className="text-secondary-text text-sm leading-relaxed">
          {tt.successMessage}
        </p>
        <LocaleLink
          href={ROUTE_LOGIN}
          title={tt.goLogin}
          className="text-brand text-sm font-medium hover:underline"
        >
          {tt.goLogin}
        </LocaleLink>
      </div>
    );
  }

  if (tokenState === 'verifying') {
    return (
      <p
        data-testid="ResetPasswordVerifying"
        className="text-secondary-text text-sm"
      >
        {tt.verifying}
      </p>
    );
  }

  if (tokenState === 'invalid') {
    return (
      <div data-testid="ResetPasswordTokenInvalid" className="space-y-4">
        <h3 className="text-primary-text text-lg font-semibold">
          {tt.tokenInvalidTitle}
        </h3>
        <p className="text-secondary-text text-sm leading-relaxed">
          {tt.tokenInvalidMessage}
        </p>
        <LocaleLink
          href={ROUTE_AUTH_FORGOT_PASSWORD}
          title={tt.requestNew}
          className="text-brand text-sm font-medium hover:underline"
        >
          {tt.requestNew}
        </LocaleLink>
      </div>
    );
  }

  return (
    <form
      data-testid="ResetPasswordForm"
      name="reset-password"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
      className="space-y-4"
    >
      {submitError ? (
        <div
          role="alert"
          className="text-red-500 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950/30"
        >
          {submitError}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <input
          type="password"
          name="new-password"
          autoComplete="new-password"
          maxLength={50}
          placeholder={tt.newPassword}
          value={password}
          disabled={loading}
          aria-invalid={Boolean(showPasswordError)}
          onChange={(event) => {
            setPassword(event.target.value);
            setSubmitError(null);
          }}
          onBlur={() => setTouched(true)}
          className={clsx(inputClass, showPasswordError && 'border-red-500')}
        />
        {showPasswordError ? (
          <p className="text-red-500 text-sm" role="alert">
            {showPasswordError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          maxLength={50}
          placeholder={tt.confirmPassword}
          value={confirmPassword}
          disabled={loading}
          aria-invalid={Boolean(confirmError)}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setSubmitError(null);
          }}
          className={clsx(inputClass, confirmError && 'border-red-500')}
        />
        {confirmError ? (
          <p className="text-red-500 text-sm" role="alert">
            {confirmError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
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
    </form>
  );
}
