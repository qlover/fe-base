import { IOC } from '@/core';
import { UserController } from '@/uikit/controllers/UserController';
import { useController } from '@lib/fe-react-controller';
import { Navigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const controller = useController(IOC(UserController));

  // If user is authenticated, redirect to home page
  if (controller.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
