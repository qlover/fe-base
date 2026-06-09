'use client';

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

  const tabBaseClass =
    'flex-1 py-2.5 text-sm font-medium text-center transition-colors cursor-pointer border-b-2 outline-none';
  const tabActiveClass = 'border-brand text-primary-text';
  const tabInactiveClass =
    'border-transparent text-secondary-text hover:text-primary-text hover:border-primary-border';

  return (
    <div data-testid="LoginTabSwitch" className="w-full">
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
