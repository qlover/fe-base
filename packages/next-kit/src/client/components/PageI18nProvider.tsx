'use client';

import type { ReactNode } from 'react';
import type { PageI18nInterface } from '../../common/interfaces/PageI18nInterface';
import { PageI18nContext } from './PageI18nContext';

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
