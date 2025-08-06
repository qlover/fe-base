import { IOC } from '@/core/IOC';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRouterService() {
  const navigate = useNavigate();

  useEffect(() => {
    IOC(IOCIdentifier.RouteServiceInterface).setDependencies({ navigate });
  }, [navigate]);
}
