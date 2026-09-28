'use client';

import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { ExecutorError } from '@qlover/fe-corekit/executor';
import { isI18nKey, type TranslateFn } from '@qlover/next-kit/common';
import { type FormEvent, useState } from 'react';
import { AppUserGateway } from '@/impls/AppUserGateway';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import { I } from '@config/ioc-identifiter';
import { isValidPassword } from '@schemas/ChangePasswordSchema';

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-bg-container px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

const inputErrorClass =
  'border-red-500 focus:border-red-500 focus:ring-red-500';

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

export type ChangePasswordFormLabels = {
  description: string;
  noPasswordHint: string;
  currentPlaceholder: string;
  newPlaceholder: string;
  confirmPlaceholder: string;
  submit: string;
  success: string;
  errorFallback: string;
  invalid: string;
  mismatch: string;
  same: string;
};

export function ChangePasswordForm(props: {
  labels: ChangePasswordFormLabels;
}) {
  const { labels } = props;
  const t = useWarnTranslations();
  const gateway = useIOC(AppUserGateway);
  const dialog = useIOC(I.DialogHandler);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ next: false, confirm: false });

  const newPasswordError = !newPassword
    ? null
    : !isValidPassword(newPassword)
      ? labels.invalid
      : newPassword === currentPassword
        ? labels.same
        : null;
  const confirmPasswordError =
    confirmPassword && confirmPassword !== newPassword ? labels.mismatch : null;

  // Wait for blur (or a full-length confirmation) so the error does not flash on the first keystroke.
  const showNewPasswordError = touched.next ? newPasswordError : null;
  const showConfirmPasswordError =
    touched.confirm || confirmPassword.length >= newPassword.length
      ? confirmPasswordError
      : null;

  const canSubmit =
    !loading &&
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    !newPasswordError &&
    !confirmPasswordError;

  const onFieldChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setError(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      setTouched({ next: true, confirm: true });
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await gateway.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTouched({ next: false, confirm: false });
      dialog.success(labels.success);
    } catch (err) {
      setError(resolveError(err, labels.errorFallback, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      data-testid="ChangePasswordForm"
      className="flex flex-col gap-4"
      onSubmit={onSubmit}
      noValidate
    >
      <p className="text-sm text-secondary-text">{labels.description}</p>
      <p className="text-xs text-secondary-text">{labels.noPasswordHint}</p>

      <input
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        disabled={loading}
        onChange={(e) => onFieldChange(setCurrentPassword, e.target.value)}
        placeholder={labels.currentPlaceholder}
        className={inputClass}
      />
      <div className="flex flex-col gap-1">
        <input
          type="password"
          autoComplete="new-password"
          maxLength={50}
          value={newPassword}
          disabled={loading}
          aria-invalid={Boolean(showNewPasswordError)}
          onChange={(e) => onFieldChange(setNewPassword, e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, next: true }))}
          placeholder={labels.newPlaceholder}
          className={`${inputClass}${showNewPasswordError ? ` ${inputErrorClass}` : ''}`}
        />
        {showNewPasswordError ? (
          <p className="text-sm text-red-500">{showNewPasswordError}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <input
          type="password"
          autoComplete="new-password"
          maxLength={50}
          value={confirmPassword}
          disabled={loading}
          aria-invalid={Boolean(showConfirmPasswordError)}
          onChange={(e) => onFieldChange(setConfirmPassword, e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
          placeholder={labels.confirmPlaceholder}
          className={`${inputClass}${showConfirmPasswordError ? ` ${inputErrorClass}` : ''}`}
        />
        {showConfirmPasswordError ? (
          <p className="text-sm text-red-500">{showConfirmPasswordError}</p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
          {labels.submit}
        </button>
      </div>
    </form>
  );
}
