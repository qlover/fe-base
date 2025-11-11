import { Outlet } from 'react-router-dom';
import { ProcessExecutorProvider } from '@/uikit/components/ProcessExecutorProvider';
import { BaseHeader } from '../../uikit/components/BaseHeader';

export default function Layout() {
  return (
    <ProcessExecutorProvider data-testid="Layout">
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
