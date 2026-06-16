'use client';

import { GithubOutlined, GoogleOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import { AppUserGateway } from '@/impls/AppUserGateway';
import { EmailOTPForm } from '@/uikit/components/EmailOTPForm';
import { LoginForm } from '@/uikit/components/LoginForm';
import { PhoneLoginForm } from '@/uikit/components/PhoneLoginForm';
import type { LoginProviderType } from '@config/common';
import { loginProviders } from '@config/common';
import type { LoginI18nInterface } from '@config/i18n-mapping/loginI18n';
import { useIOC } from '../hook/useIOC';
import type { AntdIconProps } from '@ant-design/icons/es/components/AntdIcon';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type LoginTab = 'email' | 'phone';
type EmailMode = 'password' | 'otp';

type ProvidersItem = {
  key: LoginProviderType;
  provider: LoginProviderType;
  titleI18nMapKey: keyof LoginI18nInterface;
  disabled: boolean;
  Icon: ForwardRefExoticComponent<
    Omit<AntdIconProps, 'ref'> & RefAttributes<HTMLSpanElement>
  >;
};

const providersIcons: Record<
  LoginProviderType,
  ForwardRefExoticComponent<
    Omit<AntdIconProps, 'ref'> & RefAttributes<HTMLSpanElement>
  >
> = {
  [loginProviders.GitHub]: GithubOutlined,
  [loginProviders.Google]: GoogleOutlined
};

const providersItems: ProvidersItem[] = Object.values(loginProviders).map(
  (provider) => ({
    key: provider,
    disabled: provider === loginProviders.Google,
    provider: provider,
    titleI18nMapKey: ('provider' + provider) as keyof LoginI18nInterface,
    Icon: providersIcons[provider]
  })
);

export function LoginTabSwitch({ tt }: { tt: LoginI18nInterface }) {
  const userGateway = useIOC(AppUserGateway);
  const [tab, setTab] = useState<LoginTab>('email');
  const [emailMode, setEmailMode] = useState<EmailMode>('password');
  const [providerLogining, setProviderLogining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabBaseClass =
    'flex-1 py-2.5 text-sm font-medium text-center transition-colors cursor-pointer border-b-2 outline-none';
  const tabActiveClass = 'border-brand text-primary-text';
  const tabInactiveClass =
    'border-transparent text-secondary-text hover:text-primary-text hover:border-primary-border';

  const onLoginWithProvider = useCallback(
    (provider: LoginProviderType) => {
      setProviderLogining(true);
      userGateway
        .loginWithProvider({ provider })
        .then((result) => {
          if (result.providerUrl) {
            console.log('providerUrl', result);
            window.location.assign(result.providerUrl);
          }
        })
        .catch((err) => {
          setProviderLogining(false);
          setError(
            err instanceof Error ? err.message : 'Failed to login with provider'
          );
        });
    },
    [userGateway]
  );

  return (
    <div data-testid="LoginTabSwitch" className="w-full">
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-800 dark:bg-red-950/30"
        >
          {error}
        </div>
      )}

      {providersItems.map(
        ({ key, disabled, provider, titleI18nMapKey, Icon }) => (
          <button
            data-testid={'LoginWith' + key}
            key={key}
            disabled={disabled || providerLogining}
            onClick={() => onLoginWithProvider(provider)}
            title={tt[titleI18nMapKey]}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24292e] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2c3137] focus:outline-none focus:ring-2 focus:ring-[#24292e] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 mb-6"
          >
            <Icon className="text-lg" />
            <span>{tt[titleI18nMapKey]}</span>
          </button>
        )
      )}

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary-border"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bg-container px-2 text-tertiary-text">
            {tt.continueWith}
          </span>
        </div>
      </div>

      <div className="flex border-b border-primary-border mb-6">
        <button
          type="button"
          className={`${tabBaseClass} ${tab === 'email' ? tabActiveClass : tabInactiveClass}`}
          onClick={() => setTab('email')}
          aria-selected={tab === 'email'}
          role="tab"
        >
          {tt.tabEmail}
        </button>
        <button
          type="button"
          className={`${tabBaseClass} ${tab === 'phone' ? tabActiveClass : tabInactiveClass}`}
          onClick={() => setTab('phone')}
          aria-selected={tab === 'phone'}
          role="tab"
        >
          {tt.tabPhone}
        </button>
      </div>

      {tab === 'email' && (
        <>
          {emailMode === 'password' ? (
            <>
              <LoginForm tt={tt} />
              <p className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setEmailMode('otp')}
                  className="text-brand text-sm hover:underline"
                >
                  {tt.switchToOtp}
                </button>
              </p>
            </>
          ) : (
            <>
              <EmailOTPForm tt={tt} />
              <p className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setEmailMode('password')}
                  className="text-brand text-sm hover:underline"
                >
                  {tt.switchToPassword}
                </button>
              </p>
            </>
          )}
        </>
      )}

      {tab === 'phone' && <PhoneLoginForm tt={tt} />}
    </div>
  );
}
