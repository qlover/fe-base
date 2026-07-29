'use client';

import { UserGroupIcon } from '@heroicons/react/24/outline';
import { ROUTE_ADMIN } from '@config/route';
import { LocaleLink } from '../components/LocaleLink';
import { useUserAuth } from '../hook/useUserAuth';

/**
 * Admin console entry affordance: local UI only.
 *
 * Hidden while user store is loading or unauthenticated; does not gate the page.
 * Page entry for `/admin` is middleware via LOGINED_PAGES.
 */
export function AdminButton(props: { adminTitle: string; locale?: string }) {
  const { adminTitle, locale } = props;
  const { success, loading } = useUserAuth();

  if (loading || !success) return null;

  return (
    <LocaleLink
      data-testid="AdminButton"
      key="admin-button"
      href={ROUTE_ADMIN}
      title={adminTitle}
      locale={locale}
      className="text-primary-text hover:text-primary-text-hover cursor-pointer text-lg transition-colors"
    >
      <UserGroupIcon className="h-5 w-5 text-primary-text" />
    </LocaleLink>
  );
}
