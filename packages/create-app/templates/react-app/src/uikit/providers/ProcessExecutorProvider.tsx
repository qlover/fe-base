import { UserAuthProvider } from './UserAuthProvider';
import { useStrictEffect } from '../hooks/useStrictEffect';
import { IOC } from '@/core/IOC';
import { useI18nGuard } from '../hooks/useI18nGuard';
import { useRouterService } from '../hooks/userRouterService';
import { IOCIdentifier } from '@config/IOCIdentifier';

export function ProcessExecutorProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const processerExecutor = IOC(IOCIdentifier.ProcesserExecutorInterface);

  useI18nGuard();

  useRouterService();

  useStrictEffect(() => {
    processerExecutor.starup();
  }, []);

  return <UserAuthProvider>{children}</UserAuthProvider>;
}
