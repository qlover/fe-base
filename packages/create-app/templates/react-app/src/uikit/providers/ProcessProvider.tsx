import { createContext, useEffect } from 'react';
import { pageProcesser, routerController, userController } from '@/core';
import { useLanguageGuard } from '@/uikit/hooks/useLanguageGuard';
import { useStrictEffect } from '@/uikit/hooks/useStrictEffect';
import { ProcesserService } from '@/base/services/processer/ProcesserService';
import { Navigate, useNavigate } from 'react-router-dom';
import { useControllerState } from '@lib/fe-react-controller';
import { Loading } from '@/components/Loading';

const PageProcesserContext = createContext<ProcesserService>(pageProcesser);

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
