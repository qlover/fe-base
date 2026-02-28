'use client';

import { TeamOutlined } from '@ant-design/icons';
import { LocaleLink } from '../components/LocaleLink';
import { useUserAuth } from '../hook/useUserAuth';

/**
 * Client component: uses user store from bootstrap (one session fetch in restoreUserService).
 * Avoids ServerAuth/cookies on the server so pages using this can be statically generated.
 */
export function AdminButton(props: { adminTitle: string; locale?: string }) {
  const { adminTitle, locale } = props;
  const { success, loading } = useUserAuth();

  if (loading || !success) return null;

  return (
    <LocaleLink
      data-testid="AdminButton"
      key="admin-button"
      href="/admin"
      title={adminTitle}
      locale={locale}
      className="text-primary-text hover:text-primary-text-hover cursor-pointer text-lg transition-colors"
    >
      <TeamOutlined className="text-lg text-primary-text" />
    </LocaleLink>
  );
}
