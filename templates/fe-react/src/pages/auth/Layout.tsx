import { userController } from '@/container';
import { useController } from '@lib/fe-react-controller';
import { Navigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const controller = useController(userController);

  if (controller.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
