'use client';

import {
  runAsyncStore,
  useAsyncStore,
  type AsyncState
} from '@brain-toolkit/react-kit';
import { useStrictEffect } from '@qlover/next-kit/client';
import { clsx } from 'clsx';
import {
  useCallback,
  useState,
  type ComponentType,
  type SVGProps
} from 'react';
import { AppUserGateway } from '@/impls/AppUserGateway';
import { fetchPublicConfig } from '@/impls/fetchPublicConfig';
import { EmailOTPForm } from '@/uikit/components/EmailOTPForm';
import { GithubIcon, GoogleIcon } from '@/uikit/components/icons';
import { LoginForm } from '@/uikit/components/LoginForm';
import { PhoneLoginForm } from '@/uikit/components/PhoneLoginForm';
import type { LoginProviderType } from '@config/common';
import { loginProviders, oauthUpstreamProviders } from '@config/common';
import type { LoginI18nInterface } from '@config/i18n-mapping/loginI18n';
import { I } from '@config/ioc-identifiter';
import type { FePublicConfig } from '@schemas/FeSiteSettingsSchema';
import type { SeedSrcConfigInterface } from '@interfaces/SeedConfigInterface';
import { useIOC } from '../hook/useIOC';

type LoginTab = 'email' | 'phone';
type EmailMode = 'password' | 'otp';

type ProviderLoginState = AsyncState<
  Awaited<ReturnType<AppUserGateway['loginWithProvider']>>
>;

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type ProvidersItem = {
  key: LoginProviderType;
  provider: LoginProviderType;
  titleI18nMapKey: keyof LoginI18nInterface;
  Icon: IconComponent;
};

const providersIcons: Record<LoginProviderType, IconComponent> = {
  [loginProviders.GitHub]: GithubIcon,
  [loginProviders.Google]: GoogleIcon
};

const providersItems: ProvidersItem[] = Object.values(loginProviders).map(
  (provider) => ({
    key: provider,
    provider: provider,
    titleI18nMapKey: ('provider' + provider) as keyof LoginI18nInterface,
    Icon: providersIcons[provider]
  })
);

export function LoginTabSwitch({ tt }: { tt: LoginI18nInterface }) {
  const userGateway = useIOC(AppUserGateway);
  const appConfig = useIOC(I.AppConfig) as SeedSrcConfigInterface;
  const [tab, setTab] = useState<LoginTab>('email');
  const [emailMode, setEmailMode] = useState<EmailMode>('password');
  const [provider, providerStore] = useAsyncStore<ProviderLoginState>();
  const [publicConfig, setPublicConfig] = useState<FePublicConfig | null>(null);
  const providerLogining = provider.loading;
  const error = providerStore.isFailed() ? String(provider.error) : null;
  /** Supabase-only SSO / OTP / phone. Default upstream keeps these enabled. */
  const supabaseUpstream =
    appConfig.oauthUpstreamProvider === oauthUpstreamProviders.supabase;

  const phoneLoginEnabled = publicConfig?.auth.phoneLoginEnabled ?? true;
  const phoneOtpProvider =
    publicConfig?.auth.phoneOtpProvider?.trim().toLowerCase() || 'memory';
  const githubOauthEnabled = publicConfig?.auth.githubOauthEnabled ?? true;
  const googleOauthEnabled = publicConfig?.auth.googleOauthEnabled ?? false;

  useStrictEffect(() => {
    void fetchPublicConfig().then(setPublicConfig);
  }, []);

  useStrictEffect(() => {
    if (!phoneLoginEnabled && tab === 'phone') {
      setTab('email');
    }
  }, [phoneLoginEnabled, tab]);

  const tabBaseClass =
    'flex-1 py-2.5 text-sm font-medium text-center transition-colors cursor-pointer border-b-2 outline-none';
  const tabActiveClass = 'border-brand text-primary-text';
  const tabInactiveClass =
    'border-transparent text-secondary-text hover:text-primary-text hover:border-primary-border';

  const onLoginWithProvider = useCallback(
    (loginProvider: LoginProviderType) => {
      void runAsyncStore(
        providerStore,
        userGateway
          .loginWithProvider({ provider: loginProvider })
          .then((result) => {
            if (result.providerUrl) {
              window.location.assign(result.providerUrl);
            }
            return result;
          })
      );
    },
    [providerStore, userGateway]
  );

  const visibleProviders = providersItems.filter((item) => {
    if (item.provider === loginProviders.GitHub) {
      return githubOauthEnabled;
    }
    if (item.provider === loginProviders.Google) {
      return googleOauthEnabled;
    }
    return true;
  });

  const showProviderBlock = supabaseUpstream && visibleProviders.length > 0;
  const showPhoneTab = supabaseUpstream && phoneLoginEnabled;

  return (
    <div data-testid="LoginTabSwitch" className="w-full">
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-800 dark:bg-red-950/30"
        >
          {error}
        </div>
      ) : null}

      {showProviderBlock
        ? visibleProviders.map(
            ({ key, provider: itemProvider, titleI18nMapKey, Icon }) => (
              <button
                data-testid={'LoginWith' + key}
                key={key}
                disabled={providerLogining}
                onClick={() => onLoginWithProvider(itemProvider)}
                title={tt[titleI18nMapKey]}
                className="mb-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24292e] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2c3137] focus:outline-none focus:ring-2 focus:ring-[#24292e] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Icon className="h-5 w-5" />
                <span>{tt[titleI18nMapKey]}</span>
              </button>
            )
          )
        : null}

      {showProviderBlock ? (
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
      ) : null}

      {showPhoneTab ? (
        <div className="mb-6 flex border-b border-primary-border">
          <button
            type="button"
            className={clsx(
              tabBaseClass,
              tab === 'email' ? tabActiveClass : tabInactiveClass
            )}
            onClick={() => setTab('email')}
            aria-selected={tab === 'email'}
            role="tab"
          >
            {tt.tabEmail}
          </button>
          <button
            type="button"
            className={clsx(
              tabBaseClass,
              tab === 'phone' ? tabActiveClass : tabInactiveClass
            )}
            onClick={() => setTab('phone')}
            aria-selected={tab === 'phone'}
            role="tab"
          >
            {tt.tabPhone}
          </button>
        </div>
      ) : null}

      {(!supabaseUpstream || tab === 'email') && (
        <>
          {emailMode === 'password' || !supabaseUpstream ? (
            <>
              <LoginForm tt={tt} />
              {supabaseUpstream && (
                <p className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setEmailMode('otp')}
                    className="text-sm text-brand hover:underline"
                  >
                    {tt.switchToOtp}
                  </button>
                </p>
              )}
            </>
          ) : (
            <>
              <EmailOTPForm tt={tt} />
              <p className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setEmailMode('password')}
                  className="text-sm text-brand hover:underline"
                >
                  {tt.switchToPassword}
                </button>
              </p>
            </>
          )}
        </>
      )}

      {showPhoneTab && tab === 'phone' ? (
        <PhoneLoginForm tt={tt} memoryOtp={phoneOtpProvider === 'memory'} />
      ) : null}
    </div>
  );
}
