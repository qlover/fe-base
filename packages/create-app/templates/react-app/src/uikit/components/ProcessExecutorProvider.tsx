import { UserAuthProvider } from './UserAuthProvider';
import { useStrictEffect } from '../hooks/useStrictEffect';
import { useI18nGuard } from '../hooks/useI18nGuard';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useNavigateBridge } from '../hooks/useNavigateBridge';
import { useIOC } from '../hooks/useIOC';

export function ProcessExecutorProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const processerExecutor = useIOC(IOCIdentifier.ProcesserExecutorInterface);

  useI18nGuard();

  useNavigateBridge();

  useStrictEffect(() => {
    processerExecutor.starup();
  }, []);

  return <UserAuthProvider>{children}</UserAuthProvider>;
}
