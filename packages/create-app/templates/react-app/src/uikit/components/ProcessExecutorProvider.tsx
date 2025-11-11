import { IOCIdentifier } from '@config/IOCIdentifier';
import { UserAuthProvider } from './UserAuthProvider';
import { useI18nGuard } from '../hooks/useI18nGuard';
import { useIOC } from '../hooks/useIOC';
import { useNavigateBridge } from '../hooks/useNavigateBridge';
import { useStrictEffect } from '../hooks/useStrictEffect';

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

  return (
    <UserAuthProvider data-testid="ProcessExecutorProvider">
      {children}
    </UserAuthProvider>
  );
}
