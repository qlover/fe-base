import { createContext, useEffect } from 'react';
import { IOC } from '@/core';
import { useLanguageGuard } from '@/uikit/hooks/useLanguageGuard';
import { useStrictEffect } from '@/uikit/hooks/useStrictEffect';
import { ProcesserService } from '@/base/services/processer/ProcesserService';
import { Navigate, useNavigate } from 'react-router-dom';
import { useControllerState } from '@lib/fe-react-controller';
import { Loading } from '@/components/Loading';
import { RouterController } from '../controllers/RouterController';
import { UserController } from '../controllers/UserController';

const PageProcesserContext = createContext<ProcesserService>(
  IOC(ProcesserService)
);

export function ProcessProvider({ children }: { children: React.ReactNode }) {
  useLanguageGuard();
  const userController = IOC(UserController);
  const pageProcesser = IOC(ProcesserService);
  const { success } = useControllerState(userController);

  const navigate = useNavigate();

  useStrictEffect(() => {
    pageProcesser.init();
  }, []);

  useEffect(() => {
    IOC(RouterController).setDependencies({
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
