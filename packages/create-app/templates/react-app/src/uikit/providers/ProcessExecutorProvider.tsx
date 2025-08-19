import { UserAuthProvider } from './UserAuthProvider';
import { useStrictEffect } from '../hooks/useStrictEffect';
import { IOC } from '@/core/IOC';
import { ProcesserExecutor } from '@/base/services/ProcesserExecutor';
import { useI18nGuard } from '../hooks/useI18nGuard';
import { useNavigateBridge } from '../hooks/useNavigateBridge';

export function ProcessExecutorProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const processerExecutor = IOC(ProcesserExecutor);

  useI18nGuard();

  useNavigateBridge();

  useStrictEffect(() => {
    processerExecutor.starup();
  }, []);

  return <UserAuthProvider>{children}</UserAuthProvider>;
}
