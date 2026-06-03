import { pageLoginI18n } from '@config/i18n-mapping/page.login';
import { useState } from 'react';
import { LocaleLink } from '@/components/LocaleLink';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { useOAuthLogin } from '@/hooks/useOAuthLogin';
import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';
import { LoginDataSchema } from '@/interfaces/schema/UserGateway';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';
import type { FormEvent } from 'react';

export default function LoginPage(_props: RouterRenderProps) {
  const text = useI18nMapping(pageLoginI18n);
  const userService = useIOC(UserService)
  const routeService = useIOC(RouteService);
  const { startLogin, isStarting, startError, isConfigured } = useOAuthLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
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

    setIsSubmitting(true);
    try {
      await userService.login(parsed.data);
      routeService.useMainRoutes();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-(--login-input-bg) px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';
  const socialBtnClass =
    'border-primary-border bg-(--login-social-button-bg) text-primary-text hover:bg-secondary focus:ring-brand inline-flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';

  return (
    <div
      data-testid="LoginPage"
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
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(var(--text-primary)) 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
        {/* Floating shapes */}
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
        <div
          className="absolute right-1/4 top-1/3 h-32 w-32 rounded-3xl opacity-10"
          style={{
            background:
              'linear-gradient(145deg, rgb(var(--color-brand) / 0.3), transparent)'
          }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 h-24 w-24 rounded-2xl opacity-[0.08]"
          style={{
            background: 'rgb(var(--color-brand) / 0.25)'
          }}
        />
        {/* Content */}
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
                  data-testid="login-feature-item"
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
          {/* Mobile-only title */}
          <div className="mb-8 text-center lg:mb-10 lg:text-left">
            <h1 className="text-primary-text text-2xl font-semibold tracking-tight sm:text-3xl">
              {text.title}
            </h1>
            <p className="text-secondary-text mt-1.5 text-sm">
              {text.description}
            </p>
          </div>

          {/* OAuth login */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={!isConfigured || isStarting}
              onClick={() => void startLogin()}
              className={
                socialBtnClass +
                ' disabled:cursor-not-allowed disabled:opacity-60'
              }
              aria-label={text.oauthWrapper}
            >
              <span>{isStarting ? text.oauthLoading : text.oauthWrapper}</span>
            </button>
            {startError && (
              <p role="alert" className="text-red-500 text-sm">
                {startError}
              </p>
            )}
          </div>

          <div className="text-secondary-text my-6 flex items-center gap-4 text-xs">
            <span
              className="h-px flex-1 bg-(--login-input-border)"
              style={{ minWidth: 0 }}
            />
            <span>{text.orContinue}</span>
            <span
              className="h-px flex-1 bg-(--login-input-border)"
              style={{ minWidth: 0 }}
            />
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
                htmlFor="login-email"
                className="text-primary-text mb-1.5 block text-sm font-medium"
              >
                {text.usernameLabel}
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={text.usernamePlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={{ borderColor: 'var(--login-input-border)' }}
                required
                aria-invalid={!!fieldErrors.email}
                aria-describedby={
                  fieldErrors.email ? 'login-email-error' : undefined
                }
              />
              {fieldErrors.email && (
                <p id="login-email-error" className="text-red-500 mt-1 text-sm">
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
                  {text.passwordLabel}
                </label>
                <span className="text-secondary-text text-sm hover:text-primary-text cursor-pointer">
                  {text.forgotPassword}
                </span>
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder={text.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                style={{ borderColor: 'var(--login-input-border)' }}
                required
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? 'login-password-error' : undefined
                }
              />
              {fieldErrors.password && (
                <p
                  id="login-password-error"
                  className="text-red-500 mt-1 text-sm"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <div className="flex items-center">
              <input
                id="login-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="border-primary-border text-brand focus:ring-brand h-4 w-4 rounded"
              />
              <label
                htmlFor="login-remember"
                className="text-primary-text ml-2 text-sm"
              >
                {text.rememberMe}
              </label>
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
            {text.noAccount}{' '}
            <LocaleLink
              href="/register"
              className="text-brand font-medium hover:underline"
            >
              {text.signUp}
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
