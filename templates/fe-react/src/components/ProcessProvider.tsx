import { createContext } from 'react';
import { pageProcesser } from '@/container';
import { useLanguageGuard } from '@/hooks';
import { PageProcesser } from '@/services/pageProcesser';

const PageProcesserContext = createContext<PageProcesser>(pageProcesser);

export function ProcessProvider({ children }: { children: React.ReactNode }) {
  useLanguageGuard();

  return (
    <PageProcesserContext.Provider value={pageProcesser}>
      {children}
    </PageProcesserContext.Provider>
  );
}
