import { RouterServiceProvider } from './RouterServiceProvider';
import { I18nGuideProvider } from './I18nGuideProvider';
import { UserAuthProvider } from './UserAuthProvider';
import { useStrictEffect } from '../hooks/useStrictEffect';
import { IOC } from '@/core/IOC';
import { ProcesserExecutor } from '@/base/services/ProcesserExecutor';
import { UserService } from '@/base/services/UserService';
import { useStore } from '../hooks/useStore';
import { Loading } from '../components/Loading';

export function ProcessExecutorProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const processerExecutor = IOC(ProcesserExecutor);
  const userService = IOC(UserService);

  useStore(userService);

  useStrictEffect(() => {
    processerExecutor.starup();
  }, []);

  return (
    <RouterServiceProvider>
      <I18nGuideProvider>
        <UserAuthProvider>
          {!userService.isAuthenticated() ? <Loading fullscreen /> : children}
        </UserAuthProvider>
      </I18nGuideProvider>
    </RouterServiceProvider>
  );
}
