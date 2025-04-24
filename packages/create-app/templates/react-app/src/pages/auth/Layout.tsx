import { IOC } from '@/core/IOC';
import { UserController } from '@/uikit/controllers/UserController';
import { Navigate, Outlet } from 'react-router-dom';
import { useSliceStore } from '@qlover/slice-store-react';

export default function Layout() {
  const userController = IOC(UserController);
  useSliceStore(userController, (state) => state.success);

  // If user is authenticated, redirect to home page
  if (userController.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
