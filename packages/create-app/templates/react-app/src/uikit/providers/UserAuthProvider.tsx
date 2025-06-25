import { IOC } from '@/core/IOC';
import { Loading } from '../components/Loading';
import { UserService } from '@/base/services/UserService';

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const userService = IOC(UserService);

  if (!userService.isAuthenticated()) {
    return <Loading fullscreen />;
  }

  return children;
}
