import { createContext, useEffect } from 'react';
import { IOC } from '@/core/IOC';
import { useLanguageGuard } from '@/uikit/hooks/useLanguageGuard';
import { useStrictEffect } from '@/uikit/hooks/useStrictEffect';
import { ProcesserService } from '@/base/services/ProcesserService';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loading } from '@/uikit/components/Loading';
import { RouteService } from '../../base/services/RouteService';
import { UserService } from '../../base/services/UserService';
import { useStore } from '@/uikit/hooks/useStore';

const PageProcesserContext = createContext<ProcesserService>(
  IOC(ProcesserService)
);

export function ProcessProvider({ children }: { children: React.ReactNode }) {
  useLanguageGuard();
  const userService = IOC(UserService);
  const pageProcesser = IOC(ProcesserService);
  const success = useStore(userService, (state) => state.success);

  const navigate = useNavigate();

  useStrictEffect(() => {
    pageProcesser.init();
  }, []);

  useEffect(() => {
    IOC(RouteService).setDependencies({ navigate });
  }, [navigate]);

  if (!success) {
    return <Loading fullscreen />;
  }

  if (!userService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return (
    <PageProcesserContext.Provider value={pageProcesser}>
      {children}
    </PageProcesserContext.Provider>
  );
}
