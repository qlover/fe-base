'use client';

import { useSearchParams } from 'next/navigation';
import { type FormEvent, useMemo, useState } from 'react';
import { DemoAuthGateway } from '@/demo-oauth/DemoAuthGateway';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import { LoginValidator } from '@shared/validators/LoginValidator';
import type { LoginI18nInterface } from '@config/i18n-mapping/loginI18n';
import { I } from '@config/ioc-identifiter';
import { ROUTE_DEVELOPER_APPS, ROUTE_REGISTER } from '@config/route';
import type { LoginSchema } from '@schemas/LoginSchema';
import type { SeedSrcConfigInterface } from '@interfaces/SeedConfigInterface';

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-bg-container px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

export function LoginForm(props: { tt: LoginI18nInterface }) {
  const { tt } = props;
  const t = useWarnTranslations();
  const searchParams = useSearchParams();
  const demoAuth = useIOC(DemoAuthGateway);
  const appConfig = useIOC(I.AppConfig) as SeedSrcConfigInterface;
  const formValidator = useMemo(() => new LoginValidator(), []);

  const [email, setEmail] = useState(appConfig.testLoginEmail);
  const [password, setPassword] = useState(appConfig.testLoginPassword);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginSchema>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    if (formResult != null && !formResult.success) {
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
      await demoAuth.verify(payload);
      setSuccess(true);

      const redirectTarget =
        searchParams?.get('redirect') ??
        searchParams?.get('returnUrl') ??
        ROUTE_DEVELOPER_APPS;

      if (redirectTarget.startsWith('http')) {
        window.location.href = redirectTarget;
        return;
      }

      window.location.assign(redirectTarget);
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
            className="text-secondary-text bg-bg-container text-sm hover:text-primary-text cursor-pointer"
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
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand shadow-sm transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-brand"
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
