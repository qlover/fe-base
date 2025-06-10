import { IOC } from '@/core/IOC';
import { UserService } from '@/base/services/UserService';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '@/uikit/hooks/useStore';

export default function Layout() {
  const userService = IOC(UserService);
  useStore(userService, (state) => state.success);

  // If user is authenticated, redirect to home page
  if (userService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
