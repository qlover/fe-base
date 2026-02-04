import { Outlet } from 'react-router-dom';

export default function BaseLayout() {
  return (
    <div
      data-testid="basic-layout"
      className="text-base min-h-screen bg-primary"
    >
      <div className="text-text bg-primary">
        <Outlet />
      </div>
    </div>
  );
}
