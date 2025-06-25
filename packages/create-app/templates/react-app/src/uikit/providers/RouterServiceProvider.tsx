import { useEffect } from 'react';
import { IOC } from '@/core/IOC';
import { useNavigate } from 'react-router-dom';
import { RouteService } from '../../base/services/RouteService';

export function RouterServiceProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    IOC(RouteService).setDependencies({ navigate });
  }, [navigate]);

  return children;
}
