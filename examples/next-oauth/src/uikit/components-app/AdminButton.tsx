'use client';

import { UserGroupIcon } from '@heroicons/react/24/outline';
import { ROUTE_ADMIN } from '@config/route';
import { LocaleLink } from '../components/LocaleLink';
import { usePlatformAdmin } from '../hook/usePlatformAdmin';
import { useUserAuth } from '../hook/useUserAuth';

/**
 * 后台入口：仅平台管理员可见。页面进入由 middleware 闸门负责。
 */
export function AdminButton(props: { adminTitle: string; locale?: string }) {
  const { adminTitle, locale } = props;
  const { success, loading } = useUserAuth();
  const { platformAdmin } = usePlatformAdmin();

  if (loading || !success || !platformAdmin) return null;

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
