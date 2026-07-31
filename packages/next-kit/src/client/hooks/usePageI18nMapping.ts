'use client';

import { useContext } from 'react';
import type { PageI18nInterface } from '../../common/interfaces/PageI18nInterface';
import { PageI18nContext } from '../components/PageI18nContext';

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
