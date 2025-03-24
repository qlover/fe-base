import { useController } from '@qlover/fe-prod/react/userController';
import { IOC } from '@/core/IOC';
import { UserController } from '@/uikit/controllers/UserController';
import { Navigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const controller = useController(IOC(UserController));

  // If user is authenticated, redirect to home page
  if (controller.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
