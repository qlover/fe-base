import { Outlet } from 'react-router-dom';

/**
 * Auth layout: full-viewport container for login/signup pages.
 * Child can use full width/height for split or centered layouts.
 */
export default function AuthLayout() {
  return (
    <div data-testid="auth-layout" className="min-h-screen bg-primary">
      <Outlet />
    </div>
  );
}
