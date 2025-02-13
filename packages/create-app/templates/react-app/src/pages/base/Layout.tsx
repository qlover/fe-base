import BaseHeader from './components/BaseHeader';
import { Outlet } from 'react-router-dom';
import { ProcessProvider } from '@/uikit/providers/ProcessProvider';

export default function Layout() {
  return (
    <ProcessProvider>
      <div data-testid="basic-layout" className="text-base">
        <BaseHeader />

        <div className="text-black bg-white">
          <Outlet />
        </div>
      </div>
    </ProcessProvider>
  );
}
