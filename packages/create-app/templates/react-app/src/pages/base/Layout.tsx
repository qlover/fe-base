import { Outlet } from 'react-router-dom';
import { BaseLayoutProvider } from '@/uikit/components/BaseLayoutProvider';
import { BaseHeader } from '../../uikit/components/BaseHeader';

export default function Layout() {
  return (
    <BaseLayoutProvider>
      <div
        data-testid="basic-layout"
        className="text-base min-h-screen bg-primary"
      >
        <BaseHeader showLogoutButton />

        <div className="text-text bg-primary">
          <Outlet />
        </div>
      </div>
    </BaseLayoutProvider>
  );
}
