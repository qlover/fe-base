import { useState } from 'react';
import { AuthSplitShell } from '@/components/AuthSplitShell';
import {
  authInputClass,
  authPrimaryBtnClass,
  authSocialBtnClass
} from '@/components/authStyles';
import { LocaleLink } from '@/components/LocaleLink';
import { PAMLogo } from '@/components/PAMLogo';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { useLocale } from '@/hooks/useLocale';
import { useOAuthLogin } from '@/hooks/useOAuthLogin';
import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';
import { pageLoginI18n } from '@config/i18n-mapping/page.login';
import { usePathLocaleRoute } from '@config/seed.config';
import type { FormEvent } from 'react';

export default function LoginPage(_props: RouterRenderProps) {
  const text = useI18nMapping(pageLoginI18n);
  const userService = useIOC(UserService);
  const routeService = useIOC(RouteService);
  const { locale } = useLocale();
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

    setIsSubmitting(true);
    try {
      await userService.login(parsed.data);
      routeService.useMainRoutes(usePathLocaleRoute ? `/${locale}` : '/');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitShell
      testId="LoginPage"
      brandLabel="React Seed"
      heroTitle={text.heroTitle}
      heroSubtitle={text.heroSubtitle}
      features={[text.feature1, text.feature2, text.feature3]}
      featureTestId="login-feature-item"
      footerHint={text.description}
    >
      <div className="mb-8 text-center lg:mb-10 lg:text-left">
        <h1 className="text-primary-text text-2xl font-semibold tracking-tight sm:text-3xl">
          {text.title}
        </h1>
        <p className="text-secondary-text mt-1.5 text-sm">{text.description}</p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          disabled={!isConfigured || isStarting}
          onClick={() => void startLogin()}
          className={
            authSocialBtnClass +
            ' disabled:cursor-not-allowed disabled:opacity-60'
          }
          aria-label={text.oauthWrapper}
        >
          <PAMLogo className="text-brand h-5 w-5 text-[1.25rem]" />
          <span>{isStarting ? text.oauthLoading : text.oauthWrapper}</span>
        </button>
        {!isConfigured && (
          <p className="text-tertiary-text text-xs leading-relaxed">
            Set VITE_OAUTH_URL and VITE_OAUTH_CLIENT_ID to enable PAM PKCE.
          </p>
        )}
        {startError && (
          <p role="alert" className="text-red-500 text-sm">
            {startError}
          </p>
        )}
      </div>

      <div className="text-secondary-text my-6 flex items-center gap-4 text-xs">
        <span className="bg-primary-border h-px min-w-0 flex-1" />
        <span>{text.orContinue}</span>
        <span className="bg-primary-border h-px min-w-0 flex-1" />
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
            className={authInputClass}
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
            className={authInputClass}
            required
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password ? 'login-password-error' : undefined
            }
          />
          {fieldErrors.password && (
            <p id="login-password-error" className="text-red-500 mt-1 text-sm">
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
          className={authPrimaryBtnClass}
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
    </AuthSplitShell>
  );
}
