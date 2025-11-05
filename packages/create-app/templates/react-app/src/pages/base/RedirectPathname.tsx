import { useIOC } from '@/uikit/hooks/useIOC';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectToDefault = () => {
  const navigate = useNavigate();
  const routeService = useIOC(IOCIdentifier.RouteServiceInterface);

  useEffect(() => {
    // Redirect to the default language path
    routeService.redirectToDefault(navigate);
  }, [navigate]);

  return null;
};

export default RedirectToDefault;
