import { RouteService } from '@/base/services/RouteService';
import { IOC } from '@/core/IOC';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectToDefault = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the default language path
    IOC(RouteService).redirectToDefault(navigate);
  }, [navigate]);

  return null;
};

export default RedirectToDefault;
