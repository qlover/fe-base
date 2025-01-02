import { useLanguageGuard } from '@/hooks';
import BaseHeader from './components/BaseHeader';
import { Outlet } from 'react-router-dom';

export default function BasicLayout() {
  useLanguageGuard();

  return (
    <div data-testid="basic-layout" className="text-base">
      <BaseHeader />

      <div className="text-black bg-white">
        <Outlet />
      </div>
    </div>
  );
}
