import { createContext, useEffect } from 'react';
import { pageProcesser, routerController } from '@/container';
import { useLanguageGuard } from '@/hooks';
import { PageProcesser } from '@/services/pageProcesser';
import { useNavigate } from 'react-router-dom';

const PageProcesserContext = createContext<PageProcesser>(pageProcesser);

export function ProcessProvider({ children }: { children: React.ReactNode }) {
  useLanguageGuard();

  const navigate = useNavigate();

  useEffect(() => {
    routerController.setDependencies({
      navigate
    });
  }, [navigate]);

  return (
    <PageProcesserContext.Provider value={pageProcesser}>
      {children}
    </PageProcesserContext.Provider>
  );
}
