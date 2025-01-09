import { createContext, useEffect } from 'react';
import { pageProcesser, routerController, userController } from '@/container';
import { useLanguageGuard } from '@/hooks/useLanguageGuard';
import { useStrictEffect } from '@/hooks/useStrictEffect';
import { PageProcesser } from '@/services/pageProcesser';
import { Navigate, useNavigate } from 'react-router-dom';
import { useControllerState } from '@lib/fe-react-controller';
import { Loading } from './Loading';

const PageProcesserContext = createContext<PageProcesser>(pageProcesser);

export function ProcessProvider({ children }: { children: React.ReactNode }) {
  useLanguageGuard();
  const { success } = useControllerState(userController);

  const navigate = useNavigate();

  useStrictEffect(() => {
    pageProcesser.init();
  }, []);

  useEffect(() => {
    routerController.setDependencies({
      navigate
    });
  }, [navigate]);

  if (!success) {
    return <Loading fullscreen />;
  }

  if (!userController.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return (
    <PageProcesserContext.Provider value={pageProcesser}>
      {children}
    </PageProcesserContext.Provider>
  );
}
