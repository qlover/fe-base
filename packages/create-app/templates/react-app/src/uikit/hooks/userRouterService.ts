import { RouteService } from '@/base/services/RouteService';
import { IOC } from '@/core/IOC';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRouterService() {
  const navigate = useNavigate();

  useEffect(() => {
    IOC(RouteService).setDependencies({ navigate });
  }, [navigate]);
}
