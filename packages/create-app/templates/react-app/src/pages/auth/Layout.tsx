import { IOC } from '@/core/IOC';
import { UserService } from '@/base/services/UserService';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '@/uikit/hooks/useStore';
import BaseHeader from '../../uikit/components/BaseHeader';

export default function Layout() {
  const userService = IOC(UserService);
  useStore(userService.store);

  // If user is authenticated, redirect to home page
  if (userService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <BaseHeader showLogoutButton={false} />
      <div className="flex-1">
        <Outlet />
      </div>
    </>
  );
}
