
import { Loading } from './Loading';
import { useStore } from '../hooks/useStore';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '../hooks/useIOC';

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const userService = useIOC(IOCIdentifier.UserServiceInterface);

  useStore(userService.store);

  if (!userService.isAuthenticated()) {
    return <Loading fullscreen />;
  }

  return children;
}
