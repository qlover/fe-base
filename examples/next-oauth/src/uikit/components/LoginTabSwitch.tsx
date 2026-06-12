'use client';

import { GithubOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { EmailOTPForm } from '@/uikit/components/EmailOTPForm';
import { LoginForm } from '@/uikit/components/LoginForm';
import { PhoneLoginForm } from '@/uikit/components/PhoneLoginForm';
import type { LoginI18nInterface } from '@config/i18n-mapping/loginI18n';

type LoginTab = 'email' | 'phone';
type EmailMode = 'password' | 'otp';

export function LoginTabSwitch({ tt }: { tt: LoginI18nInterface }) {
  const [tab, setTab] = useState<LoginTab>('email');
  const [emailMode, setEmailMode] = useState<EmailMode>('password');
  const [error, setError] = useState<string | null>(null);

  const tabBaseClass =
    'flex-1 py-2.5 text-sm font-medium text-center transition-colors cursor-pointer border-b-2 outline-none';
  const tabActiveClass = 'border-brand text-primary-text';
  const tabInactiveClass =
    'border-transparent text-secondary-text hover:text-primary-text hover:border-primary-border';

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

      <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24292e] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2c3137] focus:outline-none focus:ring-2 focus:ring-[#24292e] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 mb-6">
        <GithubOutlined className="text-lg" />
        <span>{tt.withGitHub}</span>
      </button>

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
