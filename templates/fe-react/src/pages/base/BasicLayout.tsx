import { Outlet } from 'react-router-dom';

export default function BasicLayout() {
  return (
    <div data-testid="basic-layout" className="text-base">
      <Outlet />
    </div>
  );
}
