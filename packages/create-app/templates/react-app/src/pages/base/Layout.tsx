import BaseHeader from '../../uikit/components/BaseHeader';
import { Outlet } from 'react-router-dom';
import { ProcessExecutorProvider } from '@/uikit/components/ProcessExecutorProvider';

export default function Layout() {
  return (
    <ProcessExecutorProvider>
      <div
        data-testid="basic-layout"
        className="text-base min-h-screen bg-primary"
      >
        <BaseHeader showLogoutButton />

        <div className="text-text bg-primary">
          <Outlet />
        </div>
      </div>
    </ProcessExecutorProvider>
  );
}
