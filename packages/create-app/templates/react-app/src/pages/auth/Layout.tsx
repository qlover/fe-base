import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import BaseHeader from '../../uikit/components/BaseHeader';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '@/uikit/hooks/useIOC';

export default function Layout() {
  const userService = useIOC(IOCIdentifier.UserServiceInterface);
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
