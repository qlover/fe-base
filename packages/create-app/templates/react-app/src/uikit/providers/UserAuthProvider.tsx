import { IOC } from '@/core/IOC';
import { Loading } from '../components/Loading';
import { UserService } from '@/base/services/UserService';
import { useStore } from '../hooks/useStore';

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const userService = IOC(UserService);

  useStore(userService.store);

  if (!userService.isAuthenticated()) {
    return <Loading fullscreen />;
  }

  return children;
}
