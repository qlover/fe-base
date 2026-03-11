'use client';

import { type SubmitEvent, useMemo, useState } from 'react';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useIOC } from '@/uikit/hook/useIOC';
import { useStore } from '@/uikit/hook/useStore';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import { RegisterValidator } from '@shared/validators/RegisterValidator';
import type { RegisterI18nInterface } from '@config/i18n-mapping/register18n';
import { I } from '@config/ioc-identifiter';
import { ROUTE_LOGIN } from '@config/route';
import type { RegisterSchema } from '@schemas/RegisterSchema';

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-(--login-input-bg) px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

export function RegisterForm(props: { tt: RegisterI18nInterface }) {
  const { tt } = props;
  const t = useWarnTranslations();
  const userService = useIOC(I.UserServiceInterface);
  const formValidator = useMemo(() => new RegisterValidator(), []);
  const result = useStore(userService.getUIStore(), (state) => state.result);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
  }>({});

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const usernameResult = formValidator.validateUsername(username);
    if (usernameResult != null) {
      setFieldErrors((prev) => ({
        ...prev,
        username: t(usernameResult.message)
      }));
      return;
    }

    const emailResult = formValidator.validateEmail(email);
    if (emailResult != null) {
      setFieldErrors((prev) => ({ ...prev, email: t(emailResult.message) }));
      return;
    }

    const passwordResult = formValidator.validatePassword(password);
    if (passwordResult != null) {
      setFieldErrors((prev) => ({
        ...prev,
        password: t(passwordResult.message)
      }));
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: tt.password_mismatch
      }));
      return;
    }

    if (!agreeToTerms) {
      setFieldErrors((prev) => ({
        ...prev,
        agreeToTerms: tt.terms_required
      }));
      return;
    }

    const payload: RegisterSchema = { username, email, password };
    const formResult = formValidator.validate(payload);
    if (formResult != null) {
      const key = formResult.path[0] as keyof typeof fieldErrors;
      if (key) {
        setFieldErrors((prev) => ({
          ...prev,
          [key]: t(formResult.message)
        }));
      }
      return;
    }

    setLoading(true);
    try {
      await userService.register(payload);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmpty =
    !username.trim() &&
    !email.trim() &&
    !password &&
    !confirmPassword &&
    !agreeToTerms;
  const disabled = !!result;
  const submitDisabled = disabled || loading || isEmpty;

  return (
    <form
      data-testid="RegisterForm"
      name="register"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {result && result.email_confirmed_at == null ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
        >
          {tt.email_verify}
        </div>
      ) : null}

      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-800 dark:bg-red-950/30"
        >
          {submitError}
        </div>
      )}

      <div>
        <label
          htmlFor="register-username"
          className="text-primary-text mb-1.5 block text-sm font-medium"
        >
          {tt.username}
        </label>
        <input
          id="register-username"
          type="text"
          name="username"
          autoComplete="username"
          placeholder={tt.username}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username)
              setFieldErrors((prev) => ({ ...prev, username: undefined }));
          }}
          className={inputClass}
          style={{ borderColor: 'var(--login-input-border)' }}
          disabled={disabled || loading}
          aria-invalid={!!fieldErrors.username}
          aria-describedby={
            fieldErrors.username ? 'register-username-error' : undefined
          }
        />
        {fieldErrors.username && (
          <p
            id="register-username-error"
            className="text-red-500 mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.username}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="text-primary-text mb-1.5 block text-sm font-medium"
        >
          {tt.email}
        </label>
        <input
          id="register-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder={tt.email}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email)
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          className={inputClass}
          style={{ borderColor: 'var(--login-input-border)' }}
          disabled={disabled || loading}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={
            fieldErrors.email ? 'register-email-error' : undefined
          }
        />
        {fieldErrors.email && (
          <p
            id="register-email-error"
            className="text-red-500 mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="text-primary-text mb-1.5 block text-sm font-medium"
        >
          {tt.password}
        </label>
        <input
          id="register-password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder={tt.password}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          className={inputClass}
          style={{ borderColor: 'var(--login-input-border)' }}
          disabled={disabled || loading}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={
            fieldErrors.password ? 'register-password-error' : undefined
          }
        />
        {fieldErrors.password && (
          <p
            id="register-password-error"
            className="text-red-500 mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="register-confirm-password"
          className="text-primary-text mb-1.5 block text-sm font-medium"
        >
          {tt.confirm_password}
        </label>
        <input
          id="register-confirm-password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={tt.confirm_password}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword)
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: undefined
              }));
          }}
          className={inputClass}
          style={{ borderColor: 'var(--login-input-border)' }}
          disabled={disabled || loading}
          aria-invalid={!!fieldErrors.confirmPassword}
          aria-describedby={
            fieldErrors.confirmPassword
              ? 'register-confirm-password-error'
              : undefined
          }
        />
        {fieldErrors.confirmPassword && (
          <p
            id="register-confirm-password-error"
            className="text-red-500 mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="register-terms"
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => {
            setAgreeToTerms(e.target.checked);
            if (fieldErrors.agreeToTerms)
              setFieldErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
          }}
          className="border-primary-border text-brand focus:ring-brand mt-0.5 h-4 w-4 rounded"
          disabled={disabled || loading}
          aria-invalid={!!fieldErrors.agreeToTerms}
        />
        <label htmlFor="register-terms" className="text-primary-text text-sm">
          {tt.terms_prefix}{' '}
          <a
            href="#"
            className="text-brand font-medium hover:underline hover:text-brand-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tt.terms_link}
          </a>{' '}
          {tt.terms_and}{' '}
          <a
            href="#"
            className="text-brand font-medium hover:underline hover:text-brand-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tt.privacy_link}
          </a>
        </label>
      </div>
      {fieldErrors.agreeToTerms && (
        <p className="text-red-500 text-sm" role="alert">
          {fieldErrors.agreeToTerms}
        </p>
      )}

      <button
        type="submit"
        disabled={submitDisabled}
        title={tt.button}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-(--login-button-text) shadow-sm transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-brand"
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {tt.button}
          </span>
        ) : (
          tt.button
        )}
      </button>

      <p className="text-secondary-text mt-6 text-center text-sm">
        {tt.have_account}{' '}
        <LocaleLink
          href={ROUTE_LOGIN}
          title={tt.login_link}
          className="text-brand font-medium hover:underline"
        >
          {tt.login_link}
        </LocaleLink>
      </p>
    </form>
  );
}
