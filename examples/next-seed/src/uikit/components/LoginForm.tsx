'use client';

import { type SubmitEvent, useMemo, useState } from 'react';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import { LoginValidator } from '@shared/validators/LoginValidator';
import type { LoginI18nInterface } from '@config/i18n-mapping/loginI18n';
import { I } from '@config/ioc-identifiter';
import { ROUTE_REGISTER } from '@config/route';
import type { LoginSchema } from '@schemas/LoginSchema';
import type { SeedSrcConfigInterface } from '@interfaces/SeedConfigInterface';

function IconGoogle() {
  return (
    <svg
      data-testid="LoginForm-icon-google"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg
      data-testid="LoginForm-icon-github"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-(--login-input-bg) px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';
const socialBtnClass =
  'border-primary-border bg-(--login-social-button-bg) text-primary-text hover:bg-secondary focus:ring-brand inline-flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';

export function LoginForm(props: { tt: LoginI18nInterface }) {
  const { tt } = props;
  const t = useWarnTranslations();
  const userService = useIOC(I.UserServiceInterface);
  const appConfig = useIOC(I.AppConfig) as SeedSrcConfigInterface;
  const routerService = useIOC(I.RouterServiceInterface);
  const formValidator = useMemo(() => new LoginValidator(), []);

  const [email, setEmail] = useState(appConfig.testLoginEmail);
  const [password, setPassword] = useState(appConfig.testLoginPassword);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginSchema>>({});

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

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

    const payload: LoginSchema = { email, password };
    const formResult = formValidator.validate(payload);
    if (formResult != null) {
      if (formResult.path[0] === 'email') {
        setFieldErrors((prev) => ({ ...prev, email: t(formResult.message) }));
      } else if (formResult.path[0] === 'password') {
        setFieldErrors((prev) => ({
          ...prev,
          password: t(formResult.message)
        }));
      }
      return;
    }

    setLoading(true);
    try {
      await userService.login(payload);
      setSuccess(true);
      routerService.replaceHome();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = !email.trim() && !password.trim();
  const submitDisabled = loading || success || isEmpty;

  return (
    <form
      data-testid="LoginForm"
      name="login"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Social login */}
      <div className="space-y-3">
        <button
          type="button"
          className={socialBtnClass}
          aria-label={tt.withGoogleTitle}
          title={tt.withGoogleTitle}
        >
          <IconGoogle />
          <span>{tt.withGoogle}</span>
        </button>
        <button
          type="button"
          className={socialBtnClass}
          aria-label="GitHub"
          title="Sign in with GitHub"
        >
          <IconGitHub />
          <span>GitHub</span>
        </button>
      </div>

      <div className="text-secondary-text my-6 flex items-center gap-4 text-xs">
        <span
          className="h-px flex-1 bg-(--login-input-border)"
          style={{ minWidth: 0 }}
        />
        <span>{tt.continueWith}</span>
        <span
          className="h-px flex-1 bg-(--login-input-border)"
          style={{ minWidth: 0 }}
        />
      </div>

      {submitError && (
        <div
          role="alert"
          className="text-red-500 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950/30"
        >
          {submitError}
        </div>
      )}

      <div>
        <label
          htmlFor="login-email"
          className="text-primary-text mb-1.5 block text-sm font-medium"
        >
          {tt.email}
        </label>
        <input
          id="login-email"
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
          disabled={loading || success}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
        />
        {fieldErrors.email && (
          <p
            id="login-email-error"
            className="text-red-500 mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="text-primary-text text-sm font-medium"
          >
            {tt.password}
          </label>
          <LocaleLink
            href="#"
            title={tt.forgotPasswordTitle}
            className="text-secondary-text text-sm hover:text-primary-text cursor-pointer"
          >
            {tt.forgotPassword}
          </LocaleLink>
        </div>
        <input
          id="login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder={tt.password}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          className={inputClass}
          style={{ borderColor: 'var(--login-input-border)' }}
          disabled={loading || success}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={
            fieldErrors.password ? 'login-password-error' : undefined
          }
        />
        {fieldErrors.password && (
          <p
            id="login-password-error"
            className="text-red-500 mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitDisabled}
        title={tt.buttonTitle}
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
        {tt.noAccount}{' '}
        <LocaleLink
          href={ROUTE_REGISTER}
          title={tt.createAccountTitle}
          className="text-brand font-medium hover:underline"
        >
          {tt.createAccount}
        </LocaleLink>
      </p>
    </form>
  );
}
