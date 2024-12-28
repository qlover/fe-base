import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

function useLanguageGuard() {
  const { lng } = useParams<{ lng: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (lng !== 'en' && lng !== 'zh') {
      navigate('/404', { replace: true });
    }
  }, [lng, navigate]);
}

export default function BasicLayout() {
  useLanguageGuard();

  return (
    <div data-testid="basic-layout" className="text-base">
      <Outlet />
    </div>
  );
}
