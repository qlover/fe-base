import { IOC } from '@/core/IOC';
import { UserService } from '@/base/services/UserService';
import { Navigate, Outlet } from 'react-router-dom';
import { useSliceStore } from '@qlover/slice-store-react';

export default function Layout() {
  const userService = IOC(UserService);
  useSliceStore(userService, (state) => state.success);

  // If user is authenticated, redirect to home page
  if (userService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
