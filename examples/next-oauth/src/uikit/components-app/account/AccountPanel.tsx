'use client';

import { type ReactNode } from 'react';
import { ChangePasswordForm } from '@/uikit/components-app/account/ChangePasswordForm';
import { useUserAuth } from '@/uikit/hook/useUserAuth';
import { isPhonePlaceholderEmail } from '@shared/utils/phoneUserIdentity';
import {
  maskPhoneForDisplay,
  resolveUserDisplayLabel
} from '@shared/utils/userIdentity';
import type { AccountI18nInterface } from '@config/i18n-mapping/accountI18n';

function FieldRow(props: { label: string; children: ReactNode }) {
  return (
    <div
      data-testid="FieldRow"
      className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4"
    >
      <dt className="w-28 shrink-0 text-sm text-secondary-text">
        {props.label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm font-medium text-primary-text">
        {props.children}
      </dd>
    </div>
  );
}

export function AccountPanel({ tt }: { tt: AccountI18nInterface }) {
  const { user, loading, success } = useUserAuth();

  if (loading && !user) {
    return (
      <div
        data-testid="AccountPanel"
        className="animate-pulse rounded-2xl border border-primary-border bg-elevated/40 p-6"
      >
        <div className="mb-4 h-5 w-32 rounded bg-elevated" />
        <div className="space-y-3">
          <div className="h-4 w-full max-w-sm rounded bg-elevated" />
          <div className="h-4 w-2/3 max-w-xs rounded bg-elevated" />
        </div>
      </div>
    );
  }

  if (!success || !user) {
    return null;
  }

  const rawEmail = user.email?.trim() ?? '';
  const email = isPhonePlaceholderEmail(rawEmail) ? '' : rawEmail;
  const phone = user.phone?.trim() ?? '';
  const displayName = resolveUserDisplayLabel({
    name: user.name,
    phone,
    email,
    userId: user.id
  });

  return (
    <div
      data-testid="AccountPanel"
      className="flex w-full max-w-3xl flex-col gap-6"
    >
      <section className="rounded-2xl border border-primary-border bg-primary p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-primary-text">
          {tt.sectionTitle}
        </h2>
        <dl className="space-y-3">
          <FieldRow label={tt.displayNameLabel}>
            <span className="break-all">{displayName || tt.valueEmpty}</span>
          </FieldRow>
          <FieldRow label={tt.phoneLabel}>
            <span className="break-all">
              {phone ? maskPhoneForDisplay(phone) : tt.valueEmpty}
            </span>
          </FieldRow>
          <FieldRow label={tt.emailLabel}>
            <span className="break-all">{email || tt.valueEmpty}</span>
          </FieldRow>
          <FieldRow label={tt.userIdLabel}>
            <span className="break-all">{user.id || tt.valueEmpty}</span>
          </FieldRow>
        </dl>
      </section>

      <section className="rounded-2xl border border-primary-border bg-primary p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-primary-text">
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
          <p className="text-sm text-secondary-text">
            {tt.passwordEmailRequired}
          </p>
        )}
      </section>
    </div>
  );
}
