import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthSplitShell } from '@/components/AuthSplitShell';
import { authInputClass, authPrimaryBtnClass } from '@/components/authStyles';
import { LocaleLink } from '@/components/LocaleLink';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { UserService } from '@/impls/UserService';
import { pageRegisterI18n } from '@config/i18n-mapping/page.register';
import type { FormEvent } from 'react';

export default function RegisterPage(_props: RouterRenderProps) {
  const text = useI18nMapping(pageRegisterI18n);
  const userService = useIOC(UserService);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const { LoginDataSchema } =
      await import('@/interfaces/schema/UserGateway.zod');
    const parsed = LoginDataSchema.safeParse({ email, password });
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: issues.email?.[0],
        password: issues.password?.[0]
      });
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: text.passwordMismatch
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.register(parsed.data);
      navigate('login', { replace: true });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Registration failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitShell
      testId="RegisterPage"
      brandLabel="React Seed"
      heroTitle={text.heroTitle}
      heroSubtitle={text.heroSubtitle}
      features={[text.feature1, text.feature2, text.feature3]}
      featureTestId="register-feature-item"
      footerHint={text.description}
    >
      <div className="mb-8 text-center lg:mb-10 lg:text-left">
        <h1 className="text-primary-text text-2xl font-semibold tracking-tight sm:text-3xl">
          {text.title}
        </h1>
        <p className="text-secondary-text mt-1.5 text-sm">{text.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            htmlFor="register-email"
            className="text-primary-text mb-1.5 block text-sm font-medium"
          >
            {text.emailLabel}
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder={text.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={
              fieldErrors.email ? 'register-email-error' : undefined
            }
          />
          {fieldErrors.email && (
            <p id="register-email-error" className="text-red-500 mt-1 text-sm">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="text-primary-text mb-1.5 block text-sm font-medium"
          >
            {text.passwordLabel}
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder={text.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            required
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password ? 'register-password-error' : undefined
            }
          />
          {fieldErrors.password && (
            <p
              id="register-password-error"
              className="text-red-500 mt-1 text-sm"
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
            {text.confirmPasswordLabel}
          </label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder={text.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={authInputClass}
            required
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
            >
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={authPrimaryBtnClass}
        >
          {isSubmitting ? text.submitLoading : text.submit}
        </button>
      </form>

      <p className="text-secondary-text mt-6 text-center text-sm">
        {text.haveAccount}{' '}
        <LocaleLink
          href="/login"
          className="text-brand font-medium hover:underline"
        >
          {text.signIn}
        </LocaleLink>
      </p>

      <div className="mt-8 text-center">
        <LocaleLink
          href="/"
          className="text-secondary-text hover:text-primary-text text-sm transition-colors"
        >
          ← {text.backHome}
        </LocaleLink>
      </div>
    </AuthSplitShell>
  );
}
