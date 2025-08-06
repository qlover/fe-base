import { IOC } from '@/core/IOC';
import { Loading } from '../components/Loading';
import { useStore } from '../hooks/useStore';
import { IOCIdentifier } from '@config/IOCIdentifier';

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const userService = IOC(IOCIdentifier.UserServiceInterface);

  useStore(userService.store);

  if (!userService.isAuthenticated()) {
    return <Loading fullscreen />;
  }

  return children;
}
