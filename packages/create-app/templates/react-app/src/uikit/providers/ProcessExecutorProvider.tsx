import { UserAuthProvider } from './UserAuthProvider';
import { useStrictEffect } from '../hooks/useStrictEffect';
import { IOC } from '@/core/IOC';
import { ProcesserExecutor } from '@/base/services/ProcesserExecutor';
import { useI18nGuard } from '../hooks/useI18nGuard';
import { useRouterService } from '../hooks/userRouterService';

export function ProcessExecutorProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const processerExecutor = IOC(ProcesserExecutor);

  useI18nGuard();

  useRouterService();

  useStrictEffect(() => {
    processerExecutor.starup();
  }, []);

  return <UserAuthProvider>{children}</UserAuthProvider>;
}
