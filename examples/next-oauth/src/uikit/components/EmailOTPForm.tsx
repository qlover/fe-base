'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { AppUserGateway } from '@/impls/AppUserGateway';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import { LoginValidator } from '@shared/validators/LoginValidator';
import type { LoginI18nInterface } from '@config/i18n-mapping/loginI18n';
import { I } from '@config/ioc-identifiter';
import { ROUTE_REGISTER } from '@config/route';
import type { SeedSrcConfigInterface } from '@interfaces/SeedConfigInterface';

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-bg-container px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

interface EmailOTPFormProps {
  tt: LoginI18nInterface;
}

/**
 * Email magic-link login form.
 *
 * Sends a Supabase magic link. Clicking it opens /callback/email-login with a
 * loading UI; the page POSTs { code } to /api/callback/email-login (no browser Supabase).
 */
export function EmailOTPForm({ tt }: EmailOTPFormProps) {
  const t = useWarnTranslations();
  const userGateway = useIOC(AppUserGateway);
  const appConfig = useIOC(I.AppConfig) as SeedSrcConfigInterface;
  const formValidator = useMemo(() => new LoginValidator(), []);

  const [email, setEmail] = useState(appConfig.testLoginEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();

  const validateEmail = (value: string): boolean => {
    const result = formValidator.validateEmail(value.trim());
    if (result != null) {
      setEmailError(t(result.message));
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSendMagicLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      await userGateway.sendOtp({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to send magic link'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setSubmitError(null);
    setLoading(true);
    try {
      await userGateway.sendOtp({ email: email.trim() });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to resend magic link'
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = !email.trim();

  return (
    <div data-testid="EmailOTPForm" className="w-full">
      {submitError && (
        <div
          role="alert"
          className="text-red-500 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm mb-4 dark:border-red-800 dark:bg-red-950/30"
        >
          {submitError}
        </div>
      )}

      {sent ? (
        <div className="space-y-4">
          <div
            role="status"
            className="text-green-600 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm dark:border-green-800 dark:bg-green-950/30"
          >
            {tt.emailOtpSuccess}
          </div>
          <p className="text-secondary-text text-sm text-center">{email}</p>
          <p className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-brand text-sm hover:underline disabled:opacity-50"
            >
              {loading ? '...' : tt.emailOtpResend}
            </button>
          </p>
        </div>
      ) : (
        <form
          data-testid="EmailOTPForm-Email"
          name="email-magic-link"
          onSubmit={handleSendMagicLink}
          noValidate
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="magic-link-email"
              className="text-primary-text mb-1.5 block text-sm font-medium"
            >
              {tt.email}
            </label>
            <input
              id="magic-link-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={tt.email}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(undefined);
              }}
              className={inputClass}
              disabled={loading}
              aria-invalid={!!emailError}
              aria-describedby={
                emailError ? 'magic-link-email-error' : undefined
              }
            />
            {emailError && (
              <p
                id="magic-link-email-error"
                className="text-red-500 mt-1 text-sm"
                role="alert"
              >
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isEmpty}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand shadow-sm transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-brand"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </span>
            ) : (
              tt.emailOtpSend
            )}
          </button>
        </form>
      )}

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
    </div>
  );
}
