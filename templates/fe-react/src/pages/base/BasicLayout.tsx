import BaseHeader from './components/BaseHeader';
import { Outlet } from 'react-router-dom';
import { ProcessProvider } from '@/components/ProcessProvider';

export default function BasicLayout() {
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
