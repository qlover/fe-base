import { useRouter } from '@/contexts/RouterContext';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import type { UserService } from '@/impls/UserService';
import { pageLoginI18n } from '@config/i18n-mapping/page.login';
import { I } from '@config/ioc-identifier';
import { useState, type FormEvent } from 'react';

function validateEmail(value: string): string | null {
  if (!value.trim()) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value) ? null : 'Invalid email';
}

export default function Login() {
  const text = useI18nMapping(pageLoginI18n);
  const userService = useIOC(I.UserService) as UserService;
  const { navigate } = useRouter();
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

    const emailError = validateEmail(email);
    const passwordError = !password.trim() ? 'Password is required' : undefined;
    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError ?? undefined,
        password: passwordError
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const credentials = await userService.login({
        email: email.trim(),
        password
      });
      if (credentials?.token) {
        navigate('/');
      } else {
        setSubmitError('Login failed');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'fe:border-primary-border fe:text-primary-text fe:placeholder:text-tertiary-text focus:fe:border-brand focus:fe:ring-brand fe:w-full fe:rounded-lg fe:border fe:bg-transparent fe:px-3 fe:py-2 fe:text-sm fe:outline-none fe:transition-colors focus:fe:ring-2 focus:fe:ring-offset-0';
  const labelClass =
    'fe:text-primary-text fe:mb-1 fe:block fe:text-sm fe:font-medium';

  return (
    <div
      data-testid="LoginPage"
      className="fe:flex fe:min-h-full fe:flex-col fe:p-4">
      <div className="fe:mb-6">
        <h1 className="fe:text-primary-text fe:text-xl fe:font-semibold fe:tracking-tight">
          {text.title}
        </h1>
        <p className="fe:text-secondary-text fe:mt-1 fe:text-sm">
          {text.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="fe:space-y-4">
        {submitError && (
          <div
            role="alert"
            className="fe:text-red-500 fe:rounded-lg fe:border fe:border-red-200 fe:bg-red-50 fe:px-3 fe:py-2 fe:text-sm dark:fe:border-red-800 dark:fe:bg-red-950/30">
            {submitError}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className={labelClass}>
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
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={
              fieldErrors.email ? 'login-email-error' : undefined
            }
          />
          {fieldErrors.email && (
            <p
              id="login-email-error"
              className="fe:text-red-500 fe:mt-1 fe:text-xs">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="fe:mb-1 fe:flex fe:items-center fe:justify-between">
            <label htmlFor="login-password" className={labelClass}>
              {text.passwordLabel}
            </label>
            <span className="fe:text-secondary-text fe:cursor-pointer fe:text-xs hover:fe:text-primary-text">
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
            required
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password ? 'login-password-error' : undefined
            }
          />
          {fieldErrors.password && (
            <p
              id="login-password-error"
              className="fe:text-red-500 fe:mt-1 fe:text-xs">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="fe:flex fe:items-center">
          <input
            id="login-remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="fe:border-primary-border fe:text-brand focus:fe:ring-brand fe:h-4 fe:w-4 fe:rounded"
          />
          <label
            htmlFor="login-remember"
            className="fe:text-primary-text fe:ml-2 fe:text-sm">
            {text.rememberMe}
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="fe:bg-brand hover:fe:bg-brand-hover focus:fe:ring-brand fe:w-full fe:rounded-lg fe:px-3 fe:py-2.5 fe:text-sm fe:font-medium fe:text-white fe:transition-colors focus:fe:outline-none focus:fe:ring-2 focus:fe:ring-offset-0 disabled:fe:opacity-70">
          {isSubmitting ? text.submitLoading : text.submit}
        </button>
      </form>

      <p className="fe:text-secondary-text fe:mt-4 fe:text-center fe:text-sm">
        {text.noAccount}{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="fe:text-brand fe:font-medium hover:fe:underline">
          {text.signUp}
        </button>
      </p>

      <div className="fe:mt-4 fe:text-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="fe:text-secondary-text hover:fe:text-primary-text fe:text-sm fe:transition-colors">
          ← {text.backHome}
        </button>
      </div>
    </div>
  );
}
