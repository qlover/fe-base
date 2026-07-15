'use client';

import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { LocaleLink } from '../components/LocaleLink';
import { useUserAuth } from '../hook/useUserAuth';

/**
 * Client component: Developer console button
 * Shows when user is authenticated
 */
export function DeveloperButton(props: {
  developerTitle: string;
  locale?: string;
}) {
  const { developerTitle, locale } = props;
  const { success, loading } = useUserAuth();

  if (loading || !success) return null;

  return (
    <LocaleLink
      data-testid="DeveloperButton"
      key="developer-button"
      href="/developer/apps"
      title={developerTitle}
      locale={locale}
      className="text-primary-text hover:text-primary-text-hover cursor-pointer text-lg transition-colors"
    >
      <CodeBracketIcon className="h-5 w-5 text-primary-text" />
    </LocaleLink>
  );
}
