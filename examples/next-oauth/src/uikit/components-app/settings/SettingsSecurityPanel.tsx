'use client';

import { ChangePasswordForm } from '@/uikit/components-app/account/ChangePasswordForm';
import { useUserAuth } from '@/uikit/hook/useUserAuth';
import { toBusinessEmail } from '@shared/utils/phoneUserIdentity';
import type { AccountI18nInterface } from '@config/i18n-mapping/accountI18n';
import type { ReactNode } from 'react';

/**
 * 安全分区：复用改密表单。
 */
export function SettingsSecurityPanel({
  tt
}: {
  readonly tt: AccountI18nInterface;
}): ReactNode {
  const { user } = useUserAuth();
  const email = toBusinessEmail(user?.email) ?? '';

  return (
    <div data-testid="SettingsSecurityPanel" className="space-y-4">
      <h2 className="text-primary-text text-base font-semibold">
        {tt.passwordSectionTitle}
      </h2>
      {email ? (
        <ChangePasswordForm
          labels={{
            description: tt.passwordDescription,
            noPasswordHint: tt.passwordNoPasswordHint,
            currentPlaceholder: tt.passwordCurrentPlaceholder,
            newPlaceholder: tt.passwordNewPlaceholder,
            confirmPlaceholder: tt.passwordConfirmPlaceholder,
            submit: tt.passwordSubmit,
            success: tt.passwordSuccess,
            errorFallback: tt.passwordError,
            invalid: tt.passwordInvalid,
            mismatch: tt.passwordMismatch,
            same: tt.passwordSame
          }}
        />
      ) : (
        <p className="text-secondary-text text-sm">
          {tt.passwordEmailRequired}
        </p>
      )}
    </div>
  );
}
