'use client';

import { NextIntlClientProvider, useMessages } from 'next-intl';

/**
 * Client component wrapper to merge admin i18n messages
 * NextIntlClientProvider supports nesting and will merge messages from parent provider
 */
export function AdminI18nProvider({
  children,
  locale,
  adminMessages
}: {
  children: React.ReactNode;
  locale: string;
  adminMessages: Record<string, string>;
}) {
  // Get existing messages from parent NextIntlClientProvider (includes common, api)
  const existingMessages = useMessages();

  // Merge admin messages with existing messages
  // Admin messages will override any existing keys with the same name
  const mergedMessages = {
    ...existingMessages,
    ...adminMessages
  };

  return (
    <NextIntlClientProvider
      data-testid="AdminI18nProvider"
      locale={locale}
      messages={mergedMessages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
