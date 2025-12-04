import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { Navigate, Outlet } from 'react-router-dom';
import { useI18nGuard } from '@/uikit/hooks/useI18nGuard';
import { useIOC } from '@/uikit/hooks/useIOC';
import { BaseHeader } from '../../uikit/components/BaseHeader';

export default function Layout() {
  const userService = useIOC(IOCIdentifier.UserServiceInterface);
  const state = useStore(userService.getStore());

  useI18nGuard();

  console.log(state);
  // If user is authenticated, redirect to home page
  if (userService.isAuthenticated()) {
    return <Navigate data-testid="Layout" to="/" replace />;
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
