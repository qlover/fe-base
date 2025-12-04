import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { Loading } from './Loading';
import { useIOC } from '../hooks/useIOC';

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const userService = useIOC(IOCIdentifier.UserServiceInterface);

  useStore(userService.getStore());

  if (!userService.isAuthenticated()) {
    return <Loading data-testid="UserAuthProvider" fullscreen />;
  }

  return children;
}
