'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PageI18nInterface } from '../../common/interfaces/PageI18nInterface';

const PageI18nContext = createContext<PageI18nInterface | null>(null);

/**
 * Provide a resolved page i18n bag to client descendants.
 */
export function PageI18nProvider({
  children,
  value
}: {
  children: ReactNode;
  readonly value: PageI18nInterface;
}): React.ReactElement {
  return (
    <PageI18nContext.Provider value={value}>
      {children}
    </PageI18nContext.Provider>
  );
}

/**
 * Read the current page's resolved i18n mapping.
 */
export function usePageI18nMapping<T extends PageI18nInterface>(): T {
  const tt = useContext(PageI18nContext);
  if (tt === null) {
    throw new Error(
      'usePageI18nMapping must be used within PageI18nProvider'
    );
  }

  return tt as T;
}
