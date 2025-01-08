import { userController } from '@/container';
import { useController } from '@lib/fe-react-controller';
import { Navigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const controller = useController(userController);

  // 如果已经登录，重定向到首页
  if (!controller.isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
