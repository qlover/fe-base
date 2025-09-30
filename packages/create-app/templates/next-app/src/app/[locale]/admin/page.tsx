'use client';

import { ClientSeo } from '@/uikit/components/ClientSeo';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { admin18n } from '@config/i18n';

export default function AdminPage() {
  const tt = useI18nInterface(admin18n);

  return (
    <>
      <ClientSeo i18nInterface={tt} />
      <div data-testid="AdminPageWrapper">
        <div data-testid="AdminPage">
          <h1>{tt.welcome}</h1>
        </div>
      </div>
    </>
  );
}
