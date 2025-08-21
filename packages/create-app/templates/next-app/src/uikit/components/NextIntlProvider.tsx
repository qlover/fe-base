import { NextIntlClientProvider, useMessages } from 'next-intl';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  locale: string;
};

export function NextIntlProvider({ children, locale }: Props) {
  const messages = useMessages();
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
