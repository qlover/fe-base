import { pageRegisterI18n } from '@config/i18n-mapping/page.register';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocaleLink } from '@/components/LocaleLink';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { UserService } from '@/impls/UserService';
import { LoginDataSchema } from '@/interfaces/schema/UserGateway';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';
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

  const inputClass =
    'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-(--login-input-bg) px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

  return (
    <div
      data-testid="RegisterPage"
      className="grid min-h-screen w-full lg:grid-cols-2"
    >
      {/* Left: decorative panel — hidden on small, visible from lg */}
      <div
        className="relative hidden overflow-hidden lg:block"
        style={{
          background:
            'linear-gradient(135deg, rgb(var(--color-brand) / 0.14) 0%, rgb(var(--color-brand) / 0.06) 40%, rgb(var(--color-brand) / 0.02) 100%)'
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--text-primary)) 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
        <div
          className="absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'rgb(var(--color-brand) / 0.4)'
          }}
        />
        <div
          className="absolute bottom-1/4 -right-16 h-48 w-48 rounded-full opacity-15 blur-2xl"
          style={{
            background: 'rgb(var(--color-brand) / 0.35)'
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="text-primary-text/70 text-sm font-medium tracking-wide">
            {text.title}
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-primary-text text-3xl font-semibold tracking-tight xl:text-4xl">
                {text.heroTitle}
              </h2>
              <p className="text-secondary-text mt-2 max-w-sm text-base leading-relaxed">
                {text.heroSubtitle}
              </p>
            </div>
            <ul className="space-y-4">
              {[text.feature1, text.feature2, text.feature3].map((label, i) => (
                <li
                  key={i}
                  data-testid="register-feature-item"
                  className="text-primary-text/90 flex items-center gap-3 text-sm"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                    style={{
                      background: 'rgb(var(--color-brand) / 0.15)',
                      color: 'rgb(var(--color-brand))'
                    }}
                  >
                    ✓
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2 text-primary-text/40">
            <span
              className="h-px flex-1 bg-current opacity-30"
              style={{ maxWidth: '80px' }}
            />
            <span className="text-xs">{text.description}</span>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-10 xl:px-14">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-8 text-center lg:mb-10 lg:text-left">
            <h1 className="text-primary-text text-2xl font-semibold tracking-tight sm:text-3xl">
              {text.title}
            </h1>
            <p className="text-secondary-text mt-1.5 text-sm">
              {text.description}
            </p>
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
                className={inputClass}
                style={{ borderColor: 'var(--login-input-border)' }}
                required
                aria-invalid={!!fieldErrors.email}
                aria-describedby={
                  fieldErrors.email ? 'register-email-error' : undefined
                }
              />
              {fieldErrors.email && (
                <p
                  id="register-email-error"
                  className="text-red-500 mt-1 text-sm"
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
                {text.passwordLabel}
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder={text.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                style={{ borderColor: 'var(--login-input-border)' }}
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
                className={inputClass}
                style={{ borderColor: 'var(--login-input-border)' }}
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
              className="bg-brand hover:bg-brand-hover text-(--login-button-text) focus:ring-brand w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-70"
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
        </div>
      </div>
    </div>
  );
}
