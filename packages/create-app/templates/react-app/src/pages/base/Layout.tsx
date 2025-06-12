import BaseHeader from './components/BaseHeader';
import { Outlet } from 'react-router-dom';
import { ProcessProvider } from '@/uikit/providers/ProcessProvider';

export default function Layout() {
  return (
    <ProcessProvider>
      <div
        data-testid="basic-layout"
        className="text-base min-h-screen bg-primary"
      >
        <BaseHeader showLogoutButton />

        <div className="text-text bg-primary">
          <Outlet />
        </div>
      </div>
    </ProcessProvider>
  );
}
