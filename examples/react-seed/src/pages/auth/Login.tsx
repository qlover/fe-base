import { pageLoginI18n } from '@config/i18n-mapping/page.login';
import { useState } from 'react';
import { LocaleLink } from '@/components/LocaleLink';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';
import type { FormEvent } from 'react';

function IconGoogle() {
  return (
    <svg
      data-testid="icon-google"
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
      data-testid="icon-github"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function LoginPage(_props: RouterRenderProps) {
  const text = useI18nMapping(pageLoginI18n);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1200);
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

          {/* Social login */}
          <div className="space-y-3">
            <button
              type="button"
              className={socialBtnClass}
              aria-label={text.google}
            >
              <IconGoogle />
              <span>{text.google}</span>
            </button>
            <button
              type="button"
              className={socialBtnClass}
              aria-label={text.github}
            >
              <IconGitHub />
              <span>{text.github}</span>
            </button>
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
            <div>
              <label
                htmlFor="login-username"
                className="text-primary-text mb-1.5 block text-sm font-medium"
              >
                {text.usernameLabel}
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username email"
                placeholder={text.usernamePlaceholder}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                style={{ borderColor: 'var(--login-input-border)' }}
                required
              />
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
              />
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
            <span className="text-brand font-medium hover:underline cursor-pointer">
              {text.signUp}
            </span>
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
