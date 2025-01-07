import { ProcessProvider } from '@/components/ProcessProvider';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <ProcessProvider>
      <Outlet />
    </ProcessProvider>
  );
}
