import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { Navigate, Outlet } from 'react-router-dom';
import { useIOC } from '@/uikit/hooks/useIOC';
import { useRouterI18nGuard } from '@/uikit/hooks/useRouterI18nGuard';
import { BaseHeader } from '../../uikit/components/BaseHeader';

export default function Layout() {
  const userService = useIOC(IOCIdentifier.UserServiceInterface);
  const state = useStore(userService.getStore());

  useRouterI18nGuard();

  // If user is authenticated, redirect to home page
  if (userService.isAuthenticated() && userService.isUserInfo(state.result)) {
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
